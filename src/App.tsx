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
    return () => { playerSub.close(); chatSub.close(); };
  }, [state.isLoggedIn, state.player.pubkey]);

  // Auto-save every 60s
  useEffect(() => {
    if (!state.isLoggedIn || state.player.pubkey.startsWith('guest_')) return;
    const interval = setInterval(() => {
      savePlayerState(stateRef.current.player).then(ok => {
        if (ok) dispatch({ type: 'LOG', message: 'Auto-saved to Nostr.' });
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.player.pubkey]);

  // Broadcast position
  useEffect(() => {
    if (!state.isLoggedIn || state.player.pubkey.startsWith('guest_')) return;
    const interval = setInterval(() => {
      broadcastPosition(stateRef.current.player);
    }, 15000);
    return () => clearInterval(interval);
  }, [state.isLoggedIn, state.player.pubkey]);

  // Ctrl+S save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.isLoggedIn && !state.player.pubkey.startsWith('guest_')) {
          savePlayerState(stateRef.current.player).then(ok => {
            if (ok) dispatch({ type: 'LOG', message: 'Saved to Nostr.' });
          });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.isLoggedIn, state.player.pubkey]);

  const panelWidth = state.isMobile ? 0 : 260;

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', background: '#000' }}>
        {/* Game viewport */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0 }}>
          <GameCanvas />
          <HUD />
          {state.isMobile && <MobileControls />}

          {/* Mobile panel toggle */}
          {state.isMobile && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_MOBILE_PANEL' })}
              className="osrs-button"
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                zIndex: 20,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                padding: 0,
                opacity: 0.85,
              }}
            >
              ☰
            </button>
          )}
        </div>

        {/* Side panel - desktop */}
        {!state.isMobile && (
          <div style={{ width: panelWidth, height: '100%', flexShrink: 0, borderLeft: '2px solid #1b1610' }}>
            <SidePanel />
          </div>
        )}

        {/* Side panel - mobile slide up */}
        {state.isMobile && state.showMobilePanel && (
          <div style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            height: '55vh',
            zIndex: 30,
          }}
            className="anim-slideUp"
          >
            <div style={{ height: '100%', position: 'relative', borderTop: '2px solid #6b5c4a' }}>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_MOBILE_PANEL' })}
                className="osrs-button"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 40,
                  width: 24,
                  height: 24,
                  padding: 0,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                X
              </button>
              <SidePanel />
            </div>
          </div>
        )}

        {/* Login overlay */}
        {!state.isLoggedIn && <LoginScreen />}
      </div>
    </GameContext.Provider>
  );
}
