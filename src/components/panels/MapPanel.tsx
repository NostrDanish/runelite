import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../game/store.ts';
import { MAP_WIDTH, MAP_HEIGHT, WORLD_MAP } from '../../game/world.ts';

const MINI_COLORS: Record<string, string> = {
  grass: '#3a6b1e', dirt: '#7a6543', stone: '#707070', water: '#1a4a7a',
  sand: '#c4a86a', tree: '#1a5a0e', rock: '#555', bank: '#8b6914',
  ge: '#c4a040', altar: '#8866aa', furnace: '#8a4400', anvil: '#444', portal: '#4466cc',
};

export function MapPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const tw = w / MAP_WIDTH;
    const th = h / MAP_HEIGHT;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = WORLD_MAP[y][x];
        ctx.fillStyle = MINI_COLORS[tile.type] || '#3a6b1e';
        ctx.fillRect(x * tw, y * th, tw + 0.5, th + 0.5);
      }
    }

    // Wilderness tint
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        ctx.fillStyle = 'rgba(150,0,0,0.2)';
        ctx.fillRect(x * tw, y * th, tw + 0.5, th + 0.5);
      }
    }

    // NPCs as red dots
    for (const npc of state.npcs) {
      if (npc.hp <= 0) continue;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(npc.position.x * tw, npc.position.y * th, Math.max(2, tw), Math.max(2, th));
    }

    // Remote players as white dots
    state.remotePlayers.forEach(rp => {
      if (rp.pubkey === state.player.pubkey) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rp.position.x * tw, rp.position.y * th, Math.max(2, tw), Math.max(2, th));
    });

    // Player as yellow dot with border
    ctx.fillStyle = '#ffff00';
    const px = state.player.position.x * tw;
    const py = state.player.position.y * th;
    ctx.fillRect(px - 1, py - 1, Math.max(3, tw + 2), Math.max(3, th + 2));
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(px - 1, py - 1, Math.max(3, tw + 2), Math.max(3, th + 2));
  }, [state]);

  useEffect(() => { render(); }, [render]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 py-1" style={{ borderBottom: '1px solid var(--osrs-border-dark)' }}>
        <div className="osrs-font text-center" style={{ color: '#ff981f', fontSize: 9 }}>
          World Map
        </div>
      </div>
      <div className="flex-1 p-2 flex flex-col">
        <canvas
          ref={canvasRef}
          width={224}
          height={224}
          style={{ width: '100%', height: 'auto', border: '2px solid var(--osrs-border-dark)', cursor: 'crosshair', imageRendering: 'pixelated' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6, fontSize: 8 }}>
          <div className="flex items-center gap-1">
            <div style={{ width: 6, height: 6, background: '#ffff00', border: '1px solid #000' }} /> You
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 6, height: 6, background: '#ffffff' }} /> Players
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 6, height: 6, background: '#ff0000' }} /> NPCs
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 6, height: 6, background: '#c4a040' }} /> G.E.
          </div>
        </div>
      </div>
    </div>
  );
}
