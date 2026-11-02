// Real-time overworld combat, run on the 0.6 s game tick.
//
// Player: tap an enemy -> walk until standing next to it (not diagonally),
// then attack every `speed` ticks until it dies or you do something else.
// Enemies: wander near their spawn; when attacked (or, if aggressive, when you
// come close) they fight back and chase you; if you lead them too far from
// home they give up, walk back and heal.

import { resolveAttack, combatLevel } from './formulas.js';
import { findPath } from '../world/pathfinding.js';
import { styleById } from '../skills/skills.js';

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
  constructor({ state, player, rng, on, skills }) {
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
    this.now = 0;
  }

  // ---- Player stats, from the skills you've trained -------------------------------
  get skills() { return this.book.levels(); }
  get style() { return styleById(this.state.settings.attackStyle); }
  // Combat level as it would be with one skill at a different level (for "your combat level is now..." messages).
  levelFrom(skill, level) { return combatLevel({ ...this.skills, [skill]: level }); }
  get maxHp() { return this.skills.hitpoints; }
  get level() { return combatLevel(this.skills); }
  get hp() { return this.state.player.hp; }
  get inCombat() { return !!this.target || this.enemies.some((e) => !e.dead && e.state === 'fight'); }

  setWorld(area, enemies) {
    for (const e of this.enemies) if (!e.dead && e.state === 'fight') e.state = 'return';
    this.area = area;
    this.enemies = enemies;
    this.target = null;
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
    if (adjacent(s, g)) { p.setPath([]); return; }
    const path = findPath(this.area, s.x, s.y, (x, y) => Math.abs(x - g.x) + Math.abs(y - g.y) === 1);
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
      else if (!p.moving && adjacent(p.tile, t.standTile)) {
        p.setPath([]);
        p.faceTowards(t.standTile.x, t.standTile.y);
        if (this.cooldown <= 0) {
          this.playerSwing(t);
          this.cooldown = UNARMED_SPEED;
        }
      } else this.approach();
    }

    for (const e of this.enemies) this.enemyTick(e);
  }

  playerSwing(e) {
    const s = this.skills;
    const style = this.style;
    const dmg = resolveAttack(this.rng,
      { attack: s.attack, strength: s.strength, attackBonus: 0, strengthBonus: 0, attackStyle: style.bonus.attack || 0, strengthStyle: style.bonus.strength || 0 },
      { defence: e.def.defence, defenceBonus: e.def.defenceBonus });
    this.playerLungeAt = this.now;
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
      for (const o of this.enemies) if (o.state === 'fight') o.state = 'return';
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
      if (!playerUp || cheb(e.tile, e.spawn) > def.leash || cheb(pt, e.spawn) > def.leash + 2) { e.state = 'return'; return; }
      if (adjacent(e.tile, pt)) {
        e.faceTowards(pt.x, pt.y);
        if (e.cooldown <= 0) {
          const dmg = resolveAttack(this.rng,
            { attack: def.attack, strength: def.strength, attackBonus: def.attackBonus, maxHit: def.maxHit },
            { defence: this.skills.defence, defenceBonus: 0, defenceStyle: this.style.bonus.defence || 0 });
          e.lungeAt = this.now;
          e.cooldown = def.speed;
          this.hurtPlayer(e, dmg);
        }
      } else this.chase(e, pt);
      return;
    }

    // Returning home: walk back, then heal to full.
    if (e.tile.x === e.spawn.x && e.tile.y === e.spawn.y) { e.hp = e.maxHp; e.state = 'idle'; e.stuck = 0; return; }
    if (!this.stepToward(e, (n) => cheb(n, e.spawn) + Math.abs(n.x - e.spawn.x) * 0.01 + Math.abs(n.y - e.spawn.y) * 0.01)) {
      if (++e.stuck > 12) { e.reset(); }
    }
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
