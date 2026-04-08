import { useState, useEffect } from 'react';
import { useGame } from '../../game/store.ts';
import { getItem, getTradeableItems } from '../../game/items.ts';
import { postMarketListing, fetchMarketListings } from '../../nostr/events.ts';

export function MarketPanel() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'browse' | 'sell' | 'buy'>('browse');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const listings = await fetchMarketListings();
      dispatch({ type: 'SET_MARKET_LISTINGS', listings });
    } catch {}
    setLoading(false);
  };

  const handleCreate = async (type: 'buy' | 'sell') => {
    if (!selectedItem || quantity < 1 || price < 1) return;
    if (!state.isLoggedIn) {
      dispatch({ type: 'LOG', message: 'Login with Nostr to use the Grand Exchange.' });
      return;
    }

    if (type === 'sell') {
      const invSlot = state.player.inventory.find(s => s.itemId === selectedItem);
      if (!invSlot || invSlot.quantity < quantity) {
        dispatch({ type: 'LOG', message: 'Not enough items.' });
        return;
      }
    }

    const success = await postMarketListing({
      itemId: selectedItem, quantity, pricePerItem: price, type, sellerName: state.player.name,
    });

    if (success) {
      if (type === 'sell') dispatch({ type: 'REMOVE_ITEM', itemId: selectedItem, quantity });
      else dispatch({ type: 'REMOVE_BALANCE', amount: price * quantity });
      dispatch({ type: 'LOG', message: `G.E. offer posted: ${type} ${quantity}x ${getItem(selectedItem)?.name}` });
      loadListings();
    }
  };

  const handleBuy = (listing: any) => {
    const totalCost = listing.pricePerItem * listing.quantity;
    if (state.player.balance < totalCost) {
      dispatch({ type: 'LOG', message: 'Not enough sats.' });
      return;
    }
    dispatch({ type: 'REMOVE_BALANCE', amount: totalCost });
    dispatch({ type: 'ADD_ITEM', itemId: listing.itemId, quantity: listing.quantity });
    dispatch({ type: 'LOG', message: `Bought ${listing.quantity}x ${getItem(listing.itemId)?.name} for ${totalCost} sats.` });
  };

  const filteredListings = state.marketListings.filter(l => {
    if (search) {
      const item = getItem(l.itemId);
      return item?.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-2 py-1" style={{ borderBottom: '1px solid var(--osrs-border-dark)' }}>
        <div className="osrs-font text-center" style={{ color: '#ff981f', fontSize: 9 }}>
          Grand Exchange
        </div>
        <div className="flex gap-0.5 mt-1">
          {(['browse', 'sell', 'buy'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`osrs-tab flex-1 osrs-font capitalize ${tab === t ? 'active' : ''}`}
              style={{ fontSize: 7, padding: '2px 0' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {tab === 'browse' && (
          <div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="osrs-input w-full mb-1.5"
              style={{ fontSize: 9 }}
            />
            {loading ? (
              <div className="osrs-font text-center anim-pulse" style={{ color: '#9f8a6f', padding: 20, fontSize: 8 }}>
                Loading...
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="osrs-font text-center" style={{ color: '#9f8a6f', padding: 20, fontSize: 8 }}>
                No offers found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredListings.map(listing => {
                  const item = getItem(listing.itemId);
                  if (!item) return null;
                  return (
                    <div key={listing.id} className="osrs-inv-slot" style={{ padding: 4 }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="osrs-font" style={{ color: '#ff981f', fontSize: 8 }}>{item.name}</div>
                          <div style={{ fontSize: 8, color: '#9f8a6f' }}>
                            {listing.type === 'sell' ? 'Selling' : 'Buying'} x{listing.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="osrs-font" style={{ color: '#ffff00', fontSize: 8 }}>
                            {listing.pricePerItem} sats
                          </div>
                          {listing.type === 'sell' && listing.sellerPubkey !== state.player.pubkey && (
                            <button onClick={() => handleBuy(listing)} className="osrs-button" style={{ fontSize: 7, padding: '2px 6px', marginTop: 2 }}>
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(tab === 'sell' || tab === 'buy') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <label className="osrs-font" style={{ fontSize: 7, color: '#9f8a6f', display: 'block', marginBottom: 2 }}>Item</label>
              <select
                value={selectedItem}
                onChange={e => { setSelectedItem(e.target.value); const it = getItem(e.target.value); if (it) setPrice(it.satValue); }}
                className="w-full"
                style={{ fontSize: 10 }}
              >
                <option value="">Select...</option>
                {tab === 'sell'
                  ? state.player.inventory.filter(s => getItem(s.itemId)?.tradeable).map(s => {
                    const item = getItem(s.itemId)!;
                    return <option key={s.itemId} value={s.itemId}>{item.name} (x{s.quantity})</option>;
                  })
                  : getTradeableItems().map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))
                }
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <label className="osrs-font" style={{ fontSize: 7, color: '#9f8a6f', display: 'block', marginBottom: 2 }}>Qty</label>
                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} className="osrs-input w-full" />
              </div>
              <div>
                <label className="osrs-font" style={{ fontSize: 7, color: '#9f8a6f', display: 'block', marginBottom: 2 }}>Price/ea</label>
                <input type="number" value={price} onChange={e => setPrice(Math.max(1, parseInt(e.target.value) || 1))} min={1} className="osrs-input w-full" />
              </div>
            </div>

            <div className="osrs-font text-center" style={{ color: '#ffff00', fontSize: 9 }}>
              Total: {(price * quantity).toLocaleString()} sats
            </div>

            <button onClick={() => handleCreate(tab)} className="osrs-button w-full" style={{ padding: '6px 0', fontSize: 9 }}>
              {tab === 'sell' ? 'Confirm Sell Offer' : 'Confirm Buy Offer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
