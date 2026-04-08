import type { GameState, GameAction } from './store.ts';
import { getItem } from './items.ts';
import { getDistance } from './world.ts';
import { levelForXp } from './skills.ts';
import type { SkillName } from './types.ts';

// Skilling config
const SKILLING_TIME: Record<string, number> = {
  woodcutting: 4000,
  mining: 5000,
  fishing: 4500,
  smithing: 5000,
  cooking: 3000,
  firemaking: 3000,
};

const SKILLING_ITEMS: Record<string, { itemId: string; xp: number; levelReq: number }[]> = {
  woodcutting: [
    { itemId: 'logs', xp: 25, levelReq: 1 },
    { itemId: 'oak_logs', xp: 37, levelReq: 15 },
    { itemId: 'willow_logs', xp: 67, levelReq: 30 },
  ],
  mining: [
    { itemId: 'copper_ore', xp: 17, levelReq: 1 },
    { itemId: 'tin_ore', xp: 17, levelReq: 1 },
    { itemId: 'iron_ore', xp: 35, levelReq: 15 },
    { itemId: 'coal', xp: 50, levelReq: 30 },
  ],
  fishing: [
    { itemId: 'raw_shrimp', xp: 10, levelReq: 1 },
    { itemId: 'raw_trout', xp: 50, levelReq: 20 },
    { itemId: 'raw_salmon', xp: 70, levelReq: 30 },
    { itemId: 'raw_lobster', xp: 90, levelReq: 40 },
  ],
  smithing: [
    { itemId: 'bronze_bar', xp: 12, levelReq: 1 },
    { itemId: 'iron_bar', xp: 25, levelReq: 15 },
  ],
};

export function createGameLoop(
  getState: () => GameState,
  dispatch: React.Dispatch<GameAction>,
) {
  let lastCombatTick = 0;
  let lastSkillingTick = 0;
  let skillingStartTime = 0;
  let respawnTimers: Map<string, number> = new Map();

  const loop = () => {
    const state = getState();
    const now = Date.now();

    // === COMBAT ===
    if (state.player.combat.inCombat && state.player.combat.targetNpcId) {
      const npc = state.npcs.find(n => n.id === state.player.combat.targetNpcId);

      if (!npc || npc.hp <= 0) {
        if (npc && npc.hp <= 0) {
          dispatch({ type: 'NPC_DIED', npcId: npc.id });

          // Schedule respawn
          const respawnId = setTimeout(() => {
            dispatch({ type: 'NPC_RESPAWN', npcId: npc.id });
          }, npc.respawnTime) as unknown as number;
          respawnTimers.set(npc.id, respawnId);
        }
        dispatch({ type: 'END_COMBAT' });
      } else if (getDistance(state.player.position, npc.position) > 1) {
        dispatch({ type: 'END_COMBAT' });
        dispatch({ type: 'LOG', message: 'Target out of range!' });
      } else if (now - lastCombatTick >= 2400) {
        lastCombatTick = now;

        // Player attacks NPC
        const attackLevel = state.player.skills.attack.level;
        const strengthLevel = state.player.skills.strength.level;

        // Equipment bonuses
        let atkBonus = 0;
        let strBonus = 0;
        for (const itemId of Object.values(state.player.equipment)) {
          if (!itemId) continue;
          const item = getItem(itemId);
          if (item?.stats) {
            atkBonus += item.stats.attackBonus || 0;
            strBonus += item.stats.strengthBonus || 0;
          }
        }

        // Hit calculation
        const effectiveAtk = attackLevel + atkBonus;
        const maxHit = Math.max(1, Math.floor((strengthLevel + strBonus) / 5) + 1);
        const hitChance = Math.min(0.95, (effectiveAtk / (effectiveAtk + npc.defence)) + 0.1);

        if (Math.random() < hitChance) {
          const damage = Math.floor(Math.random() * maxHit) + 1;
          dispatch({ type: 'NPC_DAMAGE', npcId: npc.id, damage });
        }

        // NPC attacks player
        const npcHitChance = Math.min(0.8, npc.combatLevel / (npc.combatLevel + state.player.skills.defence.level + 5));
        if (Math.random() < npcHitChance) {
          const npcDamage = Math.floor(Math.random() * npc.maxHit) + 1;
          dispatch({ type: 'TAKE_DAMAGE', amount: npcDamage });
        }
      }
    }

    // === AGGRESSIVE NPCs ===
    if (!state.player.combat.inCombat) {
      for (const npc of state.npcs) {
        if (npc.hp <= 0 || !npc.aggressive) continue;
        if (getDistance(state.player.position, npc.position) <= 1) {
          dispatch({ type: 'START_COMBAT', npcId: npc.id });
          break;
        }
      }
    }

    // === SKILLING ===
    if (state.skilling) {
      const skill = state.skilling.skill as SkillName;
      const skillTime = SKILLING_TIME[skill] || 4000;

      if (skillingStartTime === 0) {
        skillingStartTime = now;
      }

      const elapsed = now - skillingStartTime;
      const progress = Math.min(1, elapsed / skillTime);
      dispatch({ type: 'UPDATE_SKILLING', progress });

      if (progress >= 1) {
        // Complete skilling action
        const items = SKILLING_ITEMS[skill];
        if (items) {
          const playerLevel = state.player.skills[skill]?.level || 1;
          const available = items.filter(i => playerLevel >= i.levelReq);
          if (available.length > 0) {
            const chosen = available[Math.floor(Math.random() * available.length)];
            dispatch({ type: 'ADD_ITEM', itemId: chosen.itemId, quantity: 1 });
            dispatch({ type: 'GAIN_XP', skill, amount: chosen.xp });
            const item = getItem(chosen.itemId);
            dispatch({ type: 'LOG', message: `Obtained: ${item?.name || chosen.itemId}` });
          }
        }
        skillingStartTime = now; // restart cycle
      }
    } else {
      skillingStartTime = 0;
    }
  };

  const intervalId = setInterval(loop, 200);

  return () => {
    clearInterval(intervalId);
    respawnTimers.forEach(id => clearTimeout(id));
  };
}
