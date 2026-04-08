import { useGame } from '../game/store.ts';
import { getCombatLevel } from '../game/skills.ts';
import { getAreaLabel } from '../game/world.ts';

export function HUD() {
  const { state } = useGame();
  const { player } = state;
  const combatLevel = getCombatLevel(player.skills);
  const area = getAreaLabel(player.position);

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-osrs-darker/80 backdrop-blur-sm border-b border-osrs-border z-10">
        {/* Player info */}
        <div className="flex items-center gap-2">
          {player.picture ? (
            <img src={player.picture} alt="" className="w-6 h-6 rounded-full border border-osrs-gold" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-osrs-panel border border-osrs-gold flex items-center justify-center text-xs">
              ⚔️
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-osrs-gold leading-tight">{player.name}</span>
            <span className="text-[10px] text-osrs-muted leading-tight">
              Combat {combatLevel} | Total {player.totalLevel}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="text-xs text-osrs-muted pixel-font">
          {area}
        </div>

        {/* Sats balance */}
        <div className="flex items-center gap-1 bg-osrs-panel/60 rounded px-2 py-0.5 border border-osrs-border">
          <span className="text-osrs-gold text-sm">₿</span>
          <span className="text-xs font-bold text-osrs-gold">{player.balance.toLocaleString()}</span>
          <span className="text-[10px] text-osrs-muted">sats</span>
        </div>
      </div>

      {/* HP / Prayer orbs - left side */}
      <div className="absolute left-2 top-12 flex flex-col gap-1 z-10">
        {/* HP */}
        <div className="flex items-center gap-1 bg-osrs-darker/80 rounded-lg px-2 py-1 border border-osrs-border backdrop-blur-sm">
          <span className="text-sm">❤️</span>
          <div className="flex flex-col">
            <div className="w-14 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-hp-red rounded-full transition-all duration-300"
                style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-center text-osrs-text">
              {player.hp}/{player.maxHp}
            </span>
          </div>
        </div>

        {/* Prayer */}
        <div className="flex items-center gap-1 bg-osrs-darker/80 rounded-lg px-2 py-1 border border-osrs-border backdrop-blur-sm">
          <span className="text-sm">🙏</span>
          <div className="flex flex-col">
            <div className="w-14 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-prayer-cyan rounded-full transition-all duration-300"
                style={{ width: `${(player.prayer / player.maxPrayer) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-center text-osrs-text">
              {player.prayer}/{player.maxPrayer}
            </span>
          </div>
        </div>
      </div>

      {/* Combat target info */}
      {player.combat.inCombat && player.combat.targetNpcId && (
        <CombatOverlay npcId={player.combat.targetNpcId} />
      )}

      {/* Coordinates */}
      <div className="absolute bottom-1 left-1 text-[10px] text-osrs-muted/50 z-10 pixel-font">
        ({player.position.x}, {player.position.y})
      </div>
    </>
  );
}

function CombatOverlay({ npcId }: { npcId: string }) {
  const { state } = useGame();
  const npc = state.npcs.find(n => n.id === npcId);
  if (!npc) return null;

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-osrs-darker/90 border border-red-900 rounded-lg px-4 py-2 z-20 animate-slide-up backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">{npc.icon}</span>
        <div>
          <div className="text-xs font-bold text-osrs-red">{npc.name}</div>
          <div className="text-[10px] text-osrs-muted">Level {npc.combatLevel}</div>
        </div>
        <div className="flex flex-col items-end ml-4">
          <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-hp-red rounded-full transition-all duration-200"
              style={{ width: `${(npc.hp / npc.maxHp) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-osrs-red">{npc.hp}/{npc.maxHp}</span>
        </div>
      </div>
    </div>
  );
}
