import { createContext, useContext } from 'react';
import type { PlayerState, InventorySlot, SkillName, NpcData, RemotePlayer, ChatMessage, MarketListing, Equipment, CombatState } from './types.ts';
import { createDefaultSkills, levelForXp, getTotalLevel, getCombatLevel, xpForLevel } from './skills.ts';
import { ITEMS, getItem } from './items.ts';
import { isWalkable, getDistance, createNpcs } from './world.ts';

const MAX_INVENTORY = 28;

export interface GameState {
  player: PlayerState;
  npcs: NpcData[];
  remotePlayers: Map<string, RemotePlayer>;
  chatMessages: ChatMessage[];
  marketListings: MarketListing[];
  gameLog: string[];
  isLoggedIn: boolean;
  activePanel: 'stats' | 'inventory' | 'equipment' | 'market' | 'chat' | 'map' | 'settings';
  isMobile: boolean;
  showMobilePanel: boolean;
  skilling: { skill: SkillName; progress: number; target: string } | null;
}

export type GameAction =
  | { type: 'LOGIN'; pubkey: string; name: string; picture: string }
  | { type: 'LOAD_SAVE'; data: Partial<PlayerState> }
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'TELEPORT'; x: number; y: number }
  | { type: 'GAIN_XP'; skill: SkillName; amount: number }
  | { type: 'ADD_ITEM'; itemId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; itemId: string; quantity: number }
  | { type: 'EQUIP_ITEM'; slotIndex: number }
  | { type: 'UNEQUIP_ITEM'; slot: keyof Equipment }
  | { type: 'EAT_FOOD'; slotIndex: number }
  | { type: 'TAKE_DAMAGE'; amount: number }
  | { type: 'HEAL'; amount: number }
  | { type: 'START_COMBAT'; npcId: string }
  | { type: 'NPC_DAMAGE'; npcId: string; damage: number }
  | { type: 'NPC_DIED'; npcId: string }
  | { type: 'NPC_RESPAWN'; npcId: string }
  | { type: 'END_COMBAT' }
  | { type: 'ADD_BALANCE'; amount: number }
  | { type: 'REMOVE_BALANCE'; amount: number }
  | { type: 'ADD_CHAT'; message: ChatMessage }
  | { type: 'ADD_REMOTE_PLAYER'; player: RemotePlayer }
  | { type: 'ADD_MARKET_LISTING'; listing: MarketListing }
  | { type: 'SET_MARKET_LISTINGS'; listings: MarketListing[] }
  | { type: 'SET_PANEL'; panel: GameState['activePanel'] }
  | { type: 'TOGGLE_MOBILE_PANEL' }
  | { type: 'LOG'; message: string }
  | { type: 'START_SKILLING'; skill: SkillName; target: string }
  | { type: 'UPDATE_SKILLING'; progress: number }
  | { type: 'STOP_SKILLING' }
  | { type: 'BURY_BONES'; slotIndex: number }
  | { type: 'SET_MOBILE'; isMobile: boolean };

