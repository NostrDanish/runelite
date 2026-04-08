import { useGame } from '../../game/store.ts';
import { getItem } from '../../game/items.ts';
import type { EquipSlot, ItemStats } from '../../game/types.ts';

const EQUIP_LAYOUT: { slot: EquipSlot; label: string; row: number; col: number }[] = [
  { slot: 'head', label: 'Head', row: 0, col: 1 },
  { slot: 'cape', label: 'Cape', row: 1, col: 0 },
  { slot: 'amulet', label: 'Amulet', row: 1, col: 1 },
  { slot: 'weapon', label: 'Weapon', row: 2, col: 0 },
  { slot: 'torso', label: 'Body', row: 2, col: 1 },
  { slot: 'shield', label: 'Shield', row: 2, col: 2 },
  { slot: 'legs', label: 'Legs', row: 3, col: 1 },
  { slot: 'hands', label: 'Hands', row: 4, col: 0 },
  { slot: 'boots', label: 'Boots', row: 4, col: 2 },
];

export function EquipmentPanel() {
  const { state, dispatch } = useGame();
  const { equipment } = state.player;

  const totalStats: ItemStats = {
    attackBonus: 0,
    strengthBonus: 0,
    defenceBonus: 0,
    rangedBonus: 0,
    magicBonus: 0,
    prayerBonus: 0,
  };

  for (const itemId of Object.values(equipment)) {
    if (!itemId) continue;
    const item = getItem(itemId);
    if (!item?.stats) continue;
    for (const key of Object.keys(totalStats) as (keyof ItemStats)[]) {
      totalStats[key] = (totalStats[key] || 0) + (item.stats[key] || 0);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-osrs-border">
        <h2 className="text-sm font-bold text-osrs-gold">🛡️ Equipment</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {/* Equipment grid */}
        <div className="grid grid-cols-3 gap-1 mb-4">
          {Array.from({ length: 15 }, (_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const equipSlot = EQUIP_LAYOUT.find(e => e.row === row && e.col === col);

            if (!equipSlot) {
              return <div key={i} className="aspect-square" />;
            }

            const itemId = equipment[equipSlot.slot];
            const item = itemId ? getItem(itemId) : null;

            return (
              <button
                key={i}
                onClick={() => {
                  if (itemId) dispatch({ type: 'UNEQUIP_ITEM', slot: equipSlot.slot });
                }}
                className={`aspect-square rounded border flex flex-col items-center justify-center transition-all
                  ${item
                    ? 'bg-osrs-panel border-osrs-gold/50 hover:border-osrs-gold'
                    : 'bg-osrs-darker/60 border-osrs-border/50 border-dashed'
                  }`}
              >
                {item ? (
                  <>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[8px] text-osrs-gold truncate max-w-full px-0.5">{item.name}</span>
                  </>
                ) : (
                  <span className="text-[8px] text-osrs-muted/50">{equipSlot.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats summary */}
        <div className="bg-osrs-darker rounded border border-osrs-border p-2">
          <div className="text-[10px] font-bold text-osrs-gold mb-1">Combat Bonuses</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <StatRow label="⚔️ Attack" value={totalStats.attackBonus || 0} />
            <StatRow label="💪 Strength" value={totalStats.strengthBonus || 0} />
            <StatRow label="🛡️ Defence" value={totalStats.defenceBonus || 0} />
            <StatRow label="🏹 Ranged" value={totalStats.rangedBonus || 0} />
            <StatRow label="🔮 Magic" value={totalStats.magicBonus || 0} />
            <StatRow label="🙏 Prayer" value={totalStats.prayerBonus || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-osrs-muted">{label}</span>
      <span className={value > 0 ? 'text-osrs-green' : value < 0 ? 'text-osrs-red' : 'text-osrs-text'}>
        {value > 0 ? '+' : ''}{value}
      </span>
    </div>
  );
}
