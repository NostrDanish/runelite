import { hasNostrExtension, getPublicKey } from '../nostr/auth.ts';
import { loadProfile, loadPlayerState } from '../nostr/events.ts';
import { useGame } from '../game/store.ts';

export function LoginScreen() {
  const { dispatch } = useGame();

  const handleLogin = async () => {
    if (!hasNostrExtension()) {
      dispatch({ type: 'LOG', message: '❌ No Nostr extension found! Install nos2x, Alby, or similar.' });
      return;
    }

    const pubkey = await getPublicKey();
    if (!pubkey) {
      dispatch({ type: 'LOG', message: '❌ Failed to get public key.' });
      return;
    }

    // Load profile
    const profile = await loadProfile(pubkey);
    const name = profile?.name || pubkey.slice(0, 12);
    const picture = profile?.picture || '';

    dispatch({ type: 'LOGIN', pubkey, name, picture });

    // Load save
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-osrs-darker/95 backdrop-blur-sm">
      <div className="max-w-sm w-full mx-4 text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="text-6xl mb-2 animate-float">⚔️</div>
          <h1 className="text-3xl font-bold text-osrs-gold pixel-font tracking-wider">
            RuneLite
          </h1>
          <div className="text-sm text-osrs-gold/70 pixel-font">Web</div>
          <p className="text-xs text-osrs-muted mt-2">
            An OSRS-inspired RPG powered by Nostr & Lightning ⚡
          </p>
        </div>

        {/* Login buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 px-6 bg-osrs-gold text-osrs-darker font-bold rounded-lg text-sm
              hover:bg-osrs-gold-dark transition-all transform hover:scale-[1.02] active:scale-95
              shadow-lg shadow-osrs-gold/20"
          >
            🔑 Login with Nostr
          </button>

          <button
            onClick={handlePlayGuest}
            className="w-full py-3 px-6 bg-osrs-panel text-osrs-text font-bold rounded-lg text-sm
              hover:bg-osrs-border transition-all border border-osrs-border"
          >
            👤 Play as Guest
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-[10px] text-osrs-muted space-y-1">
          <p>🛡️ Login with Nostr to save progress, trade on the Grand Exchange, and chat.</p>
          <p>💰 All economy runs on satoshis (sats). Trade items, earn from combat & skilling.</p>
          <p>⚔️ WASD or Arrow keys to move. Click to interact. Tap on mobile.</p>
        </div>

        {/* Credits */}
        <div className="mt-8 text-[9px] text-osrs-muted/50">
          Vibed with{' '}
          <a href="https://shakespeare.diy" target="_blank" rel="noopener noreferrer" className="underline hover:text-osrs-gold">
            Shakespeare
          </a>
          {' '}| Inspired by RuneLite/OSRS
        </div>
      </div>
    </div>
  );
}
