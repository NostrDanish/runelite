import { useState } from 'react';
import { useGame } from '../../game/store.ts';
import { getItem } from '../../game/items.ts';

export function InventoryPanel() {
  const { state, dispatch } = useGame();
  const { inventory } = state.player;
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const slots = Array.from({ length: 28 }, (_, i) => inventory[i] || null);

  const handleSlotClick = (index: number) => {
    if (!inventory[index]) {
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot(selectedSlot === index ? null : index);
  };

  const handleAction = (action: string, index: number) => {
    const slot = inventory[index];
    if (!slot) return;
    const item = getItem(slot.itemId);
    if (!item) return;

    switch (action) {
      case 'equip':
        if (item.slot) dispatch({ type: 'EQUIP_ITEM', slotIndex: index });
        break;
      case 'eat':
        if (item.type === 'food') dispatch({ type: 'EAT_FOOD', slotIndex: index });
        break;
      case 'bury':
        if (slot.itemId === 'bones' || slot.itemId === 'big_bones') {
          dispatch({ type: 'BURY_BONES', slotIndex: index });
        }
        break;
      case 'drop':
        dispatch({ type: 'REMOVE_ITEM', itemId: slot.itemId, quantity: 1 });
        break;
    }
    setSelectedSlot(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-osrs-border">
        <h2 className="text-sm font-bold text-osrs-gold">🎒 Inventory</h2>
        <div className="text-[10px] text-osrs-muted">{inventory.length}/28 slots</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-4 gap-1">
          {slots.map((slot, i) => {
            const item = slot ? getItem(slot.itemId) : null;
            const isSelected = selectedSlot === i;

            return (
              <div key={i} className="relative">
                <button
                  onClick={() => handleSlotClick(i)}
                  className={`w-full aspect-square rounded border flex flex-col items-center justify-center text-xs transition-all
                    ${slot
                      ? isSelected
                        ? 'bg-osrs-gold/20 border-osrs-gold'
                        : 'bg-osrs-darker border-osrs-border hover:border-osrs-gold/50'
                      : 'bg-osrs-darker/50 border-osrs-border/30'
                    }`}
                >
                  {item && (
                    <>
                      <span className="text-lg">{item.icon}</span>
                      {slot!.quantity > 1 && (
                        <span className="text-[9px] font-bold text-osrs-gold">
                          {slot!.quantity > 999 ? `${Math.floor(slot!.quantity / 1000)}k` : slot!.quantity}
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Context menu */}
                {isSelected && item && (
                  <div className="absolute top-full left-0 mt-0.5 bg-osrs-darker border border-osrs-border rounded shadow-lg z-30 min-w-[100px] animate-slide-up">
                    <div className="px-2 py-1 border-b border-osrs-border">
                      <div className="text-[10px] font-bold text-osrs-gold truncate">{item.name}</div>
                      <div className="text-[8px] text-osrs-muted">{item.satValue} sats</div>
                    </div>
                    {item.slot && (
                      <button
                        onClick={() => handleAction('equip', i)}
                        className="w-full text-left px-2 py-1 text-[10px] text-osrs-text hover:bg-osrs-panel"
                      >
                        ⚔️ Equip
                      </button>
                    )}
                    {item.type === 'food' && (
                      <button
                        onClick={() => handleAction('eat', i)}
                        className="w-full text-left px-2 py-1 text-[10px] text-osrs-text hover:bg-osrs-panel"
                      >
                        🍖 Eat
                      </button>
                    )}
                    {(slot!.itemId === 'bones' || slot!.itemId === 'big_bones') && (
                      <button
                        onClick={() => handleAction('bury', i)}
                        className="w-full text-left px-2 py-1 text-[10px] text-osrs-text hover:bg-osrs-panel"
                      >
                        🙏 Bury
                      </button>
                    )}
                    <button
                      onClick={() => handleAction('drop', i)}
                      className="w-full text-left px-2 py-1 text-[10px] text-osrs-red hover:bg-osrs-panel"
                    >
                      🗑️ Drop
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
