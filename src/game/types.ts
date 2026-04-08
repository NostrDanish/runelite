// ===== SKILLS =====
export type SkillName =
  | 'attack' | 'defence' | 'strength' | 'hitpoints' | 'ranged'
  | 'prayer' | 'magic' | 'cooking' | 'woodcutting' | 'fishing'
  | 'firemaking' | 'crafting' | 'smithing' | 'mining' | 'runecraft';

export interface SkillData {
  level: number;
  xp: number;
}

export type Skills = Record<SkillName, SkillData>;

// ===== ITEMS =====
export interface GameItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'weapon' | 'armor' | 'food' | 'resource' | 'tool' | 'rune' | 'misc';
  slot?: EquipSlot;
  stackable: boolean;
  tradeable: boolean;
  satValue: number; // base price in sats
  stats?: ItemStats;
  healAmount?: number;
}

export interface ItemStats {
  attackBonus?: number;
  strengthBonus?: number;
  defenceBonus?: number;
  rangedBonus?: number;
  magicBonus?: number;
  prayerBonus?: number;
}

export type EquipSlot = 'head' | 'cape' | 'amulet' | 'weapon' | 'torso' | 'shield' | 'legs' | 'hands' | 'boots';

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export type Equipment = Partial<Record<EquipSlot, string>>;

// ===== MAP =====
export interface TileData {
  type: 'grass' | 'dirt' | 'stone' | 'water' | 'sand' | 'tree' | 'rock' | 'bank' | 'ge' | 'altar' | 'furnace' | 'anvil' | 'portal';
  walkable: boolean;
  interactable?: boolean;
  label?: string;
}

export interface WorldPosition {
  x: number;
  y: number;
}

// ===== NPCS =====
export interface NpcData {
  id: string;
  name: string;
  icon: string;
  position: WorldPosition;
  combatLevel: number;
  maxHp: number;
  hp: number;
  attackSpeed: number;
  maxHit: number;
  defence: number;
  drops: { itemId: string; chance: number; minQty: number; maxQty: number }[];
  respawnTime: number;
  aggressive: boolean;
}

// ===== COMBAT =====
export interface CombatState {
  inCombat: boolean;
  targetNpcId: string | null;
  targetPlayerId: string | null;
  combatStyle: 'melee' | 'ranged' | 'magic';
  lastAttackTime: number;
}

// ===== MARKET =====
export interface MarketListing {
  id: string;
  sellerPubkey: string;
  sellerName: string;
  itemId: string;
  quantity: number;
  pricePerItem: number; // in sats
  createdAt: number;
  type: 'buy' | 'sell';
}

// ===== PLAYER =====
export interface PlayerState {
  pubkey: string;
  name: string;
  picture: string;
  position: WorldPosition;
  skills: Skills;
  inventory: InventorySlot[];
  equipment: Equipment;
  combat: CombatState;
  hp: number;
  maxHp: number;
  prayer: number;
  maxPrayer: number;
  balance: number; // sats balance
  totalLevel: number;
  lastSave: number;
}

// ===== MULTIPLAYER =====
export interface RemotePlayer {
  pubkey: string;
  name: string;
  picture: string;
  position: WorldPosition;
  combatLevel: number;
  totalLevel: number;
  equipment: Equipment;
  lastSeen: number;
}

// ===== CHAT =====
export interface ChatMessage {
  id: string;
  pubkey: string;
  name: string;
  content: string;
  timestamp: number;
  type: 'public' | 'trade' | 'system';
}
