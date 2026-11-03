"""Builds the game's art atlas from the cut-out sprite sheets.

    python3 tools/cut_sheets.py  SHEETS_DIR CUT_DIR     # once, cuts the sheets up
    python3 tools/build_art.py   CUT_DIR                # makes assets/art.png + art.json

Each entry below names a sprite in the game, says which cut-out it comes
from (sheet, number) and how big it should be in game pixels (16 px = 1 tile).
Sprites the game doesn't find in the atlas are drawn in code as before.
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageOps, ImageEnhance

sys.path.insert(0, os.path.dirname(__file__))
from shrink import shrink
from seamless import seamless

CUT = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), '..')

def src(sheet, n, box=None):
    im = Image.open(f'{CUT}/{sheet}/{n}.png').convert('RGBA')
    if box:  # (x0, y0, x1, y1) as fractions of the cut-out
        w, h = im.size
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
        im = im.crop(im.getbbox())
    return im

def tint(im, bright=1.0, sat=1.0):
    a = im.getchannel('A')
    rgb = ImageEnhance.Color(ImageEnhance.Brightness(im.convert('RGB')).enhance(bright)).enhance(sat)
    out = rgb.convert('RGBA'); out.putalpha(a); return out

NAT, PROPS, GROUND = '01_nature', '05_village_props', '16_ground_tiles'

# name: list of (image, size) variants. size = dict(w=.. or h=..), and 'box' to pad into a fixed box.
SPRITES = {}
def add(name, im, **size):
    SPRITES.setdefault(name, []).append((im, size))

# ---- Nature -------------------------------------------------------------------
oak, pine = src(NAT, 0), src(NAT, 2)
add('oak', oak, h=56); add('oak', ImageOps.mirror(oak), h=54)
add('oak', tint(oak, 0.9, 0.95), h=52); add('oak', tint(ImageOps.mirror(oak), 1.06), h=58)
add('pine', pine, h=58); add('pine', ImageOps.mirror(pine), h=54)
add('pine', tint(pine, 0.88), h=60); add('pine', tint(ImageOps.mirror(pine), 1.05), h=52)
birch, old, sap = src(NAT, 3), src(NAT, 1), src(NAT, 19)
add('birch', birch, h=56); add('birch', ImageOps.mirror(birch), h=52); add('birch', tint(birch, 0.92), h=58)
add('oldOak', old, h=72); add('oldOak', ImageOps.mirror(old), h=68)
add('sapling', sap, h=22); add('sapling', ImageOps.mirror(sap), h=19)
hollow = src(NAT, 15)
add('hollowLog', hollow, w=32); add('hollowLog', ImageOps.mirror(hollow), w=30)
bush, berry = src(NAT, 4), src(NAT, 5)
add('bush', bush, w=22); add('bush', ImageOps.mirror(bush), w=20); add('bush', berry, w=20); add('bush', tint(bush, 0.9), w=21)
grass = src(NAT, 6)
for k in range(4): add('tallGrass', ImageOps.mirror(grass) if k % 2 else grass, w=15 - k % 2, box=(16, 14))
for n in (7, 8, 9, 10):
    f = src(NAT, n)
    add('flowers', f, w=13, box=(16, 16)); add('flowers', ImageOps.mirror(f), w=12, box=(16, 16))
mush = src(NAT, 11)
add('mushrooms', mush, w=13, box=(16, 16)); add('mushrooms', ImageOps.mirror(mush), w=11, box=(16, 16)); add('mushrooms', mush, w=9, box=(16, 16))
big, small = src(NAT, 12), src(NAT, 13)
add('rock', big, w=20); add('rock', ImageOps.mirror(big), w=19); add('rock', small, w=15); add('rock', ImageOps.mirror(small), w=14)
stump = src(NAT, 14)
add('stump', stump, w=18); add('stump', ImageOps.mirror(stump), w=17)
add('logPile', src(NAT, 16), w=30)
reeds, lily = src(NAT, 18), src(NAT, 17)
add('reeds', reeds, h=20); add('reeds', ImageOps.mirror(reeds), h=17); add('reeds', reeds, h=14)
add('lilyPads', lily, w=15, box=(16, 16)); add('lilyPads', ImageOps.mirror(lily), w=12, box=(16, 16)); add('lilyPads', lily, w=9, box=(16, 16))

# ---- Village props -------------------------------------------------------------
add('well', src(PROPS, 0), h=42)
add('stall', src(PROPS, 1), w=38)
add('lamp', src(PROPS, 2), h=36)
add('sign', src(PROPS, 3), w=20)
add('scarecrow', src(PROPS, 6), h=34)
add('crop', src(PROPS, 7, (0, 0, 0.34, 0.5)), w=12, box=(16, 16))      # young turnip leaves
add('crop', src(PROPS, 8, (0, 0.5, 0.34, 1)), w=14, box=(16, 16))      # a ripe pumpkin
add('crop', src(PROPS, 8, (0, 0, 0.34, 0.5)), w=13, box=(16, 16))      # a cabbage
add('tanningRack', src(PROPS, 9), h=28)
tent = src(PROPS, 12)
add('tent', tent, w=36); add('tent', ImageOps.mirror(tent), w=36)
add('crate', src(PROPS, 13), w=16)
add('barrel', src(PROPS, 14), w=15)
add('chest', src(PROPS, 15), w=18)
add('campChest', src(PROPS, 15), w=22)
add('crateStack', src(PROPS, 18), w=26)
add('openBarrel', src(PROPS, 19), w=15)
# fence: one post, and the rails between two posts (taken from the straight fence)
add('fencePost', src(PROPS, 4, (0, 0, 0.17, 1)), h=20)
add('fenceRail', src(PROPS, 4, (0.12, 0.08, 0.88, 0.85)), w=18, outline=False)
add('picketPost', src(PROPS, 16, (0, 0, 0.2, 1)), h=18)
add('picketRail', src(PROPS, 16, (0.15, 0.05, 0.85, 1)), w=18, outline=False)

# ---- One-off pieces --------------------------------------------------------------------
add('coop', src('04_village_buildings', 7, (0, 0, 0.62, 1)), w=34)
add('shrine', src('03_altars_magic', 3), w=34)
add('runeStone', src('03_altars_magic', 4), h=30)
add('skeleton', src('02_whispering_vale', 9), w=24); add('skeleton', ImageOps.mirror(src('02_whispering_vale', 9)), w=20)

# ---- Whispering Vale ------------------------------------------------------------------
VALE, ALT, MINE = '02_whispering_vale', '03_altars_magic', '06_mine_smithing'
dead, bloom, crys = src(VALE, 0), src(VALE, 1), src(VALE, 2)
add('deadTree', dead, h=50); add('deadTree', ImageOps.mirror(dead), h=46); add('deadTree', tint(dead, 0.85), h=52); add('deadTree', ImageOps.mirror(dead), h=44)
add('gloomTree', bloom, h=54); add('gloomTree', ImageOps.mirror(crys), h=54); add('gloomTree', ImageOps.mirror(bloom), h=50); add('gloomTree', crys, h=52)
thorn = src(VALE, 3)
add('thornBush', thorn, w=20); add('thornBush', ImageOps.mirror(thorn), w=18); add('thornBush', thorn, w=16)
shroom = src(VALE, 4)
for k, w in enumerate((13, 11, 9)): add('glowShrooms', ImageOps.mirror(shroom) if k == 1 else shroom, w=w, box=(16, 16))
ghost = src(VALE, 5)
for k in range(4): add('glowFlowers', ImageOps.mirror(ghost) if k % 2 else ghost, w=13 - k, box=(16, 16))
shard = src(VALE, 6)
for k, w in enumerate((14, 12, 10)): add('crystalShard', ImageOps.mirror(shard) if k == 1 else shard, w=w, box=(16, 16))
dgrass = src(VALE, 8)
for k in range(4): add('deadGrass', ImageOps.mirror(dgrass) if k % 2 else dgrass, w=15 - k % 2, box=(16, 14))
stone = src(VALE, 11)
add('standingStone', stone, h=26); add('standingStone', ImageOps.mirror(stone), h=24); add('standingStone', stone, h=28)
cluster = src(VALE, 7)
add('oreEssence', cluster, w=22); add('oreEssence', ImageOps.mirror(cluster), w=20)

# ---- Altars (two frames each: the second a little brighter, so they pulse) -------------
for n, v in ((0, 'air'), (1, 'mind'), (2, 'water')):
    im = src(ALT, n)
    add('altar:' + v, im, w=48); add('altar:' + v, tint(im, 1.15, 1.1), w=48)

# ---- Mine ------------------------------------------------------------------------------
for n, v in ((0, 'copper'), (1, 'tin'), (2, 'iron')):
    im = src(MINE, n)
    add('ore:' + v, im, w=21); add('ore:' + v, ImageOps.mirror(im), w=20)
rub = src(MINE, 7)
add('oreEmpty', rub, w=19); add('oreEmpty', ImageOps.mirror(rub), w=18)
add('furnace', src(MINE, 4), w=28)
add('anvil', src(MINE, 5), w=18)
add('mineLamp', src(MINE, 6), h=32)
add('caveMouth', src(MINE, 3), w=40)            # the wolf den: a dark hollow in the rocks
add('caveMouth', rub, w=38)                     # the sealed cave: a heap of boulders
add('mineEntrance', src(MINE, 8), w=44)

# ---- Buildings (one per footprint width, 5 and 6 tiles; 16 px a tile + 3 px overhang each side) ----
BLD = '04_village_buildings'
for n, key in ((0, 'house-red'), (1, 'house-blue'), (2, 'house-green'), (3, 'house-purple'), (4, 'cabin')):
    im = tint(src(BLD, n), 1.25, 1.1) if key == 'house-purple' else src(BLD, n)
    for tw in (5, 6): add(f'building:{key}:{tw}', im, w=tw * 16 + 6)
for tw in (5, 6):
    add(f'building:store:{tw}', ImageOps.mirror(src(BLD, 5)), w=tw * 16 + 6)   # mirrored: door on the left, like the game's store
    add(f'building:bank:{tw}', src(BLD, 6), w=tw * 16 + 14)                     # the hanging sign sticks out to the right

# ---- Item icons (a 32 px one for menus and the bag, a 16 px one for the ground) ------------
ICONS = {
    '13_equipment_icons': ['bronzeDagger', 'bronzeSword', 'bronzeAxe', 'bronzePickaxe', 'bronzeMedHelm', 'bronzeSqShield', 'bronzeChainbody',
                           'ironDagger', 'ironSword', 'ironAxe', 'ironPickaxe', 'ironMedHelm', 'ironSqShield', 'ironChainbody',
                           'woodenShield', 'shortbow', 'longbow', 'oakShortbow', 'oakLongbow', 'apprenticeStaff', 'bronzeArrow',
                           'ironArrow', 'bronzeArrowtips', 'ironArrowtips', 'arrowShaft', 'headlessArrow', 'feather', 'goblinMail'],
    '14_tools_materials_icons': ['hammer', 'knife', 'needle', 'thread', 'smallNet', 'fishingRod', 'flyFishingRod', 'fishingBait', 'logs', 'oakLogs',
                                 'copperOre', 'tinOre', 'ironOre', 'bronzeBar', 'ironBar', 'runeEssence', 'airRune', 'mindRune', 'waterRune', 'bones',
                                 'coins', 'cowhide', 'wolfPelt', 'leather', 'hardLeather', None, 'bag', 'warCharm', 'wolfCloak', 'hardLeatherBody'],
    '15_food_potions_leather_icons': ['rawShrimps', 'shrimps', 'rawSardine', 'sardine', 'rawHerring', 'herring', 'rawTrout', 'cookedTrout', 'rawSalmon', 'salmon',
                                      'rawAnchovies', 'anchovies', 'rawChicken', 'cookedChicken', 'rawBeef', 'cookedMeat', 'burntFish', ['burntMeat', 'burntChicken'],
                                      'bread', 'meatPie', 'attackPotion', 'strengthPotion', 'defencePotion', 'leatherGloves', 'leatherBoots', 'leatherCowl',
                                      'leatherVambraces', 'leatherBody', 'leatherChaps', 'vial'],
}
def fit(im, box):
    k = min(box / im.width, box / im.height)
    return dict(w=max(1, round(im.width * k)), h=max(1, round(im.height * k)), box=(box + 2, box + 2) if box > 16 else (box + 1, box + 1))
for sheet, ids in ICONS.items():
    for n, ids_ in enumerate(ids):
        if not ids_: continue
        im = src(sheet, n)
        for id_ in ([ids_] if isinstance(ids_, str) else ids_):
            add('icon:' + id_, im, **fit(im, 30))
            add('iconS:' + id_, im, **fit(im, 15))

# ---- Characters and creatures ------------------------------------------------------
# Frame sheets: each character is 3 columns (step, stand, step) x 4 rows
# (down, up, left, right). The game wants each direction as [stand, step, step].
# key: (sheet, columns in sheet, first column, first row, height of the standing front frame)
CHARS = {
    'player': ('07_characters_adventurer_elder_guard_child', 6, 0, 0, 24),
    'maren': ('07_characters_adventurer_elder_guard_child', 6, 3, 0, 24),
    'tomas': ('07_characters_adventurer_elder_guard_child', 6, 0, 4, 26),
    'pip': ('07_characters_adventurer_elder_guard_child', 6, 3, 4, 20),
    'pell': ('08_characters_shopkeeper_banker_farmer', 9, 0, 0, 24),
    'edda': ('08_characters_shopkeeper_banker_farmer', 9, 3, 0, 24),
    'wyn': ('08_characters_shopkeeper_banker_farmer', 9, 6, 0, 25),
    'bram': ('09_characters_woodcutter_traveller_fisherman', 9, 0, 0, 25),
    'wren': ('09_characters_woodcutter_traveller_fisherman', 9, 3, 0, 25),
    'finn': ('09_characters_woodcutter_traveller_fisherman', 9, 6, 0, 25),
    'hilda': ('10_characters_tanner_miner_runekeeper', 9, 0, 0, 24),
    'dorrin': ('10_characters_tanner_miner_runekeeper', 9, 3, 0, 24),
    'aldric': ('10_characters_tanner_miner_runekeeper', 9, 6, 0, 25),
    'enemy:goblin': ('11_enemies', 6, 0, 0, 20),
    'enemy:goblinBrute': ('11_enemies', 6, 3, 0, 28),
    'enemy:tunnelGoblin': ('11_enemies', 6, 0, 4, 21),
    'enemy:essenceGolem': ('11_enemies', 6, 3, 4, 30),
    'enemy:wolf': ('12_animals', 6, 0, 0, 18),
    'enemy:alphaWolf': ('12_animals', 6, 3, 0, 25),
    'enemy:chicken': ('12_animals', 6, 0, 4, 12),
    'enemy:cow': ('12_animals', 6, 3, 4, 22),
}
FRAMES = {}  # key: list of 12 (image, scale) in game order

def char_frames(sheet, cols, c0, r0, height):
    grid = [[src(sheet, (r0 + r) * cols + c0 + c) for c in range(3)] for r in range(4)]
    scale = height / grid[0][1].height  # one scale for every frame, from the standing front frame
    out = []
    for r in range(4):
        for c in (1, 0, 2):
            out.append(grid[r][c])
    return out, scale

for key, spec in CHARS.items():
    FRAMES[key] = char_frames(*spec)

# ==== Second set of sheets (17-31) ====================================================
FIRE, GRAVE, BLD2, FENCE, INT = '17_fire_and_water_animations', '22_graveyard_and_ruins', '23_unique_buildings', '24_fences', '25_shop_and_bank_interiors'

# Fire and water: 4 frames each
for k in range(4):
    add('campfire', src(FIRE, k), w=18)
    add('cookingPit', src(FIRE, 4 + k), w=24)
    add('fishingSpot', src(FIRE, 8 + k), w=16)
    add('fishingSpotVale', src(FIRE, 12 + k), w=16)

# Fences: a post, the rails to the east (from the left-right section) and the
# rails to the south (from the top-bottom section), for each style.
for name, sheet, post, ew, ns, ph in (('wood', FENCE, 0, 1, 2, 20), ('picket', FENCE, 5, 6, 7, 18), ('iron', GRAVE, 0, 1, 2, 20)):
    add(f'fence:{name}:post', src(sheet, post), h=ph)
    add(f'fence:{name}:east', src(sheet, ew, (0.14, 0, 0.86, 1)), w=18, outline=False)
    add(f'fence:{name}:south', src(sheet, ns, (0, 0.22, 1, 0.8)), h=17, outline=False)

# Graveyard and ruins
for k, n in enumerate((5, 6, 7, 8, 9)): add('graveStone', src(GRAVE, n), h=18)
for n in (10, 11, 12): add('graveMound', src(GRAVE, n), w=16, box=(16, 16))
add('memorial', src(GRAVE, 13), h=38)
add('gravestone', src(GRAVE, 14), h=20)           # the player's own grave: a wooden cross
add('ruinTower', src(GRAVE, 15), h=46)
add('ruinArch', src(GRAVE, 16), w=40)
add('ruinLow', src(GRAVE, 17), w=36); add('ruinLow', src(GRAVE, 18), w=32)
add('ruinWall', src(GRAVE, 17), w=18); add('ruinWall', src(GRAVE, 18), w=18)
add('fallenPillar', src(GRAVE, 19), w=32)
for n in (20, 21, 22): add('rubble', src(GRAVE, n), w=15, box=(16, 16))
add('bones', src(GRAVE, 24), w=15, box=(16, 12)); add('bones', src(GRAVE, 23), w=10, box=(16, 12)); add('bones', src(GRAVE, 25), w=13, box=(16, 12))

# Unique buildings and the bow board
add('building:chiefHut', src(BLD2, 0), w=6 * 16 + 10)
add('building:hermit', src(BLD2, 1), w=5 * 16 + 14)
add('building:farmstead', src(BLD2, 2), w=6 * 16 + 8)
add('bowSign', src(BLD2, 3), h=18)

# Interiors
add('counter:3', src(INT, 1), w=48); add('counter:2', src(INT, 0), w=32); add('counter:1', src(INT, 2), w=16)
add('bankBooth', src(INT, 3), w=32)
for n in (4, 5, 6, 7): add('shelf', src(INT, n), w=18)
add('rug', src(INT, 8), w=50)
add('plant', src(INT, 9), h=24)
add('stool', src(INT, 10), w=10); add('table', src(INT, 11), w=22)
add('interiorDoor', src(INT, 13), h=30)
add('wallLamp', src(INT, 14), h=16)
add('grainSack', src(INT, 15), w=15)
add('coinChest', src(INT, 16), w=18)

# Edda the banker
CHARS['edda'] = ('20_edda_the_banker', 3, 0, 0, 24)
FRAMES['edda'] = char_frames(*CHARS['edda'])

# Skill icons, interface icons, combat effects (32 px box for the menus)
SKILLS_ORDER = ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'magic', 'woodcutting', 'fletching', 'mining', 'smithing', 'fishing', 'cooking', 'crafting', 'runecrafting']
for n, sk in enumerate(SKILLS_ORDER):
    im = src('26_skill_icons', n); add('skill:' + sk, im, **fit(im, 30)); add('skillS:' + sk, im, **fit(im, 14))
UI = ['equipment', 'settings', 'heart', 'run', 'walk', 'bag', 'bank', 'coins', 'accurate', 'aggressive', 'defensive', 'controlled', 'rapid', 'longrange', 'retaliateOn', 'retaliateOff']
for n, k in enumerate(UI):
    im = src('27_interface_icons', n); add('ui:' + k, im, **fit(im, 30))
FX = '28_combat_effects'
add('splat:hit', src(FX, 0), w=15); add('splat:miss', src(FX, 1), w=15); add('splat:heal', src(FX, 2), w=15)
add('bar:frame', src(FX, 3), w=20, outline=False)
add('levelBurst', src(FX, 6), w=30); add('sparkle', src(FX, 7), w=12)

# Spells and arrows
SP = '30_spells_and_projectiles'
for k in range(4): add('spell:wind', src(SP, k), w=14); add('spell:water', src(SP, 8 + k), w=13)
for k in range(3): add('spell:windHit', src(SP, 4 + k), w=16); add('spell:waterHit', src(SP, 12 + k), w=16)
for k, d in enumerate(['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']): add('arrow:' + d, src(SP, 15 + k), w=11 if d in ('e', 'w') else None, h=11 if d in ('n', 's') else None) if d in ('e', 'w', 'n', 's') else add('arrow:' + d, src(SP, 15 + k), w=10)

# Combat animations. Each direction's frames; right is the left frames mirrored
# so they always face the right way.
ANIMS = {}  # key: (list of images, scale)
def grid_frames(sheet, cols, r, c):
    return src(sheet, r * cols + c)
ADV = '18_adventurer_combat_animations'
adv_scale = 24 / src(ADV, 6).height
for move, c0, n in (('slash', 0, 3), ('bow', 3, 3), ('cast', 6, 3), ('hit', 9, 2), ('fall', 11, 2)):
    for r, d in enumerate(['down', 'up', 'left']):
        ANIMS[f'player:{move}:{d}'] = ([grid_frames(ADV, 13, r, c0 + k) for k in range(n)], adv_scale)
        if d == 'left': ANIMS[f'player:{move}:right'] = ([ImageOps.mirror(grid_frames(ADV, 13, r, c0 + k)) for k in range(n)], adv_scale)
EN = '19_enemy_and_animal_attacks'
for row, (key, h) in enumerate((('goblin', 20), ('goblinBrute', 28), ('tunnelGoblin', 21), ('essenceGolem', 30), ('wolf', 18), ('alphaWolf', 25), ('cow', 22), ('chicken', 12))):
    sc = h / src(EN, row * 16).height
    for d, c0 in (('down', 0), ('up', 3), ('left', 6)):
        ANIMS[f'{key}:attack:{d}'] = ([src(EN, row * 16 + c0 + k) for k in range(3)], sc)
    ANIMS[f'{key}:attack:right'] = ([ImageOps.mirror(src(EN, row * 16 + 6 + k)) for k in range(3)], sc)
    ANIMS[f'{key}:hit'] = ([src(EN, row * 16 + 12 + k) for k in range(2)], sc)
    ANIMS[f'{key}:fall'] = ([src(EN, row * 16 + 14 + k) for k in range(2)], sc)

# Future enemies: walking frames plus attacks, ready for when they arrive
FUT = '31_future_enemies'
for k0, (key, h) in enumerate((('goblinChief', 30), ('caveBeast', 34), ('nightStalker', 26))):
    r0 = k0 * 4
    sc = h / src(FUT, r0 * 6 + 1).height
    FRAMES['enemy:' + key] = ([src(FUT, (r0 + r) * 6 + c) for r in range(4) for c in (1, 0, 2)], sc)
    for r, d in enumerate(['down', 'up', 'left', 'right']):
        ANIMS[f'{key}:attack:{d}'] = ([src(FUT, (r0 + r) * 6 + 3 + k) for k in range(3)], sc)

# ---- Ground textures (64 x 64, repeat every 4 tiles) --------------------------------
# name: (cut-out number, size in pixels, calm) — calm pulls colours toward the
# average so busy textures don't fight the sprites drawn on top of them.
TEXTURES = {'grass': (0, 64, 0.45), 'path': (3, 32, 0.25), 'plaza': (4, 32, 0.15), 'sand': (5, 48, 0.2), 'dirt': (6, 48, 0.1),
            'water0': (7, 64, 0.25), 'water1': (8, 64, 0.25), 'bridge': (9, 32, 0), 'floor': (10, 32, 0.1), 'cave': (12, 32, 0.2),
            'rockwall': (13, 64, 0.15, 0.45), 'valeGrass': (14, 64, 0.4), 'valePath': (15, 32, 0.25), 'valeWater0': (16, 64, 0.2), 'valeWater1': (17, 64, 0.2),
            'grassPink': (1, 64, 0.2), 'grassYellow': (2, 64, 0.2), 'valeBlue': (18, 64, 0.2), 'valePurple': (19, 64, 0.2), 'wall': (11, 32, 0.1)}

def calm(im, k):
    a = np.array(im).astype(np.float32)
    mean = a[..., :3].reshape(-1, 3).mean(0)
    a[..., :3] = a[..., :3] * (1 - k) + mean * k
    return Image.fromarray(a.astype(np.uint8))

def build():
    tiles = []  # (name, k, Image, ax, ay)
    for name, vs in SPRITES.items():
        for k, (im, size) in enumerate(vs):
            size = dict(size)
            box = size.pop('box', None)
            outline = size.pop('outline', True)
            s = shrink(im, outline=outline, **size)
            if box:
                bw, bh = box
                s = s.crop((0, 0, min(s.width, bw), min(s.height, bh))) if (s.width > bw or s.height > bh) else s
                c = Image.new('RGBA', (bw, bh))
                c.alpha_composite(s, ((bw - s.width) // 2, (bh - s.height) // 2 if name.startswith('icon') else bh - s.height)); s = c
            a = np.array(s.getchannel('A'))
            rows = np.where(a.max(1) > 0)[0]
            ay = int(rows[-1]) if len(rows) else s.height - 1
            tiles.append((name, k, s, s.width // 2, ay))
    for key, (ims, scale) in FRAMES.items():
        for k, im in enumerate(ims):
            w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            sm = shrink(im, w=w, h=h)
            a = np.array(sm.getchannel('A')) > 0
            rows = np.where(a.any(1))[0]
            ay = int(rows[-1]) if len(rows) else h - 1
            feet = a[max(0, ay - max(2, h // 5)):ay + 1]   # centre on the feet, so frames line up
            cols = np.where(feet.any(0))[0]
            ax = int(round((cols.min() + cols.max()) / 2)) if len(cols) else w // 2
            tiles.append(('chars:' + key, k, sm, ax, ay))
    for key, (ims, scale) in ANIMS.items():
        for k, im in enumerate(ims):
            w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            sm = shrink(im, w=w, h=h)
            a = np.array(sm.getchannel('A')) > 0
            rows = np.where(a.any(1))[0]
            ay = int(rows[-1]) if len(rows) else h - 1
            feet = a[max(0, ay - max(2, h // 5)):ay + 1]
            cols = np.where(feet.any(0))[0]
            ax = int(round((cols.min() + cols.max()) / 2)) if len(cols) else w // 2
            tiles.append(('anim:' + key, k, sm, ax, ay))
    # Gear worn by the player: each piece placed on the standing frame of each
    # direction, anchored to the player's feet so it can be drawn on top.
    std = {}
    for (name, k, im, ax, ay) in tiles:
        if name == 'chars:player' and k in (0, 3, 6, 9): std[['down', 'up', 'left', 'right'][k // 3]] = (np.array(im.getchannel('A')) > 0, ax, ay)
    gdir = os.path.join(CUT, '21_gear')
    if std and os.path.isdir(gdir):
        a0, _, _ = std['down']
        rows = np.where(a0.any(1))[0]; top, bot = rows[0], rows[-1]; H = bot - top
        headRows = a0[top:top + max(3, int(H * 0.36))]
        hc = np.where(headRows.any(0))[0]
        headW = hc.max() - hc.min() + 1
        helm = Image.open(f'{gdir}/bronzeMedHelm-down.png')
        g = headW * 1.12 / helm.width
        SLOT = {}
        for id_ in ['bronzeMedHelm', 'ironMedHelm', 'leatherCowl']: SLOT[id_] = 'head'
        for id_ in ['bronzeChainbody', 'ironChainbody', 'leatherBody', 'hardLeatherBody', 'goblinMail']: SLOT[id_] = 'body'
        SLOT.update(leatherChaps='legs', leatherBoots='feet', wolfCloak='cape', warCharm='neck')
        for id_ in ['bronzeDagger', 'ironDagger', 'bronzeSword', 'ironSword', 'bronzeAxe', 'ironAxe', 'shortbow', 'longbow', 'oakShortbow', 'oakLongbow', 'apprenticeStaff']: SLOT[id_] = 'weapon'
        for id_ in ['woodenShield', 'bronzeSqShield', 'ironSqShield']: SLOT[id_] = 'shield'
        for id_, slot in SLOT.items():
            for d in ['down', 'up', 'left', 'right']:
                f = f'{gdir}/{id_}-{d}.png'
                if not os.path.exists(f): continue
                src_im = Image.open(f).convert('RGBA')
                # each kind of piece shrunk to fit its part of the body (game pixels)
                size = {'head': ('w', 12), 'body': ('w', 11), 'legs': ('h', 8), 'feet': ('h', 6), 'cape': ('h', 16), 'neck': ('w', 7), 'shield': ('h', 10)}.get(slot)
                if slot == 'weapon':
                    size = ('h', 8 if 'Dagger' in id_ else 12 if 'Sword' in id_ else 11 if 'Axe' in id_ else 18 if id_ == 'apprenticeStaff' else 16 if 'long' in id_.lower() else 13)
                    if d in ('left', 'right') and 'bow' not in id_.lower() and id_ != 'apprenticeStaff': size = ('w', size[1])
                box = {'head': (12, 11), 'body': (12, 10), 'legs': (10, 8), 'feet': (12, 5), 'neck': (7, 5)}.get(slot)
                if id_ == 'leatherCowl': box = (13, 12)
                if box and d in ('left', 'right'): box = (box[0] - 2, box[1])  # narrower side-on
                if box: w, h = box
                else:
                    k_ = size[1] / (src_im.width if size[0] == 'w' else src_im.height)
                    w, h = max(1, round(src_im.width * k_)), max(1, round(src_im.height * k_))
                sm = shrink(src_im, w=w, h=h)
                al, pax, pay = std[d]
                rws = np.where(al.any(1))[0]; t0, b0 = rws[0], rws[-1]; HH = b0 - t0
                def span(y0, y1):
                    c = np.where(al[int(y0):int(y1) + 1].any(0))[0]
                    return (c.min(), c.max()) if len(c) else (pax - 3, pax + 3)
                hl, hr = span(t0, t0 + HH * 0.36); bl, br = span(t0 + HH * 0.45, t0 + HH * 0.7)
                hcx, bcx = (hl + hr) / 2, (bl + br) / 2
                if slot == 'head': tx, ty = hcx - w / 2, t0 - (2 if id_ == 'leatherCowl' else 1)
                elif slot == 'body': tx, ty = bcx - w / 2, t0 + HH * 0.6 - h / 2
                elif slot == 'legs': tx, ty = bcx - w / 2, b0 - h
                elif slot == 'feet': tx, ty = bcx - w / 2, b0 - h + 1
                elif slot == 'cape': tx, ty = bcx - w / 2, t0 + HH * 0.58 - h / 2
                elif slot == 'neck': tx, ty = hcx - w / 2, t0 + HH * 0.42 - h / 2
                elif slot == 'weapon':
                    hx = {'down': bl + 1, 'up': br - 1, 'left': bl + 1, 'right': br - 1}[d]
                    tx, ty = hx - w / 2, t0 + HH * 0.66 - h / 2
                else:
                    hx = {'down': br - 1, 'up': bl + 1, 'left': br - 2, 'right': bl + 2}[d]
                    tx, ty = hx - w / 2, t0 + HH * 0.6 - h / 2
                tiles.append((f'gear:{id_}:{d}', 0, sm, int(round(pax - tx)), int(round(pay - ty))))
    # Skilling tools, lying along +x with the grip at the left end, so the game
    # can turn them to any angle as they swing.
    T29 = '29_skilling_tools'
    if os.path.isdir(os.path.join(CUT, T29)):
        for name, n, w in (('bronzeAxe', 2, 15), ('ironAxe', 8, 15), ('bronzePickaxe', 14, 15), ('ironPickaxe', 20, 15), ('hammer', 26, 12)):
            sm = shrink(src(T29, n), w=w)
            a_ = np.array(sm.getchannel('A')) > 0
            col = next(x for x in range(a_.shape[1]) if a_[:, x].any())
            ys_ = np.where(a_[:, col:col + 2].any(1))[0]
            tiles.append((f'tool:{name}', 0, sm, col, int(round(ys_.mean()))))
        for k in range(3):
            sm = shrink(src(T29, 21 + k), w=16); tiles.append(('tool:pan', k, sm, 3, sm.height - 4))
            sm = shrink(src(T29, 15 + k), w=15); tiles.append(('tool:net', k, sm, 2, sm.height - 4))
    for name, spec in TEXTURES.items():
        n, size, k = spec[:3]
        sat = spec[3] if len(spec) > 3 else 1
        g0 = src(GROUND, n)
        if sat != 1: g0 = tint(g0, 1, sat)
        t = calm(shrink(seamless(g0).convert('RGBA'), w=size, h=size, outline=False, colors=32), k)
        tiles.append(('tex:' + name, 0, t, 0, 0))
    # Recoloured copies for items with no sheet of their own (tools/derived.py).
    from derived import derive
    have = {}
    for (name, k, im, ax, ay) in tiles: have.setdefault(name, []).append((k, im, ax, ay))
    tiles += [t for t in derive(lambda n: sorted(have.get(n, []), key=lambda v: v[0])) if t[0] not in have]
    # pack into rows, tallest first
    tiles.sort(key=lambda t: -t[2].height)
    W, x, y, rowh, placed = 1024, 0, 0, 0, []
    for t in tiles:
        im = t[2]
        if x + im.width > W: x, y, rowh = 0, y + rowh + 1, 0
        placed.append((t, x, y)); x += im.width + 1; rowh = max(rowh, im.height)
    atlas = Image.new('RGBA', (W, y + rowh))
    meta = {}
    for (name, k, im, ax, ay), px, py in placed:
        atlas.alpha_composite(im, (px, py))
        meta.setdefault(name, []).append((k, [px, py, im.width, im.height, ax, ay]))
    meta = {n: [v for _, v in sorted(vs)] for n, vs in meta.items()}
    os.makedirs(f'{ROOT}/assets', exist_ok=True)
    atlas.save(f'{ROOT}/assets/art.png', optimize=True)
    with open(f'{ROOT}/assets/art.json', 'w') as f: json.dump(meta, f, separators=(',', ':'))
    print('atlas', atlas.size, len(placed), 'images', os.path.getsize(f'{ROOT}/assets/art.png') // 1024, 'KB')

build()
