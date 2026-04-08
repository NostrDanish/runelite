import { TileData, NpcData, WorldPosition } from './types.ts';

export const MAP_WIDTH = 48;
export const MAP_HEIGHT = 48;

// Tile appearance
export const TILE_COLORS: Record<string, string> = {
  grass: '#2d5a1e',
  dirt: '#8b7355',
  stone: '#6b6b6b',
  water: '#1e3a5f',
  sand: '#d4b896',
  tree: '#1a4a10',
  rock: '#555555',
  bank: '#8b6914',
  ge: '#d4a017',
  altar: '#6b3fa0',
  furnace: '#b34700',
  anvil: '#444444',
  portal: '#3b82f6',
};

export const TILE_ICONS: Record<string, string> = {
  tree: '🌲',
  rock: '🪨',
  bank: '🏦',
  ge: '💰',
  altar: '⛪',
  furnace: '🔥',
  anvil: '🔨',
  portal: '🌀',
  water: '🌊',
};

function t(type: TileData['type'], walkable = true, interactable = false, label?: string): TileData {
  return { type, walkable, interactable, label };
}

// Generate the world map
function generateMap(): TileData[][] {
  const map: TileData[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Default: grass
      map[y][x] = t('grass');
    }
  }

  // ===== LUMBRIDGE AREA (center) =====
  // Town square - stone paths
  for (let y = 20; y < 28; y++) {
    for (let x = 20; x < 28; x++) {
      map[y][x] = t('stone');
    }
  }

  // Bank
  map[21][22] = t('bank', true, true, 'Bank');
  map[21][23] = t('bank', true, true, 'Bank');
  map[21][24] = t('bank', true, true, 'Bank');

  // Grand Exchange area
  for (let y = 22; y < 26; y++) {
    for (let x = 24; x < 28; x++) {
      map[y][x] = t('sand');
    }
  }
  map[23][25] = t('ge', true, true, 'Grand Exchange');
  map[23][26] = t('ge', true, true, 'Grand Exchange');
  map[24][25] = t('ge', true, true, 'Grand Exchange');
  map[24][26] = t('ge', true, true, 'Grand Exchange');

  // Altar
  map[26][21] = t('altar', true, true, 'Altar');

  // Furnace & Anvil
  map[20][25] = t('furnace', true, true, 'Furnace');
  map[20][26] = t('anvil', true, true, 'Anvil');

  // Portal
  map[24][20] = t('portal', true, true, 'Portal');

  // ===== FOREST (west) =====
  const treePositions = [
    [10,5],[11,7],[12,4],[13,8],[14,3],[15,6],[10,10],[12,11],
    [8,6],[9,9],[14,10],[15,4],[11,3],[13,5],[10,8],[12,9],
    [7,4],[8,8],[16,5],[16,9],[9,3],[11,11],[13,11],[15,8],
    [7,7],[9,11],[14,6],[16,3],[8,10],[10,4],[12,7],[14,4],
  ];
  for (const [y, x] of treePositions) {
    if (y < MAP_HEIGHT && x < MAP_WIDTH) {
      map[y][x] = t('tree', false, true, 'Tree');
    }
  }

  // Dirt paths through forest
  for (let x = 2; x < 18; x++) {
    map[12][x] = t('dirt');
  }
  for (let y = 8; y < 18; y++) {
    map[y][12] = t('dirt');
  }

  // ===== MINING AREA (northeast) =====
  const rockPositions = [
    [5,35],[5,37],[5,39],[6,34],[6,36],[6,38],[6,40],
    [7,35],[7,37],[7,39],[8,34],[8,36],[8,38],
    [4,36],[4,38],[9,35],[9,37],
  ];
  for (const [y, x] of rockPositions) {
    if (y < MAP_HEIGHT && x < MAP_WIDTH) {
      map[y][x] = t('rock', false, true, 'Rock');
    }
  }
  // Stone ground around mines
  for (let y = 3; y < 11; y++) {
    for (let x = 33; x < 42; x++) {
      if (map[y][x].type === 'grass') {
        map[y][x] = t('stone');
      }
    }
  }

  // ===== FISHING AREA (south) =====
  for (let y = 38; y < 45; y++) {
    for (let x = 10; x < 25; x++) {
      map[y][x] = t('water', false, false);
    }
  }
  // Sand beach
  for (let x = 10; x < 25; x++) {
    map[37][x] = t('sand', true, true, 'Fishing Spot');
  }
  for (let y = 38; y < 45; y++) {
    map[y][9] = t('sand');
    map[y][25] = t('sand');
  }

  // ===== WILDERNESS (north) - PvP zone =====
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      map[y][x] = t('dirt');
    }
  }

  // Connect paths
  for (let y = 4; y < 20; y++) map[y][24] = t('dirt');
  for (let y = 28; y < 37; y++) map[y][17] = t('dirt');
  for (let x = 12; x < 33; x++) map[18][x] = t('dirt');

  return map;
}

