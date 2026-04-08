import { SimplePool, type Filter, type Event } from 'nostr-tools';

export const RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
];

export const pool = new SimplePool();

export async function fetchEvents(filter: Filter): Promise<Event[]> {
  return pool.querySync(RELAYS, filter);
}

export async function publishEvent(event: Event): Promise<void> {
  await Promise.allSettled(pool.publish(RELAYS, event));
}

export function subscribeToEvents(filter: Filter, onEvent: (event: Event) => void) {
  const sub = pool.subscribeMany(RELAYS, [filter], {
    onevent: onEvent,
  });
  return sub;
}
