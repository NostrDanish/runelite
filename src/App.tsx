import { useReducer, useEffect, useRef } from 'react';
import { GameContext, createInitialState, gameReducer, type GameState } from './game/store.ts';
import { createGameLoop } from './game/gameloop.ts';
import { GameCanvas } from './components/GameCanvas.tsx';
import { HUD } from './components/HUD.tsx';
import { SidePanel } from './components/SidePanel.tsx';
import { MobileControls } from './components/MobileControls.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { savePlayerState, broadcastPosition, subscribeToPlayers, subscribeToChat } from './nostr/events.ts';

export function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;

  // Game loop
  useEffect(() => {
    const cleanup = createGameLoop(() => stateRef.current, dispatch);
    return cleanup;
  }, []);

  // Multiplayer subscriptions
  useEffect(() => {
    if (!state.isLoggedIn) return;

    const playerSub = subscribeToPlayers((player) => {
      if (player.pubkey !== state.player.pubkey) {
        dispatch({ type: 'ADD_REMOTE_PLAYER', player });
      }
    });

    const chatSub = subscribeToChat((msg) => {
      dispatch({ type: 'ADD_CHAT', message: msg });
    });

    return () => {
      playerSub.close();
      chatSub.close();
    };
  }, [state.isLoggedIn, state.player.pubkey]);

  // Auto-save (every 60 seconds)
  useEffect(() => {
    if (!state.isLoggedIn || state.player.pubkey.startsWith('guest_')) return;

    const interval = setInterval(() => {
      savePlayerState(stateRef.current.player).then(ok => {
        if (ok) dispatch({ type: 'LOG', message: '💾 Auto-saved to Nostr' });
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.player.pubkey]);

  // Broadcast position periodically
  useEffect(() => {
    if (!state.isLoggedIn || state.player.pubkey.startsWith('guest_')) return;

    const interval = setInterval(() => {
      broadcastPosition(stateRef.current.player);
    }, 15000);

    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.player.pubkey]);

  // Manual save on Ctrl+S
  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.isLoggedIn && !state.player.pubkey.startsWith('guest_')) {
          savePlayerState(stateRef.current.player).then(ok => {
            if (ok) dispatch({ type: 'LOG', message: '💾 Saved to Nostr!' });
          });
        }
      }
    };
    window.addEventListener('keydown', handleSave);
    return () => window.removeEventListener('keydown', handleSave);
  }, [state.isLoggedIn, state.player.pubkey]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-osrs-darker">
        {/* Game area */}
        <div className="flex-1 relative min-h-0">
          <GameCanvas />
          <HUD />
          {state.isMobile && <MobileControls />}

          {/* Mobile panel toggle */}
          {state.isMobile && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_MOBILE_PANEL' })}
              className="absolute bottom-3 left-3 z-20 w-10 h-10 rounded-lg bg-osrs-darker/80 border border-osrs-border
                flex items-center justify-center text-lg backdrop-blur-sm active:bg-osrs-gold/30"
            >
              📋
            </button>
          )}
        </div>

        {/* Side panel - desktop always visible, mobile slide up */}
        {state.isMobile ? (
          state.showMobilePanel && (
            <div className="absolute inset-x-0 bottom-0 h-[60vh] z-30 animate-slide-up">
              <div className="h-full relative">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_MOBILE_PANEL' })}
                  className="absolute top-2 right-2 z-40 w-6 h-6 rounded bg-osrs-panel text-osrs-muted text-xs flex items-center justify-center"
                >
                  ✕
                </button>
                <SidePanel />
              </div>
            </div>
          )
        ) : (
          <div className="w-[280px] lg:w-[320px] h-full flex-shrink-0">
            <SidePanel />
          </div>
        )}

        {/* Login screen overlay */}
        {!state.isLoggedIn && <LoginScreen />}
      </div>
    </GameContext.Provider>
  );
}
