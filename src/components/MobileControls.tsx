import { useGame } from '../game/store.ts';

export function MobileControls() {
  const { dispatch } = useGame();

  const move = (dx: number, dy: number) => {
    dispatch({ type: 'MOVE', dx, dy });
  };

  const btnStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    background: 'linear-gradient(to bottom, #6b5c4a, #4a3f33)',
    border: '1px solid #1b1610',
    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.1)',
    color: '#ff981f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    cursor: 'pointer',
    touchAction: 'none',
    borderRadius: 2,
  };

  return (
    <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 20, opacity: 0.85 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gridTemplateRows: 'repeat(3, 40px)', gap: 1 }}>
        <div />
        <button style={btnStyle} onPointerDown={(e) => { e.preventDefault(); move(0, -1); }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 2 L12 10 L2 10 Z" fill="#ff981f" /></svg>
        </button>
        <div />
        <button style={btnStyle} onPointerDown={(e) => { e.preventDefault(); move(-1, 0); }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7 L10 2 L10 12 Z" fill="#ff981f" /></svg>
        </button>
        <button
          style={{ ...btnStyle, fontSize: 8, fontFamily: "'Press Start 2P', monospace" }}
          onPointerDown={(e) => { e.preventDefault(); dispatch({ type: 'END_COMBAT' }); dispatch({ type: 'STOP_SKILLING' }); }}
        >
          ESC
        </button>
        <button style={btnStyle} onPointerDown={(e) => { e.preventDefault(); move(1, 0); }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M12 7 L4 2 L4 12 Z" fill="#ff981f" /></svg>
        </button>
        <div />
        <button style={btnStyle} onPointerDown={(e) => { e.preventDefault(); move(0, 1); }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 12 L2 4 L12 4 Z" fill="#ff981f" /></svg>
        </button>
        <div />
      </div>
    </div>
  );
}
