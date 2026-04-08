import { useGame } from '../../game/store.ts';
import { SKILL_LIST, xpToNextLevel, getCombatLevel } from '../../game/skills.ts';

export function StatsPanel() {
  const { state } = useGame();
  const { skills } = state.player;
  const combatLevel = getCombatLevel(skills);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-osrs-border">
        <h2 className="text-sm font-bold text-osrs-gold">⚔️ Skills</h2>
        <div className="text-[10px] text-osrs-muted">
          Combat Lvl: {combatLevel} | Total: {state.player.totalLevel}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1">
          {SKILL_LIST.map(skill => {
            const data = skills[skill.name];
            const { progress } = xpToNextLevel(data.xp);
            return (
              <div
                key={skill.name}
                className="bg-osrs-darker rounded border border-osrs-border p-1.5 hover:border-osrs-gold/50 transition-colors cursor-default"
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs">{skill.icon}</span>
                  <span className="text-[10px] text-osrs-muted truncate">{skill.label}</span>
                </div>
                <div className="text-sm font-bold text-osrs-text text-center">{data.level}</div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: skill.color,
                    }}
                  />
                </div>
                <div className="text-[8px] text-osrs-muted text-center mt-0.5">
                  {data.xp.toLocaleString()} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
