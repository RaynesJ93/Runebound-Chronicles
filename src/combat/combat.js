// Real-time overworld combat, run on the 0.6 s game tick.
//
// Player: tap an enemy -> walk until in range (next to it for melee; within
// the weapon's range with a clear line of sight for bows and spells), then
// attack every `speed` ticks until it dies or you do something else.
// Arrows and spells fly as projectiles and land a moment later.
// Enemies: wander near their spawn; when attacked (or, if aggressive, when you
// come close) they fight back and chase you; if you lead them too far from
// home they give up, walk back and heal.

import { resolveAttack, combatLevel } from './formulas.js';
import { findPath } from '../world/pathfinding.js';
import { styleById, rangedStyleById } from '../skills/skills.js';
import { spellById } from '../../data/spells.js';
import { ITEMS } from '../../data/items.js';
import { GROUND } from '../world/area.js';

const UNARMED_SPEED = 4; // ticks between punches
const REGEN_TICKS = 10; // out of combat: 1 hitpoint every 6 seconds
const CALM_SECONDS = 6; // how long after the last hit before healing starts
const SPLAT_LIFE = 1.2; // seconds a damage splat stays up
const XP_PER_DAMAGE = 4;
const HP_XP_PER_DAMAGE = 4 / 3;

const adjacent = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const DIRS8 = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
const DIRS4 = DIRS8.slice(0, 4);

export class Combat {
  // on: { message(text), playerDied(), enemyDied(enemy), cantReach() }
  constructor({ state, player, rng, on, skills, equipment, inventory }) {
    this.gear = equipment;
    this.inv = inventory;
    this.projectiles = []; // { kind, from: {x, y} world tiles, to: enemy, start, end }
    this.pending = []; // hits in flight: { target, dmg, at (tick), mode, spell }
    this.ticks = 0;
    this.state = state;
    this.book = skills;
    this.player = player;
    this.rng = rng;
    this.on = on;
    this.area = null;
    this.enemies = [];
    this.target = null;
    this.cooldown = 0;
    this.regen = 0;
    this.splats = [];
    this.playerLastHit = -99;
    this.playerLungeAt = -99;
    this.playerAttackKind = 'slash'; // which attack animation to show: slash, bow or cast
    this.now = 0;
    // Boss slams on their way down: { by, tiles: [{x, y}], at (tick), start (seconds), land (seconds), dmg: [min, max] }
    this.warnings = [];
    this.impacts = []; // slams that just landed, for the shockwave: { x, y, time }
  }

  // ---- Player stats, from the skills you've trained -------------------------------
  // Your levels including any potion boosts (state.boosts).
  get skills() {
    const lv = this.book.levels();
    for (const [k, v] of Object.entries(this.state.boosts || {})) if (v > 0 && k !== 'hitpoints') lv[k] += v;
    return lv;
  }
  get style() { return styleById(this.state.settings.attackStyle); }
  get rangedStyle() { return rangedStyleById(this.state.settings.rangedStyle); }
  get spell() { return spellById(this.state.settings.spell); }
  get weapon() { return this.gear ? this.gear.weapon : { style: 'melee', range: 1, speed: UNARMED_SPEED, type: 'crush' }; }
  get mode() { return this.weapon.style; }

  // How far away you can attack from.
  get range() {
    const w = this.weapon;
    if (w.style === 'melee') return 1;
    return w.range + (w.style === 'ranged' ? this.rangedStyle.range || 0 : 0);
  }

  get speed() {
    const w = this.weapon;
    return Math.max(2, w.speed + (w.style === 'ranged' ? this.rangedStyle.speed || 0 : 0));
  }

