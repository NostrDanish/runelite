import { type Event } from 'nostr-tools';
import { signEvent } from './auth.ts';
import { publishEvent, fetchEvents, subscribeToEvents } from './pool.ts';
import type { PlayerState, MarketListing, RemotePlayer, ChatMessage } from '../game/types.ts';

// Kind numbers for our game data (using kind 30078 - custom app data)
const APP_PREFIX = 'runelite-web';

// ===== SAVE/LOAD PLAYER STATE =====
export async function savePlayerState(state: PlayerState): Promise<boolean> {
  const content = JSON.stringify({
    skills: state.skills,
    inventory: state.inventory,
    equipment: state.equipment,
    position: state.position,
    hp: state.hp,
    maxHp: state.maxHp,
    prayer: state.prayer,
    maxPrayer: state.maxPrayer,
    balance: state.balance,
  });

  const event = await signEvent({
    kind: 30078,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', `${APP_PREFIX}.save`]],
    content,
  });

  if (!event) return false;
  await publishEvent(event);
  return true;
}

export async function loadPlayerState(pubkey: string): Promise<Partial<PlayerState> | null> {
  try {
    const events = await fetchEvents({
      kinds: [30078],
      authors: [pubkey],
      '#d': [`${APP_PREFIX}.save`],
      limit: 1,
    });

    if (events.length === 0) return null;
    const latest = events.sort((a, b) => b.created_at - a.created_at)[0];
    return JSON.parse(latest.content);
  } catch {
    return null;
  }
}

// ===== LOAD PROFILE METADATA =====
export async function loadProfile(pubkey: string): Promise<{ name: string; picture: string } | null> {
  try {
    const events = await fetchEvents({
      kinds: [0],
      authors: [pubkey],
      limit: 1,
    });

    if (events.length === 0) return null;
    const meta = JSON.parse(events[0].content);
    return {
      name: meta.display_name || meta.name || pubkey.slice(0, 8),
      picture: meta.picture || '',
    };
  } catch {
    return null;
  }
}

// ===== MULTIPLAYER - BROADCAST POSITION =====
export async function broadcastPosition(state: PlayerState): Promise<void> {
  const content = JSON.stringify({
    position: state.position,
    name: state.name,
    picture: state.picture,
    combatLevel: state.totalLevel,
    equipment: state.equipment,
  });

  const event = await signEvent({
    kind: 30078,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', `${APP_PREFIX}.position`]],
    content,
  });

  if (event) {
    await publishEvent(event);
  }
}

export function subscribeToPlayers(onPlayer: (player: RemotePlayer) => void) {
  return subscribeToEvents(
    {
      kinds: [30078],
      '#d': [`${APP_PREFIX}.position`],
      since: Math.floor(Date.now() / 1000) - 300, // last 5 min
    },
    (event: Event) => {
      try {
        const data = JSON.parse(event.content);
        onPlayer({
          pubkey: event.pubkey,
          name: data.name || event.pubkey.slice(0, 8),
          picture: data.picture || '',
          position: data.position,
          combatLevel: data.combatLevel || 3,
          totalLevel: data.totalLevel || 15,
          equipment: data.equipment || {},
          lastSeen: event.created_at,
        });
      } catch { /* skip invalid */ }
    }
  );
}

// ===== CHAT =====
export async function sendChatMessage(content: string, type: 'public' | 'trade' = 'public'): Promise<boolean> {
  const event = await signEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['t', `${APP_PREFIX}-chat`],
      ['t', `${APP_PREFIX}-${type}`],
    ],
    content,
  });

  if (!event) return false;
  await publishEvent(event);
  return true;
}

export function subscribeToChat(onMessage: (msg: ChatMessage) => void) {
  return subscribeToEvents(
    {
      kinds: [1],
      '#t': [`${APP_PREFIX}-chat`],
      since: Math.floor(Date.now() / 1000) - 3600,
    },
    async (event: Event) => {
      let name = event.pubkey.slice(0, 8);
      const type = event.tags.find(t => t[0] === 't' && t[1].includes('trade'))
        ? 'trade' as const : 'public' as const;

      // Try to get name from profile cache
      try {
        const profile = await loadProfile(event.pubkey);
        if (profile) name = profile.name;
      } catch { /* use default */ }

      onMessage({
        id: event.id,
        pubkey: event.pubkey,
        name,
        content: event.content,
        timestamp: event.created_at,
        type,
      });
    }
  );
}

// ===== MARKET (Grand Exchange) =====
export async function postMarketListing(listing: Omit<MarketListing, 'id' | 'sellerPubkey' | 'createdAt'>): Promise<boolean> {
  const content = JSON.stringify({
    itemId: listing.itemId,
    quantity: listing.quantity,
    pricePerItem: listing.pricePerItem,
    type: listing.type,
    sellerName: listing.sellerName,
  });

  const event = await signEvent({
    kind: 30078,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', `${APP_PREFIX}.market.${listing.itemId}.${listing.type}.${Date.now()}`],
      ['t', `${APP_PREFIX}-market`],
      ['t', `${APP_PREFIX}-market-${listing.itemId}`],
    ],
    content,
  });

  if (!event) return false;
  await publishEvent(event);
  return true;
}

export async function fetchMarketListings(itemId?: string): Promise<MarketListing[]> {
  try {
    const filter: any = {
      kinds: [30078],
      '#t': itemId ? [`${APP_PREFIX}-market-${itemId}`] : [`${APP_PREFIX}-market`],
      since: Math.floor(Date.now() / 1000) - 86400, // last 24h
      limit: 50,
    };

    const events = await fetchEvents(filter);
    return events.map(e => {
      try {
        const data = JSON.parse(e.content);
        return {
          id: e.id,
          sellerPubkey: e.pubkey,
          sellerName: data.sellerName || e.pubkey.slice(0, 8),
          itemId: data.itemId,
          quantity: data.quantity,
          pricePerItem: data.pricePerItem,
          createdAt: e.created_at,
          type: data.type,
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as MarketListing[];
  } catch {
    return [];
  }
}

export function subscribeToMarket(onListing: (listing: MarketListing) => void) {
  return subscribeToEvents(
    {
      kinds: [30078],
      '#t': [`${APP_PREFIX}-market`],
      since: Math.floor(Date.now() / 1000) - 86400,
    },
    (event: Event) => {
      try {
        const data = JSON.parse(event.content);
        onListing({
          id: event.id,
          sellerPubkey: event.pubkey,
          sellerName: data.sellerName || event.pubkey.slice(0, 8),
          itemId: data.itemId,
          quantity: data.quantity,
          pricePerItem: data.pricePerItem,
          createdAt: event.created_at,
          type: data.type,
        });
      } catch { /* skip */ }
    }
  );
}
