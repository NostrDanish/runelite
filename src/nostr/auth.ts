import { type Event } from 'nostr-tools';

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: Partial<Event>): Promise<Event>;
      nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
  }
}

export function hasNostrExtension(): boolean {
  return typeof window.nostr !== 'undefined';
}

export async function getPublicKey(): Promise<string | null> {
  if (!window.nostr) return null;
  try {
    return await window.nostr.getPublicKey();
  } catch {
    return null;
  }
}

export async function signEvent(event: Partial<Event>): Promise<Event | null> {
  if (!window.nostr) return null;
  try {
    return await window.nostr.signEvent(event);
  } catch {
    return null;
  }
}
