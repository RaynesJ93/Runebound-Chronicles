import { GAME_VERSION, BUILD_NAME } from './version.js';
import { Ticker } from './core/tick.js';
import { loadGame, saveGame, exportSave, importSave, wipeSave } from './core/save.js';
import { Area, adjacentTo } from './world/area.js';
import { findPath } from './world/pathfinding.js';
import { AREAS, START_AREA } from '../data/areas/index.js';
import { NPCS } from '../data/npcs.js';
import { Npc } from './entities/npc.js';
import { mulberry32 } from './core/rng.js';
import { createWorldView } from './render/world2d.js';
import { PlayerController } from './entities/player.js';
import { Input } from './input/input.js';
import { Hud } from './ui/hud.js';
import { Enemy } from './entities/enemy.js';
import { ENEMIES } from '../data/enemies.js';
import { Combat } from './combat/combat.js';
import { SkillBook, SKILL_NAME, MELEE_STYLES, RANGED_STYLES } from './skills/skills.js';
import { SPELLS } from '../data/spells.js';
import { maxHit, effectiveLevel } from './combat/formulas.js';
import { Inventory } from './items/inventory.js';
import { Equipment, verb } from './items/equipment.js';
import { GroundItems } from './items/ground.js';
import { rollLoot } from './items/loot.js';
import { ITEMS, itemName } from '../data/items.js';
import { itemIcon } from './render/items.js';
import { Bank } from './items/bank.js';
import { Shop } from './items/shop.js';
import { SHOPS } from '../data/shops.js';
import { splitOnDeath, graveFee, reclaim, GRAVE_SECONDS, FREE_SECONDS } from './items/death.js';

const AUTOSAVE_TICKS = 50; // 30 seconds

function fail(message) {
  const el = document.getElementById('loading-text');
  if (el) el.textContent = message;
  document.getElementById('loading')?.classList.add('error');
}