export function createInitialState(): GameState {
  return {
    player: {
      pubkey: '',
      name: 'Adventurer',
      picture: '',
      position: { x: 23, y: 23 },
      skills: createDefaultSkills(),
      inventory: [
        { itemId: 'bronze_sword', quantity: 1 },
        { itemId: 'bronze_axe', quantity: 1 },
        { itemId: 'bronze_pickaxe', quantity: 1 },
        { itemId: 'fishing_rod', quantity: 1 },
        { itemId: 'tinderbox', quantity: 1 },
        { itemId: 'bread', quantity: 5 },
        { itemId: 'coins', quantity: 100 },
      ],
      equipment: {},
      combat: { inCombat: false, targetNpcId: null, targetPlayerId: null, combatStyle: 'melee', lastAttackTime: 0 },
      hp: 10,
      maxHp: 10,
      prayer: 1,
      maxPrayer: 1,
      balance: 100,
      totalLevel: 15,
      lastSave: 0,
    },
    npcs: createNpcs(),
    remotePlayers: new Map(),
    chatMessages: [],
    marketListings: [],
    gameLog: ['Welcome to RuneLite Web! ⚔️', 'Login with Nostr to save your progress.'],
    isLoggedIn: false,
    activePanel: 'inventory',
    isMobile: window.innerWidth < 768,
    showMobilePanel: false,
    skilling: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOGIN': {
      return {
        ...state,
        isLoggedIn: true,
        player: {
          ...state.player,
          pubkey: action.pubkey,
          name: action.name,
          picture: action.picture,
        },
        gameLog: [...state.gameLog, `Welcome, ${action.name}!`],
      };
    }

    case 'LOAD_SAVE': {
      const d = action.data;
      const skills = d.skills || state.player.skills;
      return {
        ...state,
        player: {
          ...state.player,
          skills,
          inventory: d.inventory || state.player.inventory,
          equipment: d.equipment || state.player.equipment,
          position: d.position || state.player.position,
          hp: d.hp || state.player.hp,
          maxHp: d.maxHp || state.player.maxHp,
          prayer: d.prayer || state.player.prayer,
          maxPrayer: d.maxPrayer || state.player.maxPrayer,
          balance: d.balance ?? state.player.balance,
          totalLevel: getTotalLevel(skills),
        },
        gameLog: [...state.gameLog, '📂 Save data loaded from Nostr!'],
      };
    }

    case 'MOVE': {
      if (state.player.combat.inCombat) return state;
      if (state.skilling) return state;
      const nx = state.player.position.x + action.dx;
      const ny = state.player.position.y + action.dy;
      if (!isWalkable(nx, ny)) return state;
      return {
        ...state,
        player: {
          ...state.player,
          position: { x: nx, y: ny },
        },
      };
    }

    case 'TELEPORT': {
      if (isWalkable(action.x, action.y)) {
        return {
          ...state,
          player: { ...state.player, position: { x: action.x, y: action.y } },
          gameLog: [...state.gameLog, '🌀 Teleported!'],
        };
      }
      return state;
    }

    case 'GAIN_XP': {
      const skills = { ...state.player.skills };
      const skill = { ...skills[action.skill] };
      skill.xp += action.amount;
      const newLevel = levelForXp(skill.xp);
      const leveled = newLevel > skill.level;
      skill.level = newLevel;
      skills[action.skill] = skill;

      const maxHp = skills.hitpoints.level;
      const maxPrayer = skills.prayer.level;
      const newLog = [...state.gameLog];
      if (leveled) {
        newLog.push(`🎉 ${action.skill.charAt(0).toUpperCase() + action.skill.slice(1)} leveled up to ${newLevel}!`);
      }

      return {
        ...state,
        player: {
          ...state.player,
          skills,
          maxHp,
          maxPrayer,
          totalLevel: getTotalLevel(skills),
        },
        gameLog: newLog,
      };
    }

    case 'ADD_ITEM': {
      const inv = [...state.player.inventory];
      const item = getItem(action.itemId);
      if (!item) return state;

      if (item.stackable) {
        const idx = inv.findIndex(s => s.itemId === action.itemId);
        if (idx >= 0) {
          inv[idx] = { ...inv[idx], quantity: inv[idx].quantity + action.quantity };
        } else if (inv.length < MAX_INVENTORY) {
          inv.push({ itemId: action.itemId, quantity: action.quantity });
        } else {
          return { ...state, gameLog: [...state.gameLog, '❌ Inventory full!'] };
        }
      } else {
        for (let i = 0; i < action.quantity; i++) {
          if (inv.length < MAX_INVENTORY) {
            inv.push({ itemId: action.itemId, quantity: 1 });
          } else {
            return {
              ...state,
              player: { ...state.player, inventory: inv },
              gameLog: [...state.gameLog, '❌ Inventory full!'],
            };
          }
        }
      }

      return {
        ...state,
        player: { ...state.player, inventory: inv },
      };
    }

    case 'REMOVE_ITEM': {
      const inv = [...state.player.inventory];
      const item = getItem(action.itemId);
      if (!item) return state;

      let remaining = action.quantity;
      for (let i = inv.length - 1; i >= 0 && remaining > 0; i--) {
        if (inv[i].itemId === action.itemId) {
          if (inv[i].quantity <= remaining) {
            remaining -= inv[i].quantity;
            inv.splice(i, 1);
          } else {
            inv[i] = { ...inv[i], quantity: inv[i].quantity - remaining };
            remaining = 0;
          }
        }
      }

      return {
        ...state,
        player: { ...state.player, inventory: inv },
      };
    }

    case 'EQUIP_ITEM': {
      const inv = [...state.player.inventory];
      const slot = inv[action.slotIndex];
      if (!slot) return state;
      const item = getItem(slot.itemId);
      if (!item || !item.slot) return state;

      const equipment = { ...state.player.equipment };
      const currentEquipped = equipment[item.slot];

      // Remove from inventory
      inv.splice(action.slotIndex, 1);

      // If something already equipped in that slot, put it back in inventory
      if (currentEquipped) {
        if (inv.length < MAX_INVENTORY) {
          inv.push({ itemId: currentEquipped, quantity: 1 });
        } else {
          return { ...state, gameLog: [...state.gameLog, '❌ Inventory full!'] };
        }
      }

      equipment[item.slot] = slot.itemId;

      return {
        ...state,
        player: { ...state.player, inventory: inv, equipment },
        gameLog: [...state.gameLog, `Equipped ${item.name}`],
      };
    }

    case 'UNEQUIP_ITEM': {
      const equipment = { ...state.player.equipment };
      const itemId = equipment[action.slot];
      if (!itemId) return state;
      const inv = [...state.player.inventory];
      if (inv.length >= MAX_INVENTORY) {
        return { ...state, gameLog: [...state.gameLog, '❌ Inventory full!'] };
      }
      inv.push({ itemId, quantity: 1 });
      delete equipment[action.slot];
      return {
        ...state,
        player: { ...state.player, inventory: inv, equipment },
      };
    }

    case 'EAT_FOOD': {
      const inv = [...state.player.inventory];
      const slot = inv[action.slotIndex];
      if (!slot) return state;
      const item = getItem(slot.itemId);
      if (!item || item.type !== 'food' || !item.healAmount) return state;

      const newHp = Math.min(state.player.hp + item.healAmount, state.player.maxHp);
      if (state.player.hp >= state.player.maxHp) {
        return { ...state, gameLog: [...state.gameLog, 'HP already full!'] };
      }

      // Remove 1 food
      if (slot.quantity > 1) {
        inv[action.slotIndex] = { ...slot, quantity: slot.quantity - 1 };
      } else {
        inv.splice(action.slotIndex, 1);
      }

      return {
        ...state,
        player: { ...state.player, hp: newHp, inventory: inv },
        gameLog: [...state.gameLog, `Ate ${item.name} (+${item.healAmount} HP)`],
      };
    }

    case 'BURY_BONES': {
      const inv = [...state.player.inventory];
      const slot = inv[action.slotIndex];
      if (!slot) return state;
      const isBigBones = slot.itemId === 'big_bones';
      const isBones = slot.itemId === 'bones' || isBigBones;
      if (!isBones) return state;

      if (slot.quantity > 1) {
        inv[action.slotIndex] = { ...slot, quantity: slot.quantity - 1 };
      } else {
        inv.splice(action.slotIndex, 1);
      }

      const xpGain = isBigBones ? 15 : 5;
      const skills = { ...state.player.skills };
      const prayer = { ...skills.prayer };
      prayer.xp += xpGain;
      const newLevel = levelForXp(prayer.xp);
      const leveled = newLevel > prayer.level;
      prayer.level = newLevel;
      skills.prayer = prayer;

      const newLog = [...state.gameLog, `🙏 Buried ${isBigBones ? 'big bones' : 'bones'} (+${xpGain} Prayer XP)`];
      if (leveled) newLog.push(`🎉 Prayer leveled up to ${newLevel}!`);

      return {
        ...state,
        player: {
          ...state.player,
          inventory: inv,
          skills,
          maxPrayer: prayer.level,
          totalLevel: getTotalLevel(skills),
        },
        gameLog: newLog,
      };
    }

    case 'TAKE_DAMAGE': {
      const newHp = Math.max(0, state.player.hp - action.amount);
      if (newHp <= 0) {
        // Death - respawn at Lumbridge, lose some items
        return {
          ...state,
          player: {
            ...state.player,
            hp: state.player.maxHp,
            position: { x: 23, y: 23 },
            combat: { inCombat: false, targetNpcId: null, targetPlayerId: null, combatStyle: 'melee', lastAttackTime: 0 },
          },
          skilling: null,
          gameLog: [...state.gameLog, '💀 You have died! Respawning at Lumbridge...'],
        };
      }
      return {
        ...state,
        player: { ...state.player, hp: newHp },
      };
    }

    case 'HEAL': {
      return {
        ...state,
        player: { ...state.player, hp: Math.min(state.player.hp + action.amount, state.player.maxHp) },
      };
    }

    case 'START_COMBAT': {
      const npc = state.npcs.find(n => n.id === action.npcId);
      if (!npc || npc.hp <= 0) return state;
      return {
        ...state,
        player: {
          ...state.player,
          combat: { ...state.player.combat, inCombat: true, targetNpcId: action.npcId, lastAttackTime: Date.now() },
        },
        skilling: null,
        gameLog: [...state.gameLog, `⚔️ Attacking ${npc.name}!`],
      };
    }

    case 'NPC_DAMAGE': {
      const npcs = state.npcs.map(n => {
        if (n.id === action.npcId) {
          return { ...n, hp: Math.max(0, n.hp - action.damage) };
        }
        return n;
      });
      return { ...state, npcs };
    }

    case 'NPC_DIED': {
      const npc = state.npcs.find(n => n.id === action.npcId);
      if (!npc) return state;

      // Calculate drops
      const newLog = [...state.gameLog, `🎯 Defeated ${npc.name}!`];
      let newState = { ...state, gameLog: newLog };

      // Process drops
      for (const drop of npc.drops) {
        if (Math.random() <= drop.chance) {
          const qty = drop.minQty + Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1));
          if (drop.itemId === 'coins') {
            newState = gameReducer(newState, { type: 'ADD_BALANCE', amount: qty });
          } else {
            newState = gameReducer(newState, { type: 'ADD_ITEM', itemId: drop.itemId, quantity: qty });
          }
          const item = getItem(drop.itemId);
          newState.gameLog = [...newState.gameLog, `💎 Received: ${item?.name || drop.itemId} x${qty}`];
        }
      }

      // XP rewards
      const xpReward = Math.floor(npc.maxHp * 1.33);
      newState = gameReducer(newState, { type: 'GAIN_XP', skill: 'hitpoints', amount: Math.floor(xpReward / 3) });
      newState = gameReducer(newState, { type: 'GAIN_XP', skill: 'attack', amount: Math.floor(xpReward / 3) });
      newState = gameReducer(newState, { type: 'GAIN_XP', skill: 'strength', amount: Math.floor(xpReward / 3) });

      return {
        ...newState,
        player: {
          ...newState.player,
          combat: { ...newState.player.combat, inCombat: false, targetNpcId: null },
        },
      };
    }

    case 'NPC_RESPAWN': {
      const npcs = state.npcs.map(n => {
        if (n.id === action.npcId) {
          return { ...n, hp: n.maxHp };
        }
        return n;
      });
      return { ...state, npcs };
    }

    case 'END_COMBAT': {
      return {
        ...state,
        player: {
          ...state.player,
          combat: { inCombat: false, targetNpcId: null, targetPlayerId: null, combatStyle: 'melee', lastAttackTime: 0 },
        },
      };
    }

    case 'ADD_BALANCE': {
      const inv = [...state.player.inventory];
      const coinIdx = inv.findIndex(s => s.itemId === 'coins');
      if (coinIdx >= 0) {
        inv[coinIdx] = { ...inv[coinIdx], quantity: inv[coinIdx].quantity + action.amount };
      } else if (inv.length < MAX_INVENTORY) {
        inv.push({ itemId: 'coins', quantity: action.amount });
      }
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance + action.amount,
          inventory: inv,
        },
      };
    }

    case 'REMOVE_BALANCE': {
      if (state.player.balance < action.amount) return state;
      const inv = [...state.player.inventory];
      const coinIdx = inv.findIndex(s => s.itemId === 'coins');
      if (coinIdx >= 0) {
        const newQty = inv[coinIdx].quantity - action.amount;
        if (newQty <= 0) {
          inv.splice(coinIdx, 1);
        } else {
          inv[coinIdx] = { ...inv[coinIdx], quantity: newQty };
        }
      }
      return {
        ...state,
        player: {
          ...state.player,
          balance: state.player.balance - action.amount,
          inventory: inv,
        },
      };
    }

    case 'ADD_CHAT': {
      const msgs = [...state.chatMessages, action.message].slice(-100);
      return { ...state, chatMessages: msgs };
    }

    case 'ADD_REMOTE_PLAYER': {
      const remotePlayers = new Map(state.remotePlayers);
      remotePlayers.set(action.player.pubkey, action.player);
      return { ...state, remotePlayers };
    }

    case 'ADD_MARKET_LISTING': {
      return {
        ...state,
        marketListings: [...state.marketListings, action.listing].slice(-200),
      };
    }

    case 'SET_MARKET_LISTINGS': {
      return { ...state, marketListings: action.listings };
    }

    case 'SET_PANEL': {
      return { ...state, activePanel: action.panel, showMobilePanel: true };
    }

    case 'TOGGLE_MOBILE_PANEL': {
      return { ...state, showMobilePanel: !state.showMobilePanel };
    }

    case 'LOG': {
      return { ...state, gameLog: [...state.gameLog, action.message].slice(-200) };
    }

    case 'START_SKILLING': {
      return { ...state, skilling: { skill: action.skill, progress: 0, target: action.target } };
    }

    case 'UPDATE_SKILLING': {
      if (!state.skilling) return state;
      return { ...state, skilling: { ...state.skilling, progress: action.progress } };
    }

    case 'STOP_SKILLING': {
      return { ...state, skilling: null };
    }

    case 'SET_MOBILE': {
      return { ...state, isMobile: action.isMobile };
    }

    default:
      return state;
  }
}

// Context
export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: createInitialState(),
  dispatch: () => {},
});

export function useGame() {
  return useContext(GameContext);
}
