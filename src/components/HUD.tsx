import { useGame } from '../game/store.ts';
import { getCombatLevel } from '../game/skills.ts';
import { getAreaLabel } from '../game/world.ts';

export function HUD() {
  const { state } = useGame();
  const { player } = state;
  const combatLevel = getCombatLevel(player.skills);
  const area = getAreaLabel(player.position);

  const hpPct = player.hp / player.maxHp;
  const prayPct = player.prayer / player.maxPrayer;

  return (
    <>
      {/* Minimap area - top right */}
      <div className="absolute top-2 right-2 z-10" style={{ width: state.isMobile ? 100 : 140 }}>
        <div className="osrs-panel p-1">
          <div className="text-center osrs-font" style={{ fontSize: 8, color: '#ff981f' }}>
            {area}
          </div>
          <div className="text-center" style={{ fontSize: 8, color: '#9f8a6f' }}>
            ({player.position.x}, {player.position.y})
          </div>
        </div>
      </div>

      {/* Orbs - left side */}
      <div className="absolute left-2 z-10 flex flex-col gap-1" style={{ top: state.isMobile ? 8 : 12 }}>
        {/* HP Orb */}
        <Orb
          value={player.hp}
          max={player.maxHp}
          color={hpPct > 0.5 ? '#00cc00' : hpPct > 0.25 ? '#cccc00' : '#cc0000'}
          bgColor="#300"
          label="HP"
          icon="+"
          iconColor="#cc0000"
        />
        {/* Prayer Orb */}
        <Orb
          value={player.prayer}
          max={player.maxPrayer}
          color="#00cccc"
          bgColor="#003333"
          label="Pray"
          icon="✦"
          iconColor="#00cccc"
        />
        {/* Sats */}
        <div className="osrs-panel flex items-center gap-1 px-2 py-1" style={{ minWidth: 70 }}>
          <span style={{ color: '#ffaa00', fontSize: 12, fontWeight: 'bold' }}>₿</span>
          <div>
            <div className="osrs-font" style={{ color: '#ffff00', fontSize: 9 }}>
              {player.balance.toLocaleString()}
            </div>
            <div style={{ fontSize: 7, color: '#9f8a6f' }}>sats</div>
          </div>
        </div>
      </div>

      {/* Combat target overlay */}
      {player.combat.inCombat && player.combat.targetNpcId && (
        <CombatOverlay npcId={player.combat.targetNpcId} />
      )}
    </>
  );
}

function Orb({ value, max, color, bgColor, label, icon, iconColor }: {
  value: number; max: number; color: string; bgColor: string; label: string; icon: string; iconColor: string;
}) {
  const pct = max > 0 ? value / max : 0;
  const size = 38;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="osrs-panel flex items-center gap-1 px-1 py-1" style={{ minWidth: 70 }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill={bgColor} stroke="#1b1610" strokeWidth="2" />
          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: iconColor, fontSize: 14, fontWeight: 'bold' }}>
          {icon}
        </div>
      </div>
      <div>
        <div className="osrs-font" style={{ color, fontSize: 9 }}>{value}/{max}</div>
        <div style={{ fontSize: 7, color: '#9f8a6f' }}>{label}</div>
      </div>
    </div>
  );
}

function CombatOverlay({ npcId }: { npcId: string }) {
  const { state } = useGame();
  const npc = state.npcs.find(n => n.id === npcId);
  if (!npc) return null;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 osrs-panel px-4 py-2 anim-slideUp"
      style={{ borderColor: '#cc0000', boxShadow: 'inset 0 0 8px rgba(200,0,0,0.3)' }}>
      <div className="flex items-center gap-3">
        <div>
          <div className="osrs-font" style={{ color: '#ff4444', fontSize: 10 }}>{npc.name}</div>
          <div style={{ color: '#9f8a6f', fontSize: 9 }}>Level {npc.combatLevel}</div>
        </div>
        <div className="flex flex-col items-end">
          <div style={{ width: 80, height: 8, background: '#300', border: '1px solid #1b1610' }}>
            <div style={{
              width: `${(npc.hp / npc.maxHp) * 100}%`,
              height: '100%',
              background: npc.hp / npc.maxHp > 0.5 ? '#00cc00' : npc.hp / npc.maxHp > 0.25 ? '#cccc00' : '#cc0000',
              transition: 'width 0.2s',
            }} />
          </div>
          <span className="osrs-font" style={{ color: '#ff4444', fontSize: 8 }}>{npc.hp}/{npc.maxHp}</span>
        </div>
      </div>
    </div>
  );
}