function boot() {
  const canvas = document.getElementById('game');
  const { state, loaded } = loadGame();

  // ---- World ---------------------------------------------------------------
  // Each area is built once, the first time you visit it, and kept.
  const hud = new Hud(document.getElementById('ui'));
  const input = new Input(canvas);
  input.bindDpad(hud.el.dpad);
  const worlds = new Map();
  const rng = mulberry32((Date.now() & 0xffffff) ^ 0x5bd1e995);

  function loadWorld(id) {
    if (worlds.has(id)) return worlds.get(id);
    const a = new Area(AREAS[id]());
    const v = createWorldView(canvas, a);
    const people = NPCS.filter((n) => n.area === id).map((d) => new Npc(d, a));
    const foes = a.spawns.filter((sp) => ENEMIES[sp.enemy]).map((sp) => new Enemy(ENEMIES[sp.enemy], sp, a));
    a.dynamicBlock = (x, y) => people.some((n) => n.occupies(x, y)) || foes.some((e) => e.occupies(x, y));
    // Tiles you can tap to look at something: props with text, and every
    // tile of a building (which shows its door text).
    const look = new Map();
    for (const p of a.props) if (p.interact) for (const t of p.tiles) look.set(a.idx(t.x, t.y), p);
    for (const b of a.buildings) {
      // Tapping a building you can enter walks you in through its door.
      const door = b.enter ? { type: 'enter', tiles: b.doorTiles } : a.props.find((p) => p.type === 'door' && p.building === b.id);
      for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) look.set(a.idx(x, y), door);
    }
    const w = { id, area: a, view: v, npcs: people, enemies: foes, lookup: look, ground: new GroundItems() };
    worlds.set(id, w);
    return w;
  }

  let world = loadWorld(AREAS[state.player.area] ? state.player.area : START_AREA);
  let { area, view, npcs, enemies, lookup, ground } = world;
  if (!area.isWalkable(state.player.x, state.player.y)) Object.assign(state.player, area.spawn);
  state.player.area = area.id;
  const player = new PlayerController(area, state);
  let time = 0;
  let dying = false;

  // ---- Skills ----------------------------------------------------------------
  let levelUpAt = -99;
  let refreshSkills = () => {};
  const book = new SkillBook(state, {
    xp: (id, amount) => hud.xpDrop(id, amount),
    levelUp: (id, level, before) => {
      const name = SKILL_NAME[id];
      const oldCombat = combat.levelFrom(id, before);
      hud.levelUp(id, name, level);
      hud.message(`Congratulations, your ${name} level is now ${level}.`);
      if (id === 'hitpoints') state.player.hp = Math.min(level, state.player.hp + (level - before));
      if (combat.level > oldCombat) hud.message(`Your combat level is now ${combat.level}.`);
      levelUpAt = time;
      refreshSkills();
      save();
    },
  });

  const inventory = new Inventory(state);
  const equipment = new Equipment(state, book, inventory);

  // ---- Combat ----------------------------------------------------------------
  const combat = new Combat({
    state, player, rng, skills: book, equipment, inventory,
    on: {
      message: (t) => hud.message(t),
      cantReach: () => hud.message("I can't reach that."),
      healed: () => hud.flashHeal(),
      inventoryChanged: () => refreshInventory(),
      // Arrows that didn't break land under the target, stacked per tile.
      arrowLanded: (id, x, y) => {
        const here = ground.at(x, y).find((g) => g.item === id && !g.rare);
        if (here) { here.qty++; here.expires = time + 120; } else ground.add(id, 1, x, y, time);
      },
      enemyDied: (e) => {
        hud.message(`You defeated the ${e.name}!`);
        state.stats.kills = (state.stats.kills || 0) + 1;
        for (const drop of rollLoot(e.def.loot, rng)) {
          ground.add(drop.item, drop.qty, e.tile.x, e.tile.y, time, { rare: drop.rare || !!ITEMS[drop.item]?.rare });
          if (drop.rare) hud.message(`Rare drop: ${itemName(drop.item)}!`);
        }
      },
      playerDied: () => die(),
    },
  });
  combat.setWorld(area, enemies);
  if (!(state.player.hp > 0) || state.player.hp > combat.maxHp) state.player.hp = combat.maxHp;

  // ---- Inventory -----------------------------------------------------------
  let refreshInventory = () => {};

  // ---- Saving --------------------------------------------------------------
  let lastSaved = loaded ? Date.now() : 0;
  let blockSaves = false;
  const save = () => {
    if (blockSaves) return false;
    const ok = saveGame(state);
    if (ok) lastSaved = Date.now();
    return ok;
  };
  const describeSave = () => {
    if (!lastSaved) return 'Your game saves automatically.';
    const secs = Math.round((Date.now() - lastSaved) / 1000);
    return `Saved automatically · last save ${secs < 5 ? 'just now' : secs < 90 ? `${secs} seconds ago` : `${Math.round(secs / 60)} minutes ago`}.`;
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', save);

  // ---- Settings ------------------------------------------------------------
  const coarse = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const DPAD_LABEL = { auto: 'Auto', on: 'On', off: 'Off' };
  const applySettings = () => {
    const s = state.settings;
    hud.setDpadVisible(s.dpad === 'on' || (s.dpad === 'auto' && coarse));
    hud.el.setDpad.textContent = DPAD_LABEL[s.dpad] || 'Auto';
    hud.el.setRetaliate.textContent = s.autoRetaliate === false ? 'Off' : 'On';
    s.zoomStep = view.setZoomStep(s.zoomStep || 0);
    hud.el.zoomVal.textContent = s.zoomStep > 0 ? `+${s.zoomStep}` : String(s.zoomStep);
    hud.el.setItemTap.textContent = s.itemTap === 'menu' ? 'Menu' : 'Use';
    hud.$('item-tap-sub').textContent = s.itemTap === 'menu' ? 'Always shows the options menu' : 'Eats, drinks, wields or wears it';
    hud.el.setTextSpeed.textContent = TEXT_LABEL[s.textSpeed] || 'Normal';
    hud.textSpeed = s.textSpeed;
    hud.el.setXpDrops.textContent = s.xpDrops === false ? 'Off' : 'On';
    hud.showXpDrops = s.xpDrops !== false;
    hud.el.setBattery.textContent = s.batterySaver ? 'On' : 'Off';
    const hold = coarse ? 'Long-press' : 'Right-click';
    hud.$('controls-help').textContent = `${hold} anything in the world or in your bag to see all its options (examine, walk here, drop…).`;
    hud.$('inv-help').textContent = s.itemTap === 'menu'
      ? `Tap an item for its options. Drag to rearrange.`
      : `Tap to eat, drink, wield or wear. ${hold} for more options (examine, drop…). Drag to rearrange.`;
  };
  const TEXT_LABEL = { normal: 'Normal', fast: 'Fast', instant: 'Instant' };
  const cycle = (key, order) => () => {
    state.settings[key] = order[(order.indexOf(state.settings[key]) + 1) % order.length];
    applySettings();
    save();
  };
  hud.el.setItemTap.addEventListener('click', cycle('itemTap', ['use', 'menu']));
  hud.el.setTextSpeed.addEventListener('click', cycle('textSpeed', ['normal', 'fast', 'instant']));
  hud.el.setXpDrops.addEventListener('click', cycle('xpDrops', [true, false]));
  hud.el.setBattery.addEventListener('click', cycle('batterySaver', [false, true]));
  const playTime = (secs) => {
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h ? `${h} h ${m} min` : `${m} min`;
  };
  hud.el.version.textContent = `RuneBound Chronicles v${GAME_VERSION} · ${BUILD_NAME}`;
  hud.onSettingsOpen = () => {
    hud.el.saveStatus.textContent = describeSave();
    const st = state.stats;
    const rows = [
      ['Time played', playTime(st.playTimeSec)], ['Combat level', combat.level], ['Total level', book.total()],
      ['Monsters defeated', st.kills.toLocaleString('en-GB')], ['Deaths', st.deaths], ['Tiles walked', st.tilesWalked.toLocaleString('en-GB')],
    ];
    hud.$('adv-stats').innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
  };

  hud.el.setDpad.addEventListener('click', () => {
    const order = ['auto', 'on', 'off'];
    state.settings.dpad = order[(order.indexOf(state.settings.dpad) + 1) % order.length];
    applySettings();
  });
  const toggleRetaliate = () => {
    state.settings.autoRetaliate = state.settings.autoRetaliate === false;
    applySettings();
    refreshSkills();
  };
  hud.el.setRetaliate.addEventListener('click', toggleRetaliate);
  hud.$('set-retaliate2').addEventListener('click', toggleRetaliate);

  // Max hit for whatever you're fighting with right now.
  const currentMaxHit = () => {
    const lv = combat.skills;
    const b = equipment.bonuses();
    if (combat.mode === 'magic') return combat.spell.maxHit;
    if (combat.mode === 'ranged') return maxHit(effectiveLevel(lv.ranged, combat.rangedStyle.bonus.ranged || 0), b.rangedStr);
    return maxHit(effectiveLevel(lv.strength, combat.style.bonus.strength || 0), b.str);
  };

  // The choices in the Combat tab depend on your weapon: melee styles, bow styles or spells.
  const styleChoices = () => {
    const lv = combat.skills;
    if (combat.mode === 'magic') {
      const runes = (sp) => Object.entries(sp.runes).map(([id, n]) => `${n} ${ITEMS[id].name.replace(' rune', '')}`).join(', ');
      return {
        intro: 'Choose a spell. Every attack casts it, using its runes from your bag.',
        current: combat.spell.id,
        list: SPELLS.map((sp) => ({ id: sp.id, name: sp.name, icon: sp.id, locked: lv.magic < sp.level, sub: `Magic ${sp.level} · max hit ${sp.maxHit} · ${runes(sp)}` })),
      };
    }
    if (combat.mode === 'ranged') {
      return {
        intro: 'Pick how you shoot. Arrows come from your ammo slot.',
        current: combat.rangedStyle.id,
        list: RANGED_STYLES.map((st) => ({ id: st.id, name: st.name, icon: st.id === 'accurate' ? 'ranged' : st.id, sub: `Trains ${st.trains}` })),
      };
    }
    return {
      intro: 'Pick how you fight. Each style gives a small bonus and decides which skill your XP goes to.',
      current: combat.style.id,
      list: MELEE_STYLES.map((st) => ({ id: st.id, name: st.name, icon: st.id, sub: `Trains ${st.trains}` })),
    };
  };

  // Skills panel: levels, progress, and the Combat tab with attack styles.
  refreshSkills = () => {
    if (!hud.skillsOpen) return;
    hud.renderSkills(book, combat.level, state.boosts);
    const w = equipment.weapon;
    const c = styleChoices();
    const reach = combat.mode === 'melee' ? 'melee' : `range ${combat.range} tiles`;
    hud.renderStyles(c.list, c.current, state.settings.autoRetaliate !== false,
      `Max hit: ${currentMaxHit()} · Combat level: ${combat.level} · ${w.name} (${reach}, ${(combat.speed * 0.6).toFixed(1)} s per attack).`, c.intro);
  };
  hud.onSkillsOpen = () => refreshSkills();
  // Inventory panel: tap for options, drag to rearrange.
  refreshInventory = () => {
    currentLook();
    if (!hud.invOpen) return;
    hud.renderInventory(inventory.slots);
    hud.renderEquipment(equipment.slots, equipment.bonuses(), equipment.weapon, currentMaxHit());
  };
  const wear = (i) => {
    const r = equipment.equipFromInventory(i);
    if (!r.ok) { hud.message(r.msg); return; }
    refreshInventory();
    refreshSkills();
    save();
  };
  hud.onGearTap = (slot, x, y) => {
    const s = equipment.slots[slot];
    if (!s) return;
    const def = ITEMS[s.id];
    hud.showMenu(x, y, describe({ item: s.id, qty: s.qty }), [
      { label: 'Remove', fn: () => {
        const r = equipment.unequip(slot);
        if (!r.ok && r.msg) hud.message(r.msg);
        refreshInventory();
        refreshSkills();
        save();
      } },
      { label: 'Examine', fn: () => hud.message(def.examine) },
      { label: 'Cancel', fn: () => {} },
    ]);
  };
  hud.onInventoryOpen = () => refreshInventory();
  hud.onSlotSwap = (a, b) => { inventory.swap(a, b); refreshInventory(); save(); };
  // Tapping an item does its main thing (eat, drink, wield, wear), like OSRS
  // mobile. Items without one — or everything, if you prefer menus — show the menu.
  const quickUse = (i) => {
    const def = ITEMS[inventory.slots[i]?.id];
    if (!def) return null;
    if (def.food || def.potion) return () => eat(i);
    if (def.equip) return () => wear(i);
    return null;
  };
  hud.onSlotTap = (i, x, y) => {
    const use = state.settings.itemTap === 'menu' ? null : quickUse(i);
    if (use) use(); else hud.onSlotMenu(i, x, y);
  };
  hud.onSlotMenu = (i, x, y) => {
    const s = inventory.slots[i];
    if (!s) return;
    const def = ITEMS[s.id];
    const options = [];
    if (def.food) options.push({ label: 'Eat', fn: () => eat(i) });
    if (def.potion) options.push({ label: 'Drink', fn: () => eat(i) });
    if (def.equip) {
      const v = verb(s.id);
      options.push({ label: v === 'wield' ? 'Wield' : 'Wear', fn: () => wear(i) });
    }
    hud.showMenu(x, y, describe({ item: s.id, qty: s.qty }), [
      ...options,
      { label: 'Examine', fn: () => hud.message(`${def.examine}${def.stackable && s.qty > 1 ? ` (${s.qty.toLocaleString('en-GB')})` : ''}`) },
      { label: 'Drop', fn: () => {
        const it = inventory.removeSlot(i);
        if (!it) return;
        ground.add(it.id, it.qty, player.tile.x, player.tile.y, time, { mine: true });
        refreshInventory();
        save();
      } },
      { label: 'Cancel', fn: () => {} },
    ]);
  };
  hud.onStylePick = (id) => {
    if (combat.mode === 'magic') {
      const sp = SPELLS.find((x) => x.id === id);
      if (combat.skills.magic < sp.level) { hud.message(`You need a Magic level of ${sp.level} to cast ${sp.name}.`); return; }
      state.settings.spell = id;
      hud.message(`Spell: ${sp.name}.`);
    } else if (combat.mode === 'ranged') {
      state.settings.rangedStyle = id;
      hud.message(`Ranged style: ${combat.rangedStyle.name} (trains ${combat.rangedStyle.trains}).`);
    } else {
      state.settings.attackStyle = id;
      hud.message(`Attack style: ${combat.style.name} (trains ${combat.style.trains}).`);
    }
    refreshSkills();
    refreshInventory();
  };
  const zoomBy = (d) => { state.settings.zoomStep = (state.settings.zoomStep || 0) + d; applySettings(); };
  hud.$('zoom-in').addEventListener('click', () => zoomBy(1));
  hud.$('zoom-out').addEventListener('click', () => zoomBy(-1));

  hud.$('save-now').addEventListener('click', () => {
    hud.toast(save() ? 'Game saved.' : "Couldn't save — storage may be full or blocked.");
    hud.el.saveStatus.textContent = describeSave();
  });
  hud.$('save-copy').addEventListener('click', async () => {
    const code = exportSave(state);
    try {
      await navigator.clipboard.writeText(code);
      hud.toast('Save code copied.');
    } catch {
      hud.el.importBox.classList.remove('hidden');
      hud.el.importText.value = code;
      hud.el.importText.select();
      hud.toast('Select the code and copy it.');
    }
  });
  hud.$('save-download').addEventListener('click', () => {
    const blob = new Blob([exportSave(state)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `runebound-save-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
  hud.$('import-go').addEventListener('click', () => {
    try {
      const imported = importSave(hud.el.importText.value);
      blockSaves = true;
      saveGame(imported);
      hud.toast('Save loaded. Restarting…');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      hud.toast(err.message);
    }
  });
  const resetBtn = hud.$('save-reset');
  resetBtn.addEventListener('click', () => {
    if (resetBtn.dataset.armed !== '1') {
      resetBtn.dataset.armed = '1';
      resetBtn.textContent = 'Tap again to erase your save';
      return;
    }
    blockSaves = true;
    wipeSave();
    location.reload();
  });

  // ---- Movement and interaction -------------------------------------------
  let marker = null;
  let goal = null; // what we're walking towards, so we can re-plan if blocked
  let talkTarget = null; // villager waiting for us to arrive
  let transitioning = false;

  const releaseTalkTarget = () => {
    if (talkTarget && !hud.dialogOpen) talkTarget.busy = false;
    talkTarget = null;
  };

  const walkTo = (tx, ty) => {
    goal = { walk: { x: tx, y: ty } };
    const s = player.pathStart;
    const path = findPath(area, s.x, s.y, (x, y) => x === tx && y === ty, { x: tx, y: ty });
    player.setPath(path);
    marker = path && path.length ? path.at(-1) : null;
  };

  const interactWith = (prop) => {
    goal = { prop };
    const s = player.pathStart;
    const isGoal = prop.goal || adjacentTo(prop.tiles);
    const path = isGoal(s.x, s.y) ? [] : findPath(area, s.x, s.y, isGoal);
    if (!path) {
      hud.message("I can't reach that.");
      if (prop.npc) prop.npc.busy = false;
      return;
    }
    player.setPath(path, { prop, isGoal });
    marker = path.length ? path.at(-1) : null;
  };

  const talkTo = (npc) => {
    releaseTalkTarget();
    talkTarget = npc;
    npc.busy = true; // stand still while we walk over
    // Shopkeepers and bankers can be spoken to across their counter.
    const r = npc.def.talkRange || 1;
    const t = npc.standTile;
    const goal = r > 1 ? (x, y) => (x === t.x || y === t.y) && Math.abs(x - t.x) + Math.abs(y - t.y) <= r && (x !== t.x || y !== t.y) : null;
    interactWith({ npc, tiles: [t], goal });
  };

  // ---- Picking things up ----------------------------------------------------
  let pickup = null; // { x, y, entry } — entry null means "take everything here"

  const describe = (g) => `${itemName(g.item)}${g.qty > 1 ? ` × ${g.qty.toLocaleString('en-GB')}` : ''}`;

  const tryPickup = () => {
    if (!pickup || player.moving) return;
    const { x, y, entry } = pickup;
    if (player.tile.x !== x || player.tile.y !== y) {
      if (!player.path.length) pickup = null; // couldn't get there
      return;
    }
    pickup = null;
    const pile = entry ? (ground.has(entry) ? [entry] : []) : ground.at(x, y);
    if (!pile.length) { hud.message("Too late, it's gone!"); return; }
    for (const g of pile) {
      const got = inventory.add(g.item, g.qty);
      if (got > 0) hud.message(`You pick up: ${itemName(g.item)}${got > 1 ? ` × ${got.toLocaleString('en-GB')}` : ''}.`);
      if (got === g.qty) ground.remove(g);
      else { g.qty -= got; hud.message("You don't have enough inventory space."); break; }
    }
    refreshInventory();
    save();
  };

  const goPickup = (x, y, entry) => {
    combat.stop();
    releaseTalkTarget();
    pickup = { x, y, entry };
    if (!player.moving && player.tile.x === x && player.tile.y === y) { tryPickup(); return; }
    walkTo(x, y);
  };

  // Someone stepped into our path: plan again around them.
  player.onBlocked = () => {
    if (combat.target) { combat.approach(); return; }
    if (!goal) return;
    if (goal.prop) interactWith(goal.prop.npc ? { npc: goal.prop.npc, tiles: [goal.prop.npc.standTile] } : goal.prop);
    else walkTo(goal.walk.x, goal.walk.y);
  };

  // NPCs may step onto a tile only if nobody (player or NPC) is there or heading there,
  // and never onto an exit.
  const tileFreeForNpc = (x, y, self) => {
    if (player.tile.x === x && player.tile.y === y) return false;
    if (player.moving && player.to.x === x && player.to.y === y) return false;
    if (area.exitAt.has(area.idx(x, y))) return false;
    return !npcs.some((n) => n !== self && n.occupies(x, y)) && !enemies.some((e) => e.occupies(x, y));
  };

  // You died: fade out, wake up in Brambleford at full health.
  // (Item loss and the gravestone arrive with the bank in Batch 8.)
  const die = () => {
    if (dying) return;
    dying = true;
    player.frozen = true;
    player.stop();
    combat.stop();
    releaseTalkTarget();
    marker = null;
    goal = null;
    hud.message('Oh dear, you are dead!');
    // Keep your 3 most valuable items; the rest go into a gravestone here.
    const { kept, lost } = splitOnDeath(inventory, equipment);
    const hadGrave = !!state.grave;
    if (lost.length) {
      state.grave = { area: area.id, x: player.tile.x, y: player.tile.y, items: lost, createdAt: state.stats.playTimeSec };
    }
    state.boosts = {};
    refreshInventory();
    setTimeout(() => hud.setFade(true), 900);
    setTimeout(() => {
      world = loadWorld(START_AREA);
      ({ area, view, npcs, enemies, lookup, ground } = world);
      combat.setWorld(area, enemies);
      view.resize();
      applySettings();
      const s = area.spawn;
      player.teleport(area, s.x, s.y, s.facing ?? 0);
      state.player.hp = combat.maxHp;
      state.stats.deaths = (state.stats.deaths || 0) + 1;
      player.frozen = false;
      dying = false;
      save();
      hud.setFade(false);
      hud.showArea(area.name);
      hud.message('You wake up at home, feeling a little dizzy.');
      if (kept.length) hud.message(`You kept: ${kept.join(', ')}.`);
      if (lost.length) hud.message('The rest of your things are in a gravestone where you fell. You have 15 minutes to get them back.');
      if (hadGrave && lost.length) hud.message('Your older gravestone has crumbled away.');
    }, 1300);
  };

  // Walk into another area: fade out, swap the map, fade in.
  const travel = (exit) => {
    transitioning = true;
    player.frozen = true;
    player.stop();
    releaseTalkTarget();
    combat.stop();
    marker = null;
    goal = null;
    hud.setFade(true);
    setTimeout(() => {
      world = loadWorld(exit.to);
      ({ area, view, npcs, enemies, lookup, ground } = world);
      combat.setWorld(area, enemies);
      view.resize();
      applySettings();
      player.teleport(area, exit.at.x + exit.offset, exit.at.y, exit.facing ?? player.facing);
      player.frozen = false;
      if (exit.to === 'route1') state.flags.visitedRoute1 = true;
      save();
      hud.setFade(false);
      hud.showArea(area.name);
      transitioning = false;
    }, 320);
  };

  const firstMove = () => {
    if (!state.flags.seenMoveHint) {
      state.flags.seenMoveHint = true;
      hud.hideHint();
    }
  };

  // What's at a tile: monsters and villagers also answer for the tile above
  // their feet, because they're drawn tall.
  const whatsAt = (t) => ({
    foe: enemies.find((e) => e.occupies(t.x, t.y)) || enemies.find((e) => e.occupies(t.x, t.y + 1)),
    npc: npcs.find((n) => n.occupies(t.x, t.y)) || npcs.find((n) => n.occupies(t.x, t.y + 1)),
    pile: ground.at(t.x, t.y),
    grave: state.grave && state.grave.area === area.id && state.grave.x === t.x && state.grave.y === t.y ? state.grave : null,
    prop: lookup.get(area.idx(t.x, t.y)),
  });

  const attackFoe = (foe) => {
    pickup = null;
    releaseTalkTarget();
    goal = null;
    marker = null;
    combat.attack(foe);
    firstMove();
  };
  const goToGrave = (t) => interactWith({ tiles: [{ x: t.x, y: t.y }], grave: true, goal: (x, y) => Math.abs(x - t.x) + Math.abs(y - t.y) <= 1 });
  const useProp = (prop) => {
    if (prop.type === 'enter') walkTo(prop.tiles[0].x, prop.tiles[0].y);
    else interactWith(prop);
  };
  const walkHere = (t) => { pickup = null; combat.stop(); releaseTalkTarget(); walkTo(t.x, t.y); firstMove(); };
  const ready = () => !(hud.settingsOpen || transitioning || dying);

  input.onTap = (sx, sy) => {
    if (hud.menuOpen) { hud.closeMenu(); return; }
    if (hud.dialogOpen) { hud.advanceDialog(); return; }
    if (!ready()) return;
    const t = view.screenToTile(sx, sy);
    if (!area.inBounds(t.x, t.y)) return;
    const at = whatsAt(t);
    // Monsters: tap to attack.
    if (at.foe) { attackFoe(at.foe); return; }
    combat.stop();
    if (at.npc) { pickup = null; talkTo(at.npc); firstMove(); return; }
    // Loot on the ground: one item -> go and take it; a pile -> choose.
    if (at.pile.length) {
      firstMove();
      if (at.pile.length === 1) { goPickup(t.x, t.y, at.pile[0]); return; }
      hud.showMenu(sx, sy, 'Items here', [
        ...at.pile.slice(0, 8).map((g) => ({ label: `Take ${describe(g)}`, icon: itemIcon(g.item).url, fn: () => goPickup(t.x, t.y, g) })),
        { label: 'Take everything', fn: () => goPickup(t.x, t.y, null) },
        { label: 'Walk here', fn: () => walkHere(t) },
      ]);
      return;
    }
    pickup = null;
    releaseTalkTarget();
    if (at.grave) { goToGrave(t); return; }
    if (at.prop) useProp(at.prop);
    else walkTo(t.x, t.y);
    firstMove();
  };

  // Long-press (phone) or right-click (computer): every option for what's there.
  const PROP_NAME = { sign: 'sign', door: 'door', well: 'well', stall: 'stall', counter: 'counter', bankBooth: 'bank booth', fallenTree: 'fallen tree', logPile: 'log pile', tent: 'tent', campfire: 'campfire', scarecrow: 'scarecrow', lamp: 'lamp' };
  input.onLongPress = (sx, sy) => {
    if (hud.dialogOpen || !ready()) return;
    const t = view.screenToTile(sx, sy);
    if (!area.inBounds(t.x, t.y)) return;
    const at = whatsAt(t);
    const opts = [];
    let title = null;
    if (at.foe && !at.foe.dead) {
      const f = at.foe;
      title = `${f.name} (level ${f.def.level})`;
      opts.push({ label: `Attack ${f.name}`, fn: () => attackFoe(f) });
      opts.push({ label: `Examine ${f.name}`, fn: () => hud.message(f.def.examine) });
    }
    if (at.npc) {
      const n = at.npc;
      title ||= n.name;
      opts.push({ label: `Talk to ${n.name.split(' ')[0]}`, fn: () => { combat.stop(); pickup = null; talkTo(n); firstMove(); } });
      opts.push({ label: `Examine ${n.name.split(' ')[0]}`, fn: () => hud.message(n.def.examine || `${n.name}.`) });
    }
    for (const g of at.pile.slice(0, 6)) {
      opts.push({ label: `Take ${describe(g)}`, icon: itemIcon(g.item).url, fn: () => { firstMove(); goPickup(t.x, t.y, g); } });
    }
    if (at.pile.length) opts.push({ label: `Examine ${itemName(at.pile[0].item)}`, fn: () => hud.message(ITEMS[at.pile[0].item].examine) });
    if (at.grave) {
      title ||= 'Your gravestone';
      opts.push({ label: 'Reclaim items', fn: () => { combat.stop(); goToGrave(t); } });
    }
    if (at.prop && !at.foe && !at.npc) {
      const p = at.prop;
      if (p.type === 'enter') {
        const b = area.buildings.find((x) => x.doorTiles === p.tiles);
        opts.push({ label: `Enter ${b?.label || 'building'}`, fn: () => { combat.stop(); useProp(p); } });
      } else if (p.action) {
        opts.push({ label: p.action === 'bank' ? 'Use bank booth' : 'Trade', fn: () => { combat.stop(); useProp(p); } });
      } else if (p.interact) {
        opts.push({ label: `Look at ${PROP_NAME[p.type] || p.type || 'this'}`, fn: () => { combat.stop(); useProp(p); } });
      }
    }
    if (area.isWalkable(t.x, t.y)) opts.push({ label: 'Walk here', fn: () => walkHere(t) });
    opts.push({ label: 'Cancel', fn: () => {} });
    hud.showMenu(sx, sy, title, opts);
  };

  const toggleRun = () => {
    if (!state.run.on && state.run.energy < 1) { hud.message('You have no run energy left.'); return; }
    state.run.on = !state.run.on;
  };
  hud.el.runOrb.addEventListener('click', toggleRun);

  input.onKey = (e) => {
    if (e.code === 'KeyR') toggleRun();
    else if (e.code === 'Equal' || e.code === 'NumpadAdd') zoomBy(1);
    else if (e.code === 'Minus' || e.code === 'NumpadSubtract') zoomBy(-1);
    else if (e.code === 'Escape') { if (hud.menuOpen) hud.closeMenu(); else if (hud.dialogOpen) hud.advanceDialog(); else if (hud.settingsOpen) { hud.closeSettings(); hud.closeSkills(); hud.closeInventory(); } }
    else if ((e.code === 'KeyI' || e.code === 'KeyB') && !hud.dialogOpen) { if (hud.invOpen) hud.closeInventory(); else hud.openInventory(); }
    else if (e.code === 'KeyK' && !hud.dialogOpen) { if (hud.skillsOpen) hud.closeSkills(); else hud.openSkills('skills'); }
    else if ((e.code === 'Space' || e.code === 'Enter') && hud.dialogOpen) { e.preventDefault(); hud.advanceDialog(); }
    else if (hud.dialogOpen && /^(Digit|Numpad)[1-9]$/.test(e.code)) hud.pickChoice(Number(e.code.slice(-1)) - 1);
  };

  // ---- Bank and shop ------------------------------------------------------------
  const bank = new Bank(state);
  const shop = new Shop(SHOPS.generalStore);

  const refreshTrade = () => {
    if (!hud.tradeOpen) return;
    if (hud.tradeMode === 'bank') hud.renderTrade(bank.items, inventory.slots);
    else hud.renderTrade(shop.stock.filter((x) => x.base > 0 || x.qty > 0).map((x) => ({ id: x.id, qty: x.qty, price: shop.buyPrice(x.id) })), inventory.slots, (id) => shop.sellPrice(id));
  };
  const runAction = (name) => {
    combat.stop();
    if (name === 'bank') hud.openTrade('bank', 'Bank of Brambleford');
    else if (name === 'shop') hud.openTrade('shop', shop.name);
    refreshTrade();
  };
  hud.onTradeClose = () => { refreshInventory(); save(); };
  hud.onTradeTake = (id) => {
    const q = hud.tradeQty;
    if (hud.tradeMode === 'bank') {
      const n = bank.withdraw(id, q, inventory);
      if (!n) hud.tradeStatus('Your bag is full.');
      else hud.tradeStatus(`Withdrew ${itemName(id)} × ${n}.`);
    } else {
      const r = shop.buy(id, q === Infinity ? 1000 : q, inventory);
      if (!r.n) hud.tradeStatus(r.why === 'coins' ? "You don't have enough coins." : r.why === 'space' ? 'Your bag is full.' : "That's out of stock.");
      else hud.tradeStatus(`Bought ${itemName(id)} × ${r.n} for ${r.cost} coins.`);
    }
    refreshTrade();
  };
  hud.onTradeGive = (i) => {
    const slot = inventory.slots[i];
    if (!slot) return;
    const q = hud.tradeQty;
    if (hud.tradeMode === 'bank') {
      const n = bank.deposit(inventory, i, q);
      hud.tradeStatus(`Deposited ${itemName(slot.id)} × ${n}.`);
    } else {
      if (slot.id === 'coins') { hud.tradeStatus("You can't sell coins!"); return; }
      const r = shop.sell(i, q, inventory);
      hud.tradeStatus(`Sold ${itemName(slot.id)} × ${r.n} for ${r.earned} coins.`);
    }
    refreshTrade();
  };
  hud.onDepositBag = () => { bank.depositAll(inventory); hud.tradeStatus('Deposited everything in your bag.'); refreshTrade(); };
  hud.onDepositGear = () => { bank.depositGear(equipment); hud.tradeStatus('Deposited everything you were wearing.'); refreshTrade(); };

  // ---- Food and potions -------------------------------------------------------
  let lastEatTick = -99;
  const eat = (i) => {
    const s = inventory.slots[i];
    const def = s && ITEMS[s.id];
    if (!def) return;
    if (ticker.count - lastEatTick < 3) return; // still chewing
    lastEatTick = ticker.count;
    if (def.food) {
      inventory.removeSlot(i);
      const before = state.player.hp;
      state.player.hp = Math.min(combat.maxHp, state.player.hp + def.food.heal);
      hud.message(`You eat the ${def.name.toLowerCase()}.${state.player.hp > before ? ' It heals some health.' : ''}`);
      if (state.player.hp > before) hud.flashHeal();
    } else if (def.potion) {
      const sk = def.potion.boost;
      const boost = 3 + Math.floor(book.level(sk) * 0.1);
      state.boosts[sk] = Math.max(state.boosts[sk] || 0, boost);
      inventory.slots[i] = { id: def.potion.next, qty: 1 };
      hud.message(`You drink some of your ${def.name.replace(/ \(\d\)$/, '').toLowerCase()}. ${SKILL_NAME[sk]} +${boost}.`);
    }
    combat.cooldown += 3; // eating or drinking delays your next attack
    refreshInventory();
    refreshSkills();
    save();
  };

  // ---- Gravestone ------------------------------------------------------------------
  const graveMenu = () => {
    const g = state.grave;
    if (!g) return;
    const age = state.stats.playTimeSec - g.createdAt;
    const free = age < FREE_SECONDS;
    const fee = graveFee(g);
    const pos = view.tileToScreen(g.x, g.y);
    const take = () => {
      if (!free) {
        if (inventory.count('coins') < fee) { hud.message(`You need ${fee} coins to reclaim your items now.`); return; }
        inventory.remove('coins', fee);
      }
      const all = reclaim(g, inventory, equipment);
      if (all) { state.grave = null; hud.message('You reclaim your items. The gravestone crumbles away.'); }
      else hud.message('Your bag is full. Some items are still in the gravestone.');
      refreshInventory();
      save();
    };
    hud.showMenu(pos.x, pos.y, `Gravestone (${g.items.length} item${g.items.length === 1 ? '' : 's'})`, [
      { label: free ? 'Reclaim items (free)' : `Pay ${fee} coins to reclaim`, fn: take },
      { label: 'Look', fn: () => hud.message(`Your lost items: ${g.items.slice(0, 6).map((it) => itemName(it.id)).join(', ')}${g.items.length > 6 ? '…' : ''}.`) },
      { label: 'Cancel', fn: () => {} },
    ]);
  };

  // An NPC hands you items once (remembered by a story flag).
  const giveItems = (npc) => (spec) => {
    if (state.flags[spec.flag]) return true;
    const needed = spec.items.filter((it) => !ITEMS[it.item].stackable || !inventory.count(it.item)).length;
    if (inventory.freeSlots < needed) return false;
    for (const it of spec.items) inventory.add(it.item, it.qty);
    state.flags[spec.flag] = true;
    hud.message(`${npc.name.split(' ')[0]} gives you: ${spec.items.map((it) => `${itemName(it.item)}${it.qty > 1 ? ` × ${it.qty}` : ''}`).join(', ')}.`);
    refreshInventory();
    save();
    return true;
  };

  player.onInteract = (prop) => {
    marker = null;
    goal = null;
    if (prop.npc) {
      const npc = prop.npc;
      npc.faceTowards(player.tile.x, player.tile.y);
      player.faceTowards(npc.standTile.x, npc.standTile.y);
      talkTarget = null;
      npc.busy = true;
      hud.startConversation({ name: npc.name, ...npc.def.talk }, { flags: state.flags, give: giveItems(npc), action: runAction }, () => {
        npc.busy = false;
        save();
      });
      return;
    }
    if (prop.grave) { graveMenu(); return; }
    if (prop.action) { runAction(prop.action); return; }
    if (prop.interact) hud.showDialog(prop.interact);
  };
  player.onRunEmpty = () => hud.message("You're out of run energy.");
  player.onStep = (tile) => {
    if (!player.path.length) { marker = null; if (!player.interact) goal = null; }
    const exit = area.exitAt.get(area.idx(tile.x, tile.y));
    if (exit && !transitioning) travel(exit);
  };

  // ---- Ticks ----------------------------------------------------------------
  const ticker = new Ticker();
  ticker.on((n) => {
    if (!dying) combat.tick(time);
    // Potion boosts wear off by 1 level a minute.
    if (n % 100 === 0) {
      for (const [sk, v] of Object.entries(state.boosts)) {
        if (v <= 0) continue;
        state.boosts[sk] = v - 1;
        if (v - 1 === 0) hud.message(`Your ${SKILL_NAME[sk]} boost has worn off.`);
      }
      refreshSkills();
    }
    if (n % 25 === 0) { shop.restock(); refreshTrade(); }
    if (state.grave && state.stats.playTimeSec - state.grave.createdAt > GRAVE_SECONDS) {
      state.grave = null;
      hud.message('Your gravestone has crumbled. The items in it are gone.');
      save();
    }
    ground.prune(time);
    player.onTick();
    for (const npc of npcs) npc.onTick(rng, tileFreeForNpc);
    state.stats.playTimeSec += 0.6;
    if (n % AUTOSAVE_TICKS === 0) save();
  });

  // ---- Frame loop -------------------------------------------------------------
  let zoomAcc = 0;
  let last = performance.now();
  // Your outfit only changes when your equipment does, so work it out then.
  let lookKey = '';
  let playerLook = null;
  const currentLook = () => {
    const key = JSON.stringify(equipment.slots);
    if (key !== lookKey) { lookKey = key; playerLook = equipment.look(); }
    return playerLook;
  };
  ticker.on(() => currentLook());

  const frame = (now) => {
    // Battery saver: draw every other screen refresh (about 30 a second).
    if (state.settings.batterySaver && now - last < 30) { requestAnimationFrame(frame); return; }
    const dt = Math.max(0, Math.min(0.25, (now - last) / 1000));
    last = now;
    time += dt;

    // Wheel and pinch: positive = zoom out. One whole step at a time.
    zoomAcc += input.consumeZoom();
    if (Math.abs(zoomAcc) >= 1) {
      zoomBy(zoomAcc > 0 ? -1 : 1);
      zoomAcc = 0;
    }

    const blocked = hud.dialogOpen || hud.settingsOpen || transitioning || dying;
    const dir = blocked ? null : input.heldDir();
    if (dir) { marker = null; goal = null; releaseTalkTarget(); combat.stop(); firstMove(); }
    ticker.update(dt);
    if (dir) pickup = null;
    if (!transitioning) player.update(dt, dir);
    if (pickup) tryPickup();
    for (const npc of npcs) npc.update(dt);
    for (const e of enemies) e.update(dt);

    view.render(player, { time, steps: state.stats.tilesWalked, marker, characters: npcs, enemies, combat, levelUpAt, ground: ground.list, playerLook: playerLook || currentLook(),
      grave: state.grave && state.grave.area === area.id ? state.grave : null });
    if (state.grave) {
      const left = Math.max(0, GRAVE_SECONDS - (state.stats.playTimeSec - state.grave.createdAt));
      const freeLeft = FREE_SECONDS - (state.stats.playTimeSec - state.grave.createdAt);
      const mm = Math.floor(left / 60), ss = String(Math.floor(left % 60)).padStart(2, '0');
      hud.setGraveTimer(`Gravestone ${mm}:${ss}${freeLeft > 0 ? ' · free to reclaim' : ''}`);
    } else hud.setGraveTimer(null);
    hud.setHp(state.player.hp, combat.maxHp);
    hud.setTarget(combat.target || enemies.find((e) => !e.dead && e.state === 'fight') || null, combat.level);
    hud.setRun(state.run.on, state.run.energy);
    requestAnimationFrame(frame);
  };

  const onResize = () => { view.resize(); applySettings(); };
  onResize();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));
  requestAnimationFrame(frame);

  document.getElementById('loading')?.classList.add('done');
  setTimeout(() => hud.showArea(area.name), 400);
  setTimeout(() => hud.message(loaded ? 'Welcome back.' : 'Welcome to RuneBound Chronicles.'), 900);
  if (!state.flags.seenMoveHint) {
    hud.showHint(coarse ? 'Tap the ground to walk · tap people to talk' : 'Click to walk, or use WASD / arrow keys · click people to talk');
  }
  if (!loaded) save();

  // Handle for testing in the browser console.
  window.RBC = {
    state, player, save, hud, version: GAME_VERSION,
    get area() { return area; }, get view() { return view; }, get npcs() { return npcs; },
    get enemies() { return enemies; }, get ground() { return ground; }, combat, book, inventory, equipment, bank, shop, eat, ticker,
  };
}

try {
  boot();
} catch (err) {
  console.error(err);
  fail(`Something went wrong while loading: ${err.message}`);
}
