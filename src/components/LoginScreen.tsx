import { useState } from 'react';
import { hasNostrExtension, getPublicKey } from '../nostr/auth.ts';
import { loadProfile, loadPlayerState } from '../nostr/events.ts';
import { useGame } from '../game/store.ts';

export function LoginScreen() {
  const { dispatch } = useGame();
  const [status, setStatus] = useState('');

  const handleLogin = async () => {
    if (!hasNostrExtension()) {
      setStatus('No Nostr extension found. Install nos2x, Alby, or similar.');
      return;
    }

    setStatus('Connecting...');
    const pubkey = await getPublicKey();
    if (!pubkey) {
      setStatus('Failed to get public key.');
      return;
    }

    setStatus('Loading profile...');
    const profile = await loadProfile(pubkey);
    const name = profile?.name || pubkey.slice(0, 12);
    const picture = profile?.picture || '';

    dispatch({ type: 'LOGIN', pubkey, name, picture });

    setStatus('Loading save data...');
    const save = await loadPlayerState(pubkey);
    if (save) {
      dispatch({ type: 'LOAD_SAVE', data: save });
    }
  };

  const handlePlayGuest = () => {
    dispatch({
      type: 'LOGIN',
      pubkey: 'guest_' + Math.random().toString(36).slice(2),
      name: 'Guest',
      picture: '',
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0804 0%, #1b1610 30%, #2b2620 100%)',
    }}>
      {/* Decorative border */}
      <div style={{
        position: 'absolute',
        inset: 0,
        border: '3px solid #3e3529',
        boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 360, width: '100%', padding: '0 20px', textAlign: 'center' }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          {/* Logo - stylized rune */}
          <div style={{ marginBottom: 16 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ display: 'inline-block' }}>
              <defs>
                <linearGradient id="runeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffcc44" />
                  <stop offset="100%" stopColor="#aa7700" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="36" fill="none" stroke="url(#runeGrad)" strokeWidth="3" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="#6b5c4a" strokeWidth="1" />
              <path d="M 25 55 L 40 15 L 55 55 Z" fill="none" stroke="url(#runeGrad)" strokeWidth="2.5" />
              <path d="M 32 45 L 40 22 L 48 45 Z" fill="rgba(255,200,50,0.15)" />
              <circle cx="40" cy="38" r="4" fill="#ffcc44" />
              <path d="M 35 50 L 40 42 L 45 50" stroke="#aa7700" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <h1 className="osrs-font" style={{
            fontSize: 18,
            color: '#ff981f',
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
            letterSpacing: 3,
          }}>
            RuneLite
          </h1>
          <div className="osrs-font" style={{
            fontSize: 10,
            color: '#9f8a6f',
            textShadow: '1px 1px 0 #000',
            marginTop: 4,
          }}>
            Web
          </div>
          <div style={{
            fontSize: 11,
            color: '#6b5c4a',
            marginTop: 12,
            lineHeight: 1.5,
          }}>
            An OSRS-inspired MMORPG<br />powered by Nostr & Lightning
          </div>
        </div>

        {/* Login box */}
        <div className="osrs-panel" style={{ padding: '20px 16px', marginBottom: 16 }}>
          <button
            onClick={handleLogin}
            className="osrs-button w-full"
            style={{
              padding: '10px 16px',
              fontSize: 10,
              display: 'block',
              marginBottom: 8,
              background: 'linear-gradient(to bottom, #8b6914, #6b4904)',
            }}
          >
            Login with Nostr
          </button>

          <button
            onClick={handlePlayGuest}
            className="osrs-button w-full"
            style={{ padding: '8px 16px', fontSize: 9, display: 'block' }}
          >
            Play as Guest
          </button>

          {status && (
            <div className="osrs-font" style={{ color: '#ffff00', fontSize: 8, marginTop: 8, textAlign: 'center' }}>
              {status}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ fontSize: 9, color: '#6b5c4a', lineHeight: 1.6 }}>
          <div>Login with Nostr to save progress, trade, and chat.</div>
          <div>WASD / Arrows to move. Click to interact.</div>
          <div style={{ marginTop: 4 }}>All economy runs on satoshis.</div>
        </div>

        {/* Credits */}
        <div style={{ marginTop: 24, fontSize: 8, color: '#3e3529' }}>
          Vibed with{' '}
          <a href="https://shakespeare.diy" target="_blank" rel="noopener noreferrer" style={{ color: '#6b5c4a', textDecoration: 'underline' }}>
            Shakespeare
          </a>
        </div>
      </div>
    </div>
  );
}
