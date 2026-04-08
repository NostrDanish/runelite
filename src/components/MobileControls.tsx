import { useGame } from '../game/store.ts';

export function MobileControls() {
  const { dispatch } = useGame();

  const move = (dx: number, dy: number) => {
    dispatch({ type: 'MOVE', dx, dy });
  };

  return (
    <div className="absolute bottom-3 right-3 z-20">
      <div className="grid grid-cols-3 gap-0.5" style={{ width: 108, height: 108 }}>
        <div />
        <DPadButton icon="▲" onClick={() => move(0, -1)} />
        <div />
        <DPadButton icon="◀" onClick={() => move(-1, 0)} />
        <DPadButton icon="●" onClick={() => {
          dispatch({ type: 'END_COMBAT' });
          dispatch({ type: 'STOP_SKILLING' });
        }} small />
        <DPadButton icon="▶" onClick={() => move(1, 0)} />
        <div />
        <DPadButton icon="▼" onClick={() => move(0, 1)} />
        <div />
      </div>
    </div>
  );
}

function DPadButton({ icon, onClick, small }: { icon: string; onClick: () => void; small?: boolean }) {
  return (
    <button
      onPointerDown={e => {
        e.preventDefault();
        onClick();
      }}
      className={`rounded-lg border border-osrs-border bg-osrs-darker/80 backdrop-blur-sm
        text-osrs-muted active:bg-osrs-gold/30 active:text-osrs-gold
        flex items-center justify-center select-none touch-none
        ${small ? 'text-xs' : 'text-sm'}`}
      style={{ width: 34, height: 34 }}
    >
      {icon}
    </button>
  );
}
