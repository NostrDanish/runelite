import { GameItem } from './types.ts';

export const ITEMS: Record<string, GameItem> = {
  // ===== WEAPONS =====
  bronze_sword: {
    id: 'bronze_sword', name: 'Bronze Sword', icon: '🗡️',
    description: 'A basic bronze sword.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 10,
    stats: { attackBonus: 4, strengthBonus: 3 }
  },
  iron_sword: {
    id: 'iron_sword', name: 'Iron Sword', icon: '⚔️',
    description: 'An iron sword.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 50,
    stats: { attackBonus: 8, strengthBonus: 6 }
  },
  steel_sword: {
    id: 'steel_sword', name: 'Steel Sword', icon: '🔪',
    description: 'A steel sword.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 200,
    stats: { attackBonus: 14, strengthBonus: 12 }
  },
  mithril_sword: {
    id: 'mithril_sword', name: 'Mithril Sword', icon: '🔱',
    description: 'A mithril sword.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 800,
    stats: { attackBonus: 20, strengthBonus: 18 }
  },
  rune_sword: {
    id: 'rune_sword', name: 'Rune Sword', icon: '⚡',
    description: 'A powerful rune sword.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 5000,
    stats: { attackBonus: 30, strengthBonus: 28 }
  },
  staff_of_fire: {
    id: 'staff_of_fire', name: 'Staff of Fire', icon: '🔥',
    description: 'A magical fire staff.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 1500,
    stats: { magicBonus: 10 }
  },
  shortbow: {
    id: 'shortbow', name: 'Shortbow', icon: '🏹',
    description: 'A short ranged bow.', type: 'weapon', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 100,
    stats: { rangedBonus: 8 }
  },

  // ===== ARMOR =====
  bronze_helm: {
    id: 'bronze_helm', name: 'Bronze Helm', icon: '🪖',
    description: 'A bronze full helm.', type: 'armor', slot: 'head',
    stackable: false, tradeable: true, satValue: 15,
    stats: { defenceBonus: 4 }
  },
  iron_helm: {
    id: 'iron_helm', name: 'Iron Helm', icon: '⛑️',
    description: 'An iron full helm.', type: 'armor', slot: 'head',
    stackable: false, tradeable: true, satValue: 60,
    stats: { defenceBonus: 8 }
  },
  bronze_platebody: {
    id: 'bronze_platebody', name: 'Bronze Platebody', icon: '🛡️',
    description: 'A bronze platebody.', type: 'armor', slot: 'torso',
    stackable: false, tradeable: true, satValue: 30,
    stats: { defenceBonus: 8 }
  },
  iron_platebody: {
    id: 'iron_platebody', name: 'Iron Platebody', icon: '🦺',
    description: 'An iron platebody.', type: 'armor', slot: 'torso',
    stackable: false, tradeable: true, satValue: 150,
    stats: { defenceBonus: 16 }
  },
  bronze_legs: {
    id: 'bronze_legs', name: 'Bronze Platelegs', icon: '👖',
    description: 'Bronze platelegs.', type: 'armor', slot: 'legs',
    stackable: false, tradeable: true, satValue: 20,
    stats: { defenceBonus: 5 }
  },
  leather_boots: {
    id: 'leather_boots', name: 'Leather Boots', icon: '👢',
    description: 'Basic leather boots.', type: 'armor', slot: 'boots',
    stackable: false, tradeable: true, satValue: 8,
    stats: { defenceBonus: 1 }
  },
  wooden_shield: {
    id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️',
    description: 'A basic wooden shield.', type: 'armor', slot: 'shield',
    stackable: false, tradeable: true, satValue: 12,
    stats: { defenceBonus: 4 }
  },
  amulet_of_power: {
    id: 'amulet_of_power', name: 'Amulet of Power', icon: '📿',
    description: 'An amulet radiating power.', type: 'armor', slot: 'amulet',
    stackable: false, tradeable: true, satValue: 3000,
    stats: { attackBonus: 6, strengthBonus: 6, defenceBonus: 6, magicBonus: 6, rangedBonus: 6, prayerBonus: 1 }
  },

  // ===== FOOD =====
  shrimp: {
    id: 'shrimp', name: 'Shrimp', icon: '🦐',
    description: 'Some cooked shrimp.', type: 'food',
    stackable: false, tradeable: true, satValue: 5,
    healAmount: 3
  },
  trout: {
    id: 'trout', name: 'Trout', icon: '🐟',
    description: 'A nicely cooked trout.', type: 'food',
    stackable: false, tradeable: true, satValue: 20,
    healAmount: 7
  },
  salmon: {
    id: 'salmon', name: 'Salmon', icon: '🐠',
    description: 'A tasty cooked salmon.', type: 'food',
    stackable: false, tradeable: true, satValue: 40,
    healAmount: 9
  },
  lobster: {
    id: 'lobster', name: 'Lobster', icon: '🦞',
    description: 'A delicious cooked lobster.', type: 'food',
    stackable: false, tradeable: true, satValue: 100,
    healAmount: 12
  },
  shark: {
    id: 'shark', name: 'Shark', icon: '🦈',
    description: 'A perfectly cooked shark.', type: 'food',
    stackable: false, tradeable: true, satValue: 300,
    healAmount: 20
  },
  bread: {
    id: 'bread', name: 'Bread', icon: '🍞',
    description: 'A loaf of bread.', type: 'food',
    stackable: false, tradeable: true, satValue: 8,
    healAmount: 5
  },

  // ===== RESOURCES =====
  logs: {
    id: 'logs', name: 'Logs', icon: '🪵',
    description: 'Some logs.', type: 'resource',
    stackable: false, tradeable: true, satValue: 5
  },
  oak_logs: {
    id: 'oak_logs', name: 'Oak Logs', icon: '🌳',
    description: 'Some oak logs.', type: 'resource',
    stackable: false, tradeable: true, satValue: 20
  },
  willow_logs: {
    id: 'willow_logs', name: 'Willow Logs', icon: '🎋',
    description: 'Some willow logs.', type: 'resource',
    stackable: false, tradeable: true, satValue: 50
  },
  raw_shrimp: {
    id: 'raw_shrimp', name: 'Raw Shrimp', icon: '🦐',
    description: 'Some raw shrimp.', type: 'resource',
    stackable: false, tradeable: true, satValue: 2
  },
  raw_trout: {
    id: 'raw_trout', name: 'Raw Trout', icon: '🐟',
    description: 'A raw trout.', type: 'resource',
    stackable: false, tradeable: true, satValue: 10
  },
  raw_salmon: {
    id: 'raw_salmon', name: 'Raw Salmon', icon: '🐠',
    description: 'A raw salmon.', type: 'resource',
    stackable: false, tradeable: true, satValue: 20
  },
  raw_lobster: {
    id: 'raw_lobster', name: 'Raw Lobster', icon: '🦞',
    description: 'A raw lobster.', type: 'resource',
    stackable: false, tradeable: true, satValue: 50
  },
  copper_ore: {
    id: 'copper_ore', name: 'Copper Ore', icon: '🟤',
    description: 'A piece of copper ore.', type: 'resource',
    stackable: false, tradeable: true, satValue: 5
  },
  tin_ore: {
    id: 'tin_ore', name: 'Tin Ore', icon: '⚪',
    description: 'A piece of tin ore.', type: 'resource',
    stackable: false, tradeable: true, satValue: 5
  },
  iron_ore: {
    id: 'iron_ore', name: 'Iron Ore', icon: '🔴',
    description: 'A piece of iron ore.', type: 'resource',
    stackable: false, tradeable: true, satValue: 20
  },
  coal: {
    id: 'coal', name: 'Coal', icon: '⬛',
    description: 'A piece of coal.', type: 'resource',
    stackable: false, tradeable: true, satValue: 30
  },
  bronze_bar: {
    id: 'bronze_bar', name: 'Bronze Bar', icon: '🟫',
    description: 'A bronze bar.', type: 'resource',
    stackable: false, tradeable: true, satValue: 15
  },
  iron_bar: {
    id: 'iron_bar', name: 'Iron Bar', icon: '⬜',
    description: 'An iron bar.', type: 'resource',
    stackable: false, tradeable: true, satValue: 50
  },
  bones: {
    id: 'bones', name: 'Bones', icon: '🦴',
    description: 'Some bones for prayer.', type: 'resource',
    stackable: false, tradeable: true, satValue: 5
  },
  big_bones: {
    id: 'big_bones', name: 'Big Bones', icon: '🦴',
    description: 'Some big bones.', type: 'resource',
    stackable: false, tradeable: true, satValue: 50
  },

  // ===== RUNES =====
  air_rune: {
    id: 'air_rune', name: 'Air Rune', icon: '💨',
    description: 'An air rune.', type: 'rune',
    stackable: true, tradeable: true, satValue: 1
  },
  fire_rune: {
    id: 'fire_rune', name: 'Fire Rune', icon: '🔥',
    description: 'A fire rune.', type: 'rune',
    stackable: true, tradeable: true, satValue: 1
  },
  water_rune: {
    id: 'water_rune', name: 'Water Rune', icon: '💧',
    description: 'A water rune.', type: 'rune',
    stackable: true, tradeable: true, satValue: 1
  },
  earth_rune: {
    id: 'earth_rune', name: 'Earth Rune', icon: '🪨',
    description: 'An earth rune.', type: 'rune',
    stackable: true, tradeable: true, satValue: 1
  },
  mind_rune: {
    id: 'mind_rune', name: 'Mind Rune', icon: '🧠',
    description: 'A mind rune.', type: 'rune',
    stackable: true, tradeable: true, satValue: 2
  },
  chaos_rune: {
    id: 'chaos_rune', name: 'Chaos Rune', icon: '🌀',
    description: 'A chaos rune.', type: 'rune',
    stackable: true, tradeable: true, satValue: 20
  },

  // ===== TOOLS =====
  bronze_axe: {
    id: 'bronze_axe', name: 'Bronze Axe', icon: '🪓',
    description: 'A bronze hatchet.', type: 'tool', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 10,
    stats: { attackBonus: 2, strengthBonus: 2 }
  },
  bronze_pickaxe: {
    id: 'bronze_pickaxe', name: 'Bronze Pickaxe', icon: '⛏️',
    description: 'A bronze pickaxe.', type: 'tool', slot: 'weapon',
    stackable: false, tradeable: true, satValue: 10,
    stats: { attackBonus: 2, strengthBonus: 2 }
  },
  fishing_rod: {
    id: 'fishing_rod', name: 'Fishing Rod', icon: '🎣',
    description: 'A fishing rod.', type: 'tool',
    stackable: false, tradeable: true, satValue: 5
  },
  tinderbox: {
    id: 'tinderbox', name: 'Tinderbox', icon: '🔥',
    description: 'Used to light fires.', type: 'tool',
    stackable: false, tradeable: true, satValue: 2
  },

  // ===== MISC =====
  coins: {
    id: 'coins', name: 'Satoshis', icon: '₿',
    description: 'Stack of satoshis.', type: 'misc',
    stackable: true, tradeable: false, satValue: 1
  },
};

export function getItem(id: string): GameItem | undefined {
  return ITEMS[id];
}

export function getAllItems(): GameItem[] {
  return Object.values(ITEMS);
}

export function getTradeableItems(): GameItem[] {
  return Object.values(ITEMS).filter(i => i.tradeable);
}
