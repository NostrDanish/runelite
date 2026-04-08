import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../game/store.ts';
import { MAP_WIDTH, MAP_HEIGHT, WORLD_MAP, TILE_COLORS } from '../../game/world.ts';

export function MapPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = useGame();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const tileW = w / MAP_WIDTH;
    const tileH = h / MAP_HEIGHT;

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = WORLD_MAP[y][x];
        ctx.fillStyle = TILE_COLORS[tile.type] || '#2d5a1e';
        ctx.fillRect(x * tileW, y * tileH, tileW + 0.5, tileH + 0.5);
      }
    }

    // NPCs
    for (const npc of state.npcs) {
      if (npc.hp <= 0) continue;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(npc.position.x * tileW - 1, npc.position.y * tileH - 1, 3, 3);
    }

    // Remote players
    state.remotePlayers.forEach(rp => {
      if (rp.pubkey === state.player.pubkey) return;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(rp.position.x * tileW - 1, rp.position.y * tileH - 1, 3, 3);
    });

    // Local player
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(
      state.player.position.x * tileW + tileW / 2,
      state.player.position.y * tileH + tileH / 2,
      4, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [state]);

  useEffect(() => {
    render();
  }, [render]);

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const tileW = canvas.width / MAP_WIDTH;
    const tileH = canvas.height / MAP_HEIGHT;
    const x = Math.floor((e.clientX - rect.left) / tileW);
    const y = Math.floor((e.clientY - rect.top) / tileH);
    dispatch({ type: 'LOG', message: `Map: (${x}, ${y})` });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-osrs-border">
        <h2 className="text-sm font-bold text-osrs-gold">🗺️ World Map</h2>
      </div>
      <div className="flex-1 p-2">
        <canvas
          ref={canvasRef}
          width={240}
          height={240}
          onClick={handleClick}
          className="w-full h-auto rounded border border-osrs-border cursor-crosshair"
        />
        <div className="mt-2 grid grid-cols-2 gap-1 text-[9px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-osrs-gold" /> You
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Players
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" /> NPCs
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#d4a017]" /> Grand Exchange
          </div>
        </div>
      </div>
    </div>
  );
}
