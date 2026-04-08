import { useState, useEffect } from 'react';
import { useGame } from '../../game/store.ts';
import { getItem, getTradeableItems } from '../../game/items.ts';
import { postMarketListing, fetchMarketListings } from '../../nostr/events.ts';
import type { MarketListing } from '../../game/types.ts';

export function MarketPanel() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'browse' | 'sell' | 'buy'>('browse');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const listings = await fetchMarketListings();
      dispatch({ type: 'SET_MARKET_LISTINGS', listings });
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreateListing = async (type: 'buy' | 'sell') => {
    if (!selectedItem || quantity < 1 || price < 1) return;
    if (!state.isLoggedIn) {
      dispatch({ type: 'LOG', message: '❌ Login with Nostr to use the Grand Exchange!' });
      return;
    }

    if (type === 'sell') {
      // Check if player has the item
      const invSlot = state.player.inventory.find(s => s.itemId === selectedItem);
      if (!invSlot || invSlot.quantity < quantity) {
        dispatch({ type: 'LOG', message: '❌ You don\'t have enough of that item!' });
        return;
      }
    }

    const success = await postMarketListing({
      itemId: selectedItem,
      quantity,
      pricePerItem: price,
      type,
      sellerName: state.player.name,
    });

    if (success) {
      if (type === 'sell') {
        dispatch({ type: 'REMOVE_ITEM', itemId: selectedItem, quantity });
      } else {
        dispatch({ type: 'REMOVE_BALANCE', amount: price * quantity });
      }
      dispatch({ type: 'LOG', message: `💰 ${type === 'sell' ? 'Sell' : 'Buy'} offer posted on Grand Exchange!` });
      loadListings();
    }
  };

  const handleBuyFromListing = (listing: MarketListing) => {
    const totalCost = listing.pricePerItem * listing.quantity;
    if (state.player.balance < totalCost) {
      dispatch({ type: 'LOG', message: '❌ Not enough sats!' });
      return;
    }
    dispatch({ type: 'REMOVE_BALANCE', amount: totalCost });
    dispatch({ type: 'ADD_ITEM', itemId: listing.itemId, quantity: listing.quantity });
    dispatch({ type: 'LOG', message: `✅ Bought ${listing.quantity}x ${getItem(listing.itemId)?.name} for ${totalCost} sats!` });
  };

  const tradeableItems = getTradeableItems();
  const filteredListings = state.marketListings.filter(l => {
    if (search) {
      const item = getItem(l.itemId);
      return item?.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-osrs-border">
        <h2 className="text-sm font-bold text-osrs-gold">💰 Grand Exchange</h2>
        <div className="flex gap-1 mt-1">
          {(['browse', 'sell', 'buy'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors
                ${tab === t ? 'bg-osrs-gold text-osrs-darker' : 'bg-osrs-panel text-osrs-muted hover:text-osrs-text'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === 'browse' && (
          <div className="space-y-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-osrs-darker border border-osrs-border rounded px-2 py-1 text-xs text-osrs-text placeholder:text-osrs-muted/50 focus:outline-none focus:border-osrs-gold"
            />
            {loading ? (
              <div className="text-center text-xs text-osrs-muted py-4 animate-pulse-gold">Loading...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center text-xs text-osrs-muted py-4">
                No listings found. Be the first to trade!
              </div>
            ) : (
              filteredListings.map((listing) => {
                const item = getItem(listing.itemId);
                if (!item) return null;
                return (
                  <div key={listing.id} className="bg-osrs-darker rounded border border-osrs-border p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-osrs-text">{item.name}</div>
                          <div className="text-[10px] text-osrs-muted">
                            {listing.type === 'sell' ? '📤 Selling' : '📥 Buying'} x{listing.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-osrs-gold">
                          {listing.pricePerItem} sats/ea
                        </div>
                        <div className="text-[10px] text-osrs-muted">
                          Total: {listing.pricePerItem * listing.quantity} sats
                        </div>
                        {listing.type === 'sell' && listing.sellerPubkey !== state.player.pubkey && (
                          <button
                            onClick={() => handleBuyFromListing(listing)}
                            className="mt-1 px-2 py-0.5 bg-osrs-green/20 text-osrs-green rounded text-[10px] hover:bg-osrs-green/30"
                          >
                            Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-[8px] text-osrs-muted mt-1">
                      by {listing.sellerName}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {(tab === 'sell' || tab === 'buy') && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-osrs-muted block mb-1">Item</label>
              <select
                value={selectedItem}
                onChange={e => {
                  setSelectedItem(e.target.value);
                  const item = getItem(e.target.value);
                  if (item) setPrice(item.satValue);
                }}
                className="w-full bg-osrs-darker border border-osrs-border rounded px-2 py-1 text-xs text-osrs-text focus:outline-none focus:border-osrs-gold"
              >
                <option value="">Select item...</option>
                {tab === 'sell'
                  ? state.player.inventory
                      .filter(s => getItem(s.itemId)?.tradeable)
                      .map(s => {
                        const item = getItem(s.itemId)!;
                        return (
                          <option key={s.itemId} value={s.itemId}>
                            {item.icon} {item.name} (x{s.quantity})
                          </option>
                        );
                      })
                  : tradeableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.icon} {item.name}
                      </option>
                    ))
                }
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-osrs-muted block mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-full bg-osrs-darker border border-osrs-border rounded px-2 py-1 text-xs text-osrs-text focus:outline-none focus:border-osrs-gold"
                />
              </div>
              <div>
                <label className="text-[10px] text-osrs-muted block mb-1">Price (sats/ea)</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-full bg-osrs-darker border border-osrs-border rounded px-2 py-1 text-xs text-osrs-text focus:outline-none focus:border-osrs-gold"
                />
              </div>
            </div>

            <div className="text-xs text-osrs-muted text-center">
              Total: <span className="text-osrs-gold font-bold">{(price * quantity).toLocaleString()} sats</span>
            </div>

            <button
              onClick={() => handleCreateListing(tab)}
              className="w-full py-2 rounded font-bold text-xs bg-osrs-gold text-osrs-darker hover:bg-osrs-gold-dark transition-colors"
            >
              {tab === 'sell' ? '📤 Post Sell Offer' : '📥 Post Buy Offer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