  // Projectiles fly over water, but not through trees, rocks or walls.
  lineOfSight(a, b) {
    const n = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let i = 1; i < n; i++) {
      const x = Math.round(a.x + ((b.x - a.x) * i) / n);
      const y = Math.round(a.y + ((b.y - a.y) * i) / n);
      if (!this.area.isWalkable(x, y)) {
        const g = this.area.groundAt(x, y);
        if (g !== GROUND.WATER && g !== GROUND.BRIDGE) return false;
      }
    }
    return true;
  }

  inRange(from, to) {
    if (this.mode === 'melee') return adjacent(from, to);
    const d = cheb(from, to);
    return d >= 1 && d <= this.range && this.lineOfSight(from, to);
  }
  // Your accuracy bonus for your weapon's attack type, and strength bonus.
  meleeBonuses() {
    if (!this.gear) return { attackBonus: 0, strengthBonus: 0 };
    const b = this.gear.bonuses();
    return { attackBonus: b.att[this.gear.weapon.type], strengthBonus: b.str };
  }

  // Defensive / Longrange styles make you a little harder to hit.
  defenceStyleBonus() {
    if (this.mode === 'melee') return this.style.bonus.defence || 0;
    if (this.mode === 'ranged') return this.rangedStyle.bonus.defence || 0;
    return 0;
  }

  // Your armour's defence bonus against one attack type.
  defenceAgainst(type) {
    return this.gear ? this.gear.bonuses().def[type] : 0;
  }

  // Combat level as it would be with one skill at a different level (for "your combat level is now..." messages).
  levelFrom(skill, level) { return combatLevel({ ...this.book.levels(), [skill]: level }); }
  get maxHp() { return this.book.level('hitpoints'); }
  get level() { return combatLevel(this.book.levels()); }
  get hp() { return this.state.player.hp; }
  get inCombat() { return !!this.target || this.enemies.some((e) => !e.dead && e.state === 'fight'); }

  setWorld(area, enemies) {
    for (const e of this.enemies) if (!e.dead && e.state === 'fight') { e.state = 'return'; this.bossReset(e); }
    this.area = area;
    this.enemies = enemies;
    this.target = null;
    this.pending = [];
    this.projectiles = [];
    this.warnings = [];
  }

  attack(enemy) {
    if (!enemy || enemy.dead) return;
    this.target = enemy;
    this.approach(true);
  }

  stop() {
    this.target = null;
  }

  // Walk to a tile right next to the target.
  approach(first = false) {
    const t = this.target;
    if (!t) return;
    const p = this.player;
    const s = p.pathStart;
    const g = t.standTile;
    if (this.inRange(s, g)) { p.setPath([]); return; }
    const path = findPath(this.area, s.x, s.y, (x, y) => this.inRange({ x, y }, g));
    if (path) p.setPath(path);
    else if (first) { this.target = null; this.on.cantReach?.(); }
  }

  // ---- The tick --------------------------------------------------------------------
  tick(now) {
    this.now = now;
    const st = this.state;
    const p = this.player;
    this.splats = this.splats.filter((s) => now - s.time < SPLAT_LIFE);

    // Health comes back slowly, but only once you're out of combat.
    const lastAction = Math.max(this.playerLastHit, this.playerLungeAt);
    const calm = !this.inCombat && now - lastAction >= CALM_SECONDS;
    if (st.player.hp < this.maxHp && calm) {
      if (++this.regen >= REGEN_TICKS) { st.player.hp++; this.regen = 0; this.on.healed?.(); }
    } else this.regen = 0;

    if (this.cooldown > 0) this.cooldown--;

    const t = this.target;
    if (t) {
      if (t.dead) this.target = null;
      else if (!p.moving && this.inRange(p.tile, t.standTile)) {
        p.setPath([]);
        p.faceTowards(t.standTile.x, t.standTile.y);
        if (this.cooldown <= 0) {
          const fired = this.mode === 'ranged' ? this.shoot(t) : this.mode === 'magic' ? this.cast(t) : (this.playerSwing(t), true);
          if (fired) this.cooldown = this.speed;
        }
      } else this.approach();
    }

    // Arrows and spells landing this tick.
    this.ticks++;
    this.projectiles = this.projectiles.filter((pr) => now < pr.end + (pr.kind === 'arrow' ? 0.05 : 0.35)); // spells linger a moment to splash
    const landing = this.pending.filter((h) => h.at <= this.ticks);
    this.pending = this.pending.filter((h) => h.at > this.ticks);
    for (const h of landing) this.land(h);

    this.landSlams();
    for (const e of this.enemies) this.enemyTick(e);
    // Summoned adds vanish once they've fallen (after their fade-out).
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.summoned && e.dead && now - e.diedAt > 1) this.enemies.splice(i, 1);
    }
    this.impacts = this.impacts.filter((s) => now - s.time < 0.6);
  }

  // ---- Bosses (def.mechanics) --------------------------------------------------------
  // Runs on the boss's turn while it's fighting. Returns true if the boss used
  // its turn on a mechanic (so it doesn't also swing).
  bossTick(e) {
    const m = e.def.mechanics;
    const b = (e.boss ||= { phase: 1, cried: [], slamIn: m.slamEvery, pinned: 0 });
    const frac = e.hp / e.maxHp;
    if (b.phase === 1 && m.phase2At && frac <= m.phase2At) {
      b.phase = 2;
      b.slamIn = Math.min(b.slamIn, 3);
      this.on.message?.(m.phase2Text || `The ${e.def.name} is enraged!`);
      this.on.bossEvent?.(e, 'phase2');
    }
    for (const thr of m.warCry || []) {
      if (b.cried.includes(thr) || frac > thr) continue;
      b.cried.push(thr);
      this.on.message?.(m.warCryText || `The ${e.def.name} roars for help!`);
      this.on.summon?.(e, m.adds, m.addCount || 2);
    }
    if (b.pinned > 0) { b.pinned--; return true; }
    if (m.slamEvery && --b.slamIn <= 0) {
      b.slamIn = b.phase === 2 ? m.slamEvery2 || m.slamEvery : m.slamEvery;
      const pt = this.player.moving ? this.player.to : this.player.tile;
      const tiles = [];
      // 'plus': your tile and the four next to it (one diagonal step gets you clear); 'square': all nine
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (m.slamShape !== 'square' && dx && dy) continue;
        const t = { x: pt.x + dx, y: pt.y + dy };
        if (this.area.inBounds(t.x, t.y) && this.area.isWalkable(t.x, t.y)) tiles.push(t);
      }
      const wind = m.slamWindup || 4;
      this.warnings.push({ by: e, tiles, at: this.ticks + wind, start: this.now, land: this.now + wind * 0.6, dmg: b.phase === 2 ? m.slamDmg2 || m.slamDmg : m.slamDmg });
      this.on.message?.(m.slamText || `The ${e.def.name} raises its fists. Get off the red ground!`);
      e.lungeAt = this.now;
      e.cooldown = Math.max(e.cooldown, wind);
      return true;
    }
    return false;
  }

  // Slams whose time has come: hit you if you're still on a red tile.
  landSlams() {
    const due = this.warnings.filter((w) => w.at <= this.ticks);
    if (!due.length) return;
    this.warnings = this.warnings.filter((w) => w.at > this.ticks);
    const pt = this.player.tile;
    for (const w of due) {
      if (w.by.dead || w.by.state !== 'fight') continue;
      for (const t of w.tiles) this.impacts.push({ x: t.x, y: t.y, time: this.now });
      if (w.tiles.some((t) => t.x === pt.x && t.y === pt.y) && this.state.player.hp > 0) {
        const [lo, hi] = w.dmg;
        this.on.message?.('The slam hits you!');
        this.hurtPlayer(w.by, lo + Math.floor(this.rng() * (hi - lo + 1)));
      } else this.on.message?.('You get clear of the slam!');
    }
  }

  // A rune pillar tightens the boss's chains: some damage, and it's pinned
  // for a few ticks (no swings, no slams).
  pinBoss(e, dmg, ticks) {
    if (!e || e.dead) return;
    const b = (e.boss ||= { phase: 1, cried: [], slamIn: e.def.mechanics.slamEvery, pinned: 0 });
    b.pinned = Math.max(b.pinned, ticks);
    this.warnings = this.warnings.filter((w) => w.by !== e);
    this.hurtEnemy(e, Math.min(dmg, e.hp));
    if (!e.dead && e.state !== 'fight') e.state = 'fight';
  }

  // The stats a monster fights with right now (bosses change in phase 2).
  fightStats(e) {
    return e.boss?.phase === 2 && e.def.mechanics?.phase2 ? { ...e.def, ...e.def.mechanics.phase2 } : e.def;
  }

  // ---- Ranged and magic --------------------------------------------------------------
  flightTicks(e, magic) {
    const d = cheb(this.player.tile, e.standTile);
    return magic ? 1 + Math.floor((1 + d) / 3) : 1 + Math.floor((3 + d) / 6);
  }

  launch(e, kind, ticks) {
    const p = this.player.tile;
    this.projectiles.push({ kind, from: { x: p.x + 0.5, y: p.y + 0.5 }, to: e, start: this.now, end: this.now + ticks * 0.6 });
  }

  // Fire one arrow from the ammo slot. Returns false if you can't.
  // Thrown weapons (darts, knives, javelins) use one from the stack in your hand.
  shoot(e) {
    const thrown = this.weapon.thrown;
    const ammo = thrown ? this.gear.slots.weapon : this.gear.slots.ammo;
    const def = ammo && ITEMS[ammo.id]?.equip;
    if (!ammo || (!thrown && def?.ammo !== this.weapon.ammo)) {
      this.on.message?.('You have no arrows in your ammo slot.');
      this.target = null;
      return false;
    }
    ammo.qty--;
    if (ammo.qty <= 0) {
      if (thrown) { this.gear.slots.weapon = null; this.on.message?.(`That was your last ${ITEMS[ammo.id].name.toLowerCase()}!`); this.target = null; }
      else { this.gear.slots.ammo = null; this.on.message?.("That was your last arrow!"); }
    }
    const s = this.skills;
    const st = this.rangedStyle;
    const b = this.gear.bonuses();
    const dmg = resolveAttack(this.rng,
      { attack: s.ranged, strength: s.ranged, attackBonus: b.att.ranged, strengthBonus: b.rangedStr, attackStyle: st.bonus.ranged || 0, strengthStyle: st.bonus.ranged || 0 },
      { defence: e.def.defence, defenceBonus: e.def.defenceBonus });
    const ticks = this.flightTicks(e, false);
    this.launch(e, 'arrow', ticks);
    this.playerLungeAt = this.now;
    this.playerAttackKind = thrown ? 'slash' : 'bow';
    // Like OSRS, most arrows can be picked up again where they land.
    this.pending.push({ target: e, dmg, at: this.ticks + ticks, mode: 'ranged', arrow: ammo.id, keepArrow: this.rng() < 0.6 });
    this.on.inventoryChanged?.();
    return true;
  }

  // Cast the chosen spell, using its runes. Returns false if you can't.
  cast(e) {
    const spell = this.spell;
    const s = this.skills;
    if (s.magic < spell.level) {
      this.on.message?.(`You need a Magic level of ${spell.level} to cast ${spell.name}.`);
      this.target = null;
      return false;
    }
    const missing = Object.entries(spell.runes).find(([id, n]) => this.inv.count(id) < n);
    if (missing) {
      this.on.message?.(`You don't have enough ${ITEMS[missing[0]].name.toLowerCase()}s to cast ${spell.name}.`);
      this.target = null;
      return false;
    }
    for (const [id, n] of Object.entries(spell.runes)) this.inv.remove(id, n);
    const b = this.gear.bonuses();
    const dmg = resolveAttack(this.rng,
      { attack: s.magic, attackBonus: b.att.magic, maxHit: spell.maxHit },
      { defence: e.def.defence, defenceBonus: e.def.defenceBonus });
    const ticks = this.flightTicks(e, true);
    this.launch(e, spell.colour, ticks);
    this.playerLungeAt = this.now;
    this.playerAttackKind = 'cast';
    this.book.add('magic', spell.xp); // every cast gives some Magic XP
    this.pending.push({ target: e, dmg, at: this.ticks + ticks, mode: 'magic', spell });
    this.on.inventoryChanged?.();
    return true;
  }

  // An arrow or spell arrives.
  land(h) {
    const e = h.target;
    if (h.mode === 'ranged' && h.keepArrow && !e.dead) this.on.arrowLanded?.(h.arrow, e.standTile.x, e.standTile.y);
    if (e.dead) return;
    const dealt = Math.min(h.dmg, e.hp);
    this.hurtEnemy(e, dealt);
    if (dealt > 0) {
      if (h.mode === 'ranged') for (const [skill, share] of Object.entries(this.rangedStyle.xp)) this.book.add(skill, dealt * XP_PER_DAMAGE * share);
      else this.book.add('magic', dealt * 2);
      this.book.add('hitpoints', dealt * HP_XP_PER_DAMAGE);
    }
    if (!e.dead && e.state !== 'fight') { e.state = 'fight'; e.cooldown = Math.max(e.cooldown, 1); }
  }

  playerSwing(e) {
    const s = this.skills;
    const style = this.style;
    const dmg = resolveAttack(this.rng,
      { attack: s.attack, strength: s.strength, ...this.meleeBonuses(), attackStyle: style.bonus.attack || 0, strengthStyle: style.bonus.strength || 0 },
      { defence: e.def.defence, defenceBonus: e.def.defenceBonus });
    this.playerLungeAt = this.now;
    this.playerAttackKind = 'slash';
    const dealt = Math.min(dmg, e.hp); // can't do more damage than it has health
    this.hurtEnemy(e, dealt);
    // XP: 4 per damage shared by the style's skills, plus 1.33 Hitpoints.
    if (dealt > 0) {
      for (const [skill, share] of Object.entries(style.xp)) this.book.add(skill, dealt * XP_PER_DAMAGE * share);
      this.book.add('hitpoints', dealt * HP_XP_PER_DAMAGE);
    }
    // Being hit makes it fight back after a short pause.
    if (!e.dead && e.state !== 'fight') {
      e.state = 'fight';
      e.cooldown = Math.max(e.cooldown, 2);
    }
  }

  hurtEnemy(e, dmg) {
    e.hp = Math.max(0, e.hp - dmg);
    e.lastHit = this.now;
    this.splats.push({ who: e, dmg, time: this.now });
    if (e.hp <= 0) {
      e.dead = true;
      e.diedAt = this.now;
      e.respawnIn = e.def.respawn;
      e.moving = false;
      if (this.target === e) this.target = null;
      this.on.enemyDied?.(e);
    }
  }

  hurtPlayer(e, dmg) {
    const st = this.state;
    st.player.hp = Math.max(0, st.player.hp - dmg);
    this.playerLastHit = this.now;
    this.splats.push({ who: 'player', dmg, time: this.now });
    // Auto-retaliate: if you're standing idle, hit back.
    const p = this.player;
    if (!this.target && st.settings.autoRetaliate !== false && !p.moving && !p.path.length) this.target = e;
    if (st.player.hp <= 0) {
      this.target = null;
      for (const o of this.enemies) if (o.state === 'fight') { o.state = 'return'; this.bossReset(o); }
      this.on.playerDied?.();
    }
  }

  // ---- Enemy brains -------------------------------------------------------------------
  enemyTick(e) {
    if (e.dead) {
      if (--e.respawnIn <= 0) {
        const pt = this.player.tile;
        if ((pt.x !== e.spawn.x || pt.y !== e.spawn.y) && this.area.isFree(e.spawn.x, e.spawn.y)) e.reset();
        else e.respawnIn = 2;
      }
      return;
    }
    // Steps last exactly one tick, so finish any step before deciding the next.
    if (e.moving) { e.tile = { ...e.to }; e.moving = false; e.t = 0; }
    if (e.cooldown > 0) e.cooldown--;

    const st = this.state;
    const pt = this.player.tile;
    const playerUp = st.player.hp > 0;
    const def = e.def;

    if (e.state === 'idle') {
      const near = cheb(e.tile, pt) <= (def.aggroRange ?? 0);
      if (def.aggressive && playerUp && near && this.level < def.level * 2 && cheb(pt, e.spawn) <= def.leash) {
        e.state = 'fight';
        e.cooldown = Math.max(e.cooldown, 1);
        this.on.message?.(`The ${def.name} attacks you!`);
      } else this.wander(e);
      return;
    }

    if (e.state === 'fight') {
      if (!playerUp || cheb(e.tile, e.spawn) > def.leash || cheb(pt, e.spawn) > def.leash + 2) { e.state = 'return'; this.bossReset(e); return; }
      if (def.mechanics && this.bossTick(e)) { e.faceTowards(pt.x, pt.y); return; }
      if (adjacent(e.tile, pt)) {
        e.faceTowards(pt.x, pt.y);
        if (e.cooldown <= 0) {
          const f = this.fightStats(e);
          const dmg = resolveAttack(this.rng,
            { attack: f.attack, strength: f.strength, attackBonus: f.attackBonus, maxHit: f.maxHit },
            { defence: this.skills.defence, defenceBonus: this.defenceAgainst(def.attackType || 'crush'), defenceStyle: this.defenceStyleBonus() });
          e.lungeAt = this.now;
          e.cooldown = f.speed;
          this.hurtPlayer(e, dmg);
        }
      } else this.chase(e, pt);
      return;
    }

    // Returning home: walk back, then heal to full.
    if (e.tile.x === e.spawn.x && e.tile.y === e.spawn.y) { e.hp = e.maxHp; e.state = 'idle'; e.stuck = 0; e.boss = null; return; }
    if (!this.stepToward(e, (n) => cheb(n, e.spawn) + Math.abs(n.x - e.spawn.x) * 0.01 + Math.abs(n.y - e.spawn.y) * 0.01)) {
      if (++e.stuck > 12) { e.reset(); }
    }
  }

  // A boss fight is over without a winner: clear its slams and adds.
  bossReset(e) {
    if (!e.def.mechanics) return;
    this.warnings = this.warnings.filter((w) => w.by !== e);
    for (const o of this.enemies) if (o.summonedBy === e && !o.dead) { o.dead = true; o.diedAt = this.now - 1; }
    this.on.bossEvent?.(e, 'reset');
  }

  canEnemyStep(e, n) {
    const pt = this.player.tile;
    const pto = this.player.moving ? this.player.to : pt;
    if ((n.x === pt.x && n.y === pt.y) || (n.x === pto.x && n.y === pto.y)) return false;
    if (this.area.exitAt.has(this.area.idx(n.x, n.y))) return false;
    return this.area.canStep(e.tile.x, e.tile.y, n.x, n.y);
  }

  // Take the single step that most reduces score(tile). Returns true if it moved.
  stepToward(e, score, dirs = DIRS8) {
    let best = null;
    let bestScore = score(e.tile);
    for (const [dx, dy] of dirs) {
      const n = { x: e.tile.x + dx, y: e.tile.y + dy };
      if (!this.canEnemyStep(e, n)) continue;
      const s = score(n) + (dx && dy ? 0.001 : 0); // prefer straight steps on ties
      if (s < bestScore) { bestScore = s; best = n; }
    }
    if (best) e.stepTo(best);
    return !!best;
  }

  chase(e, pt) {
    const leash = e.def.leash;
    this.stepToward(e, (n) => {
      if (cheb(n, e.spawn) > leash) return 1e9;
      return Math.abs(n.x - pt.x) + Math.abs(n.y - pt.y);
    });
  }

  wander(e) {
    if (this.rng() > 0.18) return;
    const [dx, dy] = DIRS4[Math.floor(this.rng() * 4)];
    const n = { x: e.tile.x + dx, y: e.tile.y + dy };
    if (Math.abs(n.x - e.spawn.x) + Math.abs(n.y - e.spawn.y) > e.def.wander) return;
    if (this.canEnemyStep(e, n)) e.stepTo(n);
  }
}
