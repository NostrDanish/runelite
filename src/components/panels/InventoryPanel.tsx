import { useState } from 'react';
import { useGame } from '../../game/store.ts';
import { getItem } from '../../game/items.ts';

// Item icon drawing - simple pixel representations
const ITEM_ICONS: Record<string, { bg: string; symbol: string; symbolColor: string }> = {
  bronze_sword: { bg: '#8b6914', symbol: '/', symbolColor: '#aa8833' },
  iron_sword: { bg: '#888', symbol: '/', symbolColor: '#bbb' },
  steel_sword: { bg: '#aaa', symbol: '/', symbolColor: '#ddd' },
  mithril_sword: { bg: '#446688', symbol: '/', symbolColor: '#6699bb' },
  rune_sword: { bg: '#4488bb', symbol: '/', symbolColor: '#66aadd' },
  staff_of_fire: { bg: '#663300', symbol: '|', symbolColor: '#ff6600' },
  shortbow: { bg: '#663300', symbol: ')', symbolColor: '#996633' },
  bronze_helm: { bg: '#8b6914', symbol: 'n', symbolColor: '#aa8833' },
  iron_helm: { bg: '#888', symbol: 'n', symbolColor: '#bbb' },
  bronze_platebody: { bg: '#8b6914', symbol: 'T', symbolColor: '#aa8833' },
  iron_platebody: { bg: '#888', symbol: 'T', symbolColor: '#bbb' },
  bronze_legs: { bg: '#8b6914', symbol: 'U', symbolColor: '#aa8833' },
  leather_boots: { bg: '#663300', symbol: 'u', symbolColor: '#885522' },
  wooden_shield: { bg: '#663300', symbol: 'O', symbolColor: '#885522' },
  amulet_of_power: { bg: '#9933cc', symbol: 'V', symbolColor: '#bb66ee' },
  shrimp: { bg: '#ff8866', symbol: '~', symbolColor: '#ffaa88' },
  trout: { bg: '#8899aa', symbol: '><', symbolColor: '#aabbcc' },
  salmon: { bg: '#ff8855', symbol: '><', symbolColor: '#ffaa77' },
  lobster: { bg: '#cc3322', symbol: '><', symbolColor: '#ee5544' },
  shark: { bg: '#556688', symbol: '><', symbolColor: '#7788aa' },
  bread: { bg: '#aa8844', symbol: 'o', symbolColor: '#ccaa66' },
  logs: { bg: '#663300', symbol: '=', symbolColor: '#885522' },
  oak_logs: { bg: '#775533', symbol: '=', symbolColor: '#997755' },
  willow_logs: { bg: '#556633', symbol: '=', symbolColor: '#778855' },
  raw_shrimp: { bg: '#cc7766', symbol: '~', symbolColor: '#ee9988' },
  raw_trout: { bg: '#6688aa', symbol: '~', symbolColor: '#88aacc' },
  raw_salmon: { bg: '#ee7744', symbol: '~', symbolColor: '#ff9966' },
  raw_lobster: { bg: '#aa2211', symbol: '~', symbolColor: '#cc4433' },
  copper_ore: { bg: '#8b4513', symbol: '*', symbolColor: '#aa6633' },
  tin_ore: { bg: '#999', symbol: '*', symbolColor: '#bbb' },
  iron_ore: { bg: '#884422', symbol: '*', symbolColor: '#aa6644' },
  coal: { bg: '#333', symbol: '*', symbolColor: '#555' },
  bronze_bar: { bg: '#8b6914', symbol: '#', symbolColor: '#aa8833' },
  iron_bar: { bg: '#888', symbol: '#', symbolColor: '#aaa' },
  bones: { bg: '#ddd', symbol: 'Y', symbolColor: '#bbb' },
  big_bones: { bg: '#eee', symbol: 'Y', symbolColor: '#ccc' },
  air_rune: { bg: '#aabbcc', symbol: 'o', symbolColor: '#ccddee' },
  fire_rune: { bg: '#cc3300', symbol: 'o', symbolColor: '#ee5522' },
  water_rune: { bg: '#3366aa', symbol: 'o', symbolColor: '#5588cc' },
  earth_rune: { bg: '#886633', symbol: 'o', symbolColor: '#aa8855' },
  mind_rune: { bg: '#cc6600', symbol: 'o', symbolColor: '#ee8822' },
  chaos_rune: { bg: '#cc0066', symbol: 'o', symbolColor: '#ee2288' },
  bronze_axe: { bg: '#8b6914', symbol: 'P', symbolColor: '#aa8833' },
  bronze_pickaxe: { bg: '#8b6914', symbol: 'T', symbolColor: '#aa8833' },
  fishing_rod: { bg: '#663300', symbol: 'J', symbolColor: '#885522' },
  tinderbox: { bg: '#cc3300', symbol: 'x', symbolColor: '#ee5522' },
  coins: { bg: '#ffcc00', symbol: '$', symbolColor: '#aa8800' },
};