export const WORLD_MAP = generateMap();

export function getTile(x: number, y: number): TileData | null {
  if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return null;
  return WORLD_MAP[y][x];
}

export function isWalkable(x: number, y: number): boolean {
  const tile = getTile(x, y);
  return tile !== null && tile.walkable;
}

// ===== NPCs =====
export function createNpcs(): NpcData[] {
  return [
    // Chickens near town
    {
      id: 'chicken_1', name: 'Chicken', icon: '🐔',
      position: { x: 18, y: 22 }, combatLevel: 1,
      maxHp: 3, hp: 3, attackSpeed: 2400, maxHit: 1, defence: 1,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'raw_shrimp', chance: 0.3, minQty: 1, maxQty: 1 },
      ],
      respawnTime: 10000, aggressive: false,
    },
    {
      id: 'chicken_2', name: 'Chicken', icon: '🐔',
      position: { x: 17, y: 24 }, combatLevel: 1,
      maxHp: 3, hp: 3, attackSpeed: 2400, maxHit: 1, defence: 1,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
      ],
      respawnTime: 10000, aggressive: false,
    },
    // Goblins
    {
      id: 'goblin_1', name: 'Goblin', icon: '👺',
      position: { x: 30, y: 20 }, combatLevel: 5,
      maxHp: 10, hp: 10, attackSpeed: 2400, maxHit: 2, defence: 3,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'bronze_sword', chance: 0.1, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.5, minQty: 3, maxQty: 15 },
      ],
      respawnTime: 15000, aggressive: false,
    },
    {
      id: 'goblin_2', name: 'Goblin', icon: '👺',
      position: { x: 32, y: 22 }, combatLevel: 5,
      maxHp: 10, hp: 10, attackSpeed: 2400, maxHit: 2, defence: 3,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.6, minQty: 5, maxQty: 25 },
      ],
      respawnTime: 15000, aggressive: false,
    },
    {
      id: 'goblin_3', name: 'Goblin', icon: '👺',
      position: { x: 31, y: 24 }, combatLevel: 5,
      maxHp: 10, hp: 10, attackSpeed: 2400, maxHit: 2, defence: 3,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.4, minQty: 2, maxQty: 20 },
        { itemId: 'iron_ore', chance: 0.05, minQty: 1, maxQty: 1 },
      ],
      respawnTime: 15000, aggressive: false,
    },
    // Cows
    {
      id: 'cow_1', name: 'Cow', icon: '🐄',
      position: { x: 15, y: 28 }, combatLevel: 2,
      maxHp: 8, hp: 8, attackSpeed: 2400, maxHit: 1, defence: 1,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.3, minQty: 1, maxQty: 5 },
      ],
      respawnTime: 12000, aggressive: false,
    },
    {
      id: 'cow_2', name: 'Cow', icon: '🐄',
      position: { x: 13, y: 30 }, combatLevel: 2,
      maxHp: 8, hp: 8, attackSpeed: 2400, maxHit: 1, defence: 1,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'bread', chance: 0.2, minQty: 1, maxQty: 1 },
      ],
      respawnTime: 12000, aggressive: false,
    },
    // Guards (medium)
    {
      id: 'guard_1', name: 'Guard', icon: '💂',
      position: { x: 20, y: 20 }, combatLevel: 21,
      maxHp: 22, hp: 22, attackSpeed: 2400, maxHit: 4, defence: 15,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'iron_sword', chance: 0.08, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.7, minQty: 15, maxQty: 60 },
      ],
      respawnTime: 30000, aggressive: false,
    },
    // Dark Wizard (aggressive!)
    {
      id: 'dark_wizard_1', name: 'Dark Wizard', icon: '🧙',
      position: { x: 28, y: 15 }, combatLevel: 12,
      maxHp: 16, hp: 16, attackSpeed: 3000, maxHit: 5, defence: 5,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'mind_rune', chance: 0.5, minQty: 3, maxQty: 10 },
        { itemId: 'chaos_rune', chance: 0.1, minQty: 1, maxQty: 3 },
        { itemId: 'coins', chance: 0.6, minQty: 10, maxQty: 50 },
      ],
      respawnTime: 25000, aggressive: true,
    },
    {
      id: 'dark_wizard_2', name: 'Dark Wizard', icon: '🧙',
      position: { x: 30, y: 14 }, combatLevel: 12,
      maxHp: 16, hp: 16, attackSpeed: 3000, maxHit: 5, defence: 5,
      drops: [
        { itemId: 'bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'air_rune', chance: 0.6, minQty: 5, maxQty: 15 },
        { itemId: 'fire_rune', chance: 0.4, minQty: 3, maxQty: 10 },
      ],
      respawnTime: 25000, aggressive: true,
    },
    // Hill Giant (tough)
    {
      id: 'hill_giant_1', name: 'Hill Giant', icon: '🧌',
      position: { x: 40, y: 30 }, combatLevel: 28,
      maxHp: 35, hp: 35, attackSpeed: 2400, maxHit: 6, defence: 18,
      drops: [
        { itemId: 'big_bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'iron_sword', chance: 0.1, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.8, minQty: 30, maxQty: 120 },
        { itemId: 'lobster', chance: 0.05, minQty: 1, maxQty: 1 },
      ],
      respawnTime: 40000, aggressive: true,
    },
    {
      id: 'hill_giant_2', name: 'Hill Giant', icon: '🧌',
      position: { x: 42, y: 32 }, combatLevel: 28,
      maxHp: 35, hp: 35, attackSpeed: 2400, maxHit: 6, defence: 18,
      drops: [
        { itemId: 'big_bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'steel_sword', chance: 0.03, minQty: 1, maxQty: 1 },
        { itemId: 'coins', chance: 0.7, minQty: 20, maxQty: 100 },
      ],
      respawnTime: 40000, aggressive: true,
    },
    // Wilderness demon
    {
      id: 'demon_1', name: 'Lesser Demon', icon: '👿',
      position: { x: 24, y: 2 }, combatLevel: 82,
      maxHp: 79, hp: 79, attackSpeed: 2400, maxHit: 12, defence: 40,
      drops: [
        { itemId: 'big_bones', chance: 1, minQty: 1, maxQty: 1 },
        { itemId: 'rune_sword', chance: 0.01, minQty: 1, maxQty: 1 },
        { itemId: 'chaos_rune', chance: 0.4, minQty: 5, maxQty: 20 },
        { itemId: 'coins', chance: 0.9, minQty: 100, maxQty: 500 },
        { itemId: 'mithril_sword', chance: 0.05, minQty: 1, maxQty: 1 },
      ],
      respawnTime: 60000, aggressive: true,
    },
  ];
}

export function getDistance(a: WorldPosition, b: WorldPosition): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getAreaLabel(pos: WorldPosition): string {
  if (pos.y < 4) return '☠️ Wilderness';
  if (pos.x >= 20 && pos.x < 28 && pos.y >= 20 && pos.y < 28) return '🏘️ Lumbridge';
  if (pos.x < 18 && pos.y >= 6 && pos.y < 16) return '🌲 Forest';
  if (pos.x >= 33 && pos.x < 42 && pos.y >= 3 && pos.y < 11) return '⛏️ Mining Site';
  if (pos.y >= 36 && pos.y < 46 && pos.x >= 9 && pos.x < 26) return '🎣 Fishing Pier';
  if (pos.x >= 38 && pos.y >= 28) return '🧌 Giant\'s Den';
  return '🌍 Gielinor';
}
