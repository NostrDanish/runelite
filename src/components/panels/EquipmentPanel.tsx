import { useGame } from '../../game/store.ts';
import { getItem } from '../../game/items.ts';
import type { EquipSlot, ItemStats } from '../../game/types.ts';

const EQUIP_LAYOUT: { slot: EquipSlot; label: string; row: number; col: number }[] = [
  { slot: 'head', label: 'Head', row: 0, col: 1 },
  { slot: 'cape', label: 'Cape', row: 1, col: 0 },
  { slot: 'amulet', label: 'Neck', row: 1, col: 1 },
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
    attackBonus: 0, strengthBonus: 0, defenceBonus: 0,
    rangedBonus: 0, magicBonus: 0, prayerBonus: 0,
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
      <div className="px-2 py-1" style={{ borderBottom: '1px solid var(--osrs-border-dark)' }}>
        <div className="osrs-font text-center" style={{ color: '#ff981f', fontSize: 9 }}>
          Worn Equipment
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Equipment paperdoll */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 8 }}>
          {Array.from({ length: 15 }, (_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const equipSlot = EQUIP_LAYOUT.find(e => e.row === row && e.col === col);

            if (!equipSlot) return <div key={i} style={{ aspectRatio: '1' }} />;

            const itemId = equipment[equipSlot.slot];
            const item = itemId ? getItem(itemId) : null;

            return (
              <button
                key={i}
                onClick={() => { if (itemId) dispatch({ type: 'UNEQUIP_ITEM', slot: equipSlot.slot }); }}
                className="osrs-inv-slot"
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: itemId ? 'pointer' : 'default',
                  border: itemId ? '1px solid var(--osrs-border-light)' : '1px dashed var(--osrs-border-dark)',
                }}
              >
                {item ? (
                  <>
                    <div style={{
                      width: 16, height: 16, background: '#6b5c4a',
                      borderRadius: 2, border: '1px solid rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 'bold', color: '#ffcc66', fontFamily: 'monospace',
                    }}>
                      {item.name[0]}
                    </div>
                    <div className="osrs-font" style={{ fontSize: 6, color: '#ff981f', marginTop: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', padding: '0 1px' }}>
                      {item.name}
                    </div>
                  </>
                ) : (
                  <div className="osrs-font" style={{ fontSize: 6, color: '#4a3f33' }}>
                    {equipSlot.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bonus stats */}
        <div className="osrs-panel" style={{ padding: 6 }}>
          <div className="osrs-font" style={{ color: '#ff981f', fontSize: 8, marginBottom: 4, textAlign: 'center' }}>
            Combat Bonuses
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
            <StatRow label="Stab" value={totalStats.attackBonus || 0} />
            <StatRow label="Slash" value={totalStats.strengthBonus || 0} />
            <StatRow label="Defence" value={totalStats.defenceBonus || 0} />
            <StatRow label="Ranged" value={totalStats.rangedBonus || 0} />
            <StatRow label="Magic" value={totalStats.magicBonus || 0} />
            <StatRow label="Prayer" value={totalStats.prayerBonus || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between" style={{ fontSize: 9 }}>
      <span style={{ color: '#9f8a6f' }}>{label}:</span>
      <span style={{ color: value > 0 ? '#00ff00' : value < 0 ? '#ff0000' : '#ffff00' }}>
        {value > 0 ? '+' : ''}{value}
      </span>
    </div>
  );
}