export function InventoryPanel() {
  const { state, dispatch } = useGame();
  const { inventory } = state.player;
  const [contextMenu, setContextMenu] = useState<{ index: number; x: number; y: number } | null>(null);

  const slots = Array.from({ length: 28 }, (_, i) => inventory[i] || null);

  const handleSlotClick = (index: number, e: React.MouseEvent) => {
    if (!inventory[index]) {
      setContextMenu(null);
      return;
    }
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu(contextMenu?.index === index ? null : { index, x: rect.left, y: rect.bottom });
  };

  const handleAction = (action: string) => {
    if (!contextMenu) return;
    const slot = inventory[contextMenu.index];
    if (!slot) return;
    const item = getItem(slot.itemId);
    if (!item) return;

    switch (action) {
      case 'equip': if (item.slot) dispatch({ type: 'EQUIP_ITEM', slotIndex: contextMenu.index }); break;
      case 'eat': if (item.type === 'food') dispatch({ type: 'EAT_FOOD', slotIndex: contextMenu.index }); break;
      case 'bury': dispatch({ type: 'BURY_BONES', slotIndex: contextMenu.index }); break;
      case 'drop': dispatch({ type: 'REMOVE_ITEM', itemId: slot.itemId, quantity: 1 }); break;
    }
    setContextMenu(null);
  };

  return (
    <div className="h-full flex flex-col relative" onClick={() => setContextMenu(null)}>
      {/* Header */}
      <div className="px-2 py-1" style={{ borderBottom: '1px solid var(--osrs-border-dark)' }}>
        <div className="osrs-font text-center" style={{ color: '#ff981f', fontSize: 9 }}>
          Inventory ({inventory.length}/28)
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-1.5">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {slots.map((slot, i) => {
            const item = slot ? getItem(slot.itemId) : null;
            const visual = slot ? ITEM_ICONS[slot.itemId] : null;

            return (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); handleSlotClick(i, e); }}
                className="osrs-inv-slot"
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: slot ? 'pointer' : 'default',
                  position: 'relative',
                  ...(contextMenu?.index === i ? { boxShadow: 'inset 0 0 6px rgba(255,152,31,0.5)', borderColor: '#ff981f' } : {}),
                }}
              >
                {item && visual && (
                  <>
                    {/* Item visual */}
                    <div style={{
                      width: 20, height: 20,
                      background: visual.bg,
                      borderRadius: 2,
                      border: '1px solid rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: visual.symbolColor,
                      fontFamily: 'monospace',
                      lineHeight: 1,
                    }}>
                      {visual.symbol}
                    </div>
                    {/* Quantity */}
                    {slot!.quantity > 1 && (
                      <div className="osrs-font" style={{
                        fontSize: 7,
                        color: slot!.quantity >= 10000 ? '#00ff00' : slot!.quantity >= 100 ? '#ffffff' : '#ffff00',
                        position: 'absolute',
                        top: 1,
                        left: 3,
                        textShadow: '1px 1px 0 #000',
                      }}>
                        {slot!.quantity >= 1000000 ? `${Math.floor(slot!.quantity / 1000000)}M`
                          : slot!.quantity >= 1000 ? `${Math.floor(slot!.quantity / 1000)}K`
                          : slot!.quantity}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && inventory[contextMenu.index] && (
        <div
          className="osrs-panel anim-slideUp"
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 140,
            zIndex: 50,
            padding: 0,
          }}
          onClick={e => e.stopPropagation()}
        >
          {(() => {
            const slot = inventory[contextMenu.index];
            const item = getItem(slot.itemId)!;
            return (
              <>
                <div style={{ padding: '4px 8px', borderBottom: '1px solid var(--osrs-border-dark)', background: 'var(--osrs-dark)' }}>
                  <div className="osrs-font" style={{ color: '#ff981f', fontSize: 9 }}>{item.name}</div>
                  <div style={{ color: '#9f8a6f', fontSize: 8 }}>{item.satValue} sats</div>
                </div>
                {item.slot && (
                  <MenuItem label="Wield" onClick={() => handleAction('equip')} />
                )}
                {item.type === 'food' && (
                  <MenuItem label={`Eat (heals ${item.healAmount})`} onClick={() => handleAction('eat')} />
                )}
                {(slot.itemId === 'bones' || slot.itemId === 'big_bones') && (
                  <MenuItem label="Bury" onClick={() => handleAction('bury')} />
                )}
                <MenuItem label="Drop" onClick={() => handleAction('drop')} color="#cc4444" />
                <MenuItem label="Cancel" onClick={() => setContextMenu(null)} />
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, color }: { label: string; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '3px 8px',
        background: 'none',
        border: 'none',
        color: color || '#ff981f',
        fontSize: 10,
        cursor: 'pointer',
        fontFamily: "'Press Start 2P', monospace",
      }}
      onMouseEnter={e => (e.target as HTMLElement).style.background = 'var(--osrs-border-light)'}
      onMouseLeave={e => (e.target as HTMLElement).style.background = 'none'}
    >
      {label}
    </button>
  );
}
