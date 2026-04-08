import { useGame } from '../../game/store.ts';
import { SKILL_LIST, xpToNextLevel, getCombatLevel } from '../../game/skills.ts';

const SKILL_COLORS: Record<string, string> = {
  attack: '#cc0000', strength: '#00cc00', defence: '#3366ff', hitpoints: '#cc0000',
  ranged: '#339933', prayer: '#00cccc', magic: '#9933cc', cooking: '#993300',
  woodcutting: '#996633', fishing: '#336699', firemaking: '#cc6600',
  crafting: '#993399', smithing: '#666666', mining: '#999966', runecraft: '#ccaa00',
};

export function StatsPanel() {
  const { state } = useGame();
  const { skills } = state.player;
  const combatLevel = getCombatLevel(skills);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-2 py-1.5" style={{ borderBottom: '1px solid var(--osrs-border-dark)' }}>
        <div className="osrs-font" style={{ color: '#ff981f', fontSize: 10, textAlign: 'center' }}>
          Combat Lvl: {combatLevel} &bull; Total: {state.player.totalLevel}
        </div>
      </div>

      {/* Skills grid */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {SKILL_LIST.map(skill => {
            const data = skills[skill.name];
            const { progress } = xpToNextLevel(data.xp);
            const col = SKILL_COLORS[skill.name] || '#999';

            return (
              <div
                key={skill.name}
                className="osrs-inv-slot"
                style={{ padding: 3, cursor: 'default' }}
                title={`${skill.label}: ${data.xp.toLocaleString()} XP`}
              >
                {/* Skill icon + name */}
                <div className="flex items-center gap-1 mb-0.5">
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: col, border: '1px solid rgba(0,0,0,0.4)',
                    flexShrink: 0,
                  }} />
                  <span className="osrs-font" style={{ fontSize: 7, color: '#9f8a6f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {skill.label}
                  </span>
                </div>

                {/* Level */}
                <div className="osrs-font text-center" style={{ fontSize: 12, color: '#ffff00', lineHeight: 1.2 }}>
                  {data.level}
                </div>

                {/* XP bar */}
                <div style={{ height: 3, background: '#1b1610', marginTop: 2, border: '1px solid #0a0a0a' }}>
                  <div style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    background: col,
                    transition: 'width 0.5s',
                  }} />
                </div>

                {/* XP text */}
                <div className="text-center" style={{ fontSize: 7, color: '#6b5c4a', marginTop: 1 }}>
                  {data.xp >= 1000 ? `${(data.xp / 1000).toFixed(1)}k` : data.xp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
