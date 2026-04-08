import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../game/store.ts';
import { MAP_WIDTH, MAP_HEIGHT, WORLD_MAP, TILE_COLORS, TILE_ICONS, getTile, getDistance } from '../game/world.ts';
import { getItem } from '../game/items.ts';
import type { WorldPosition } from '../game/types.ts';

const TILE_SIZE = 32;
const VIEW_TILES_X = 17;
const VIEW_TILES_Y = 13;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useGame();
  const animFrame = useRef<number>(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Calculate tile size to fit container
  const getTileSize = useCallback(() => {
    if (!containerRef.current) return TILE_SIZE;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    return Math.max(16, Math.min(Math.floor(w / VIEW_TILES_X), Math.floor(h / VIEW_TILES_Y)));
  }, []);

  // Render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = getTileSize();
    const viewW = canvas.width;
    const viewH = canvas.height;
    const tilesX = Math.ceil(viewW / tileSize) + 1;
    const tilesY = Math.ceil(viewH / tileSize) + 1;

    const px = state.player.position.x;
    const py = state.player.position.y;
    const offsetX = Math.floor(viewW / 2) - px * tileSize;
    const offsetY = Math.floor(viewH / 2) - py * tileSize;

    // Clear
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, viewW, viewH);

    // Draw tiles
    const startX = Math.max(0, Math.floor(-offsetX / tileSize) - 1);
    const startY = Math.max(0, Math.floor(-offsetY / tileSize) - 1);
    const endX = Math.min(MAP_WIDTH, startX + tilesX + 2);
    const endY = Math.min(MAP_HEIGHT, startY + tilesY + 2);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = WORLD_MAP[y]?.[x];
        if (!tile) continue;

        const sx = x * tileSize + offsetX;
        const sy = y * tileSize + offsetY;

        // Tile background
        ctx.fillStyle = TILE_COLORS[tile.type] || '#2d5a1e';
        ctx.fillRect(sx, sy, tileSize, tileSize);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, tileSize, tileSize);

        // Tile icons
        const icon = TILE_ICONS[tile.type];
        if (icon) {
          ctx.font = `${Math.floor(tileSize * 0.6)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(icon, sx + tileSize / 2, sy + tileSize / 2);
        }

        // Wilderness danger border
        if (y < 4) {
          ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
          ctx.fillRect(sx, sy, tileSize, tileSize);
        }
      }
    }

    // Draw NPCs
    for (const npc of state.npcs) {
      if (npc.hp <= 0) continue;
      const nx = npc.position.x * tileSize + offsetX;
      const ny = npc.position.y * tileSize + offsetY;

      // NPC shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(nx + tileSize / 2, ny + tileSize - 2, tileSize / 3, tileSize / 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // NPC icon
      ctx.font = `${Math.floor(tileSize * 0.7)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.icon, nx + tileSize / 2, ny + tileSize / 2);

      // NPC HP bar
      if (npc.hp < npc.maxHp) {
        const barW = tileSize - 4;
        const barH = 4;
        const barX = nx + 2;
        const barY = ny - 6;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(barX, barY, barW * (npc.hp / npc.maxHp), barH);
      }

      // NPC name & level (when close)
      if (getDistance(state.player.position, npc.position) <= 5) {
        ctx.font = `bold ${Math.max(9, Math.floor(tileSize * 0.3))}px sans-serif`;
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(`${npc.name} (Lvl ${npc.combatLevel})`, nx + tileSize / 2, ny - 10);
      }
    }

    // Draw remote players
    state.remotePlayers.forEach((rp) => {
      if (rp.pubkey === state.player.pubkey) return;
      const rpx = rp.position.x * tileSize + offsetX;
      const rpy = rp.position.y * tileSize + offsetY;

      // Player dot
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(rpx + tileSize / 2, rpy + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Player icon
      ctx.font = `${Math.floor(tileSize * 0.5)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText('🧑', rpx + tileSize / 2, rpy + tileSize / 2);

      // Player name
      ctx.font = `bold ${Math.max(8, Math.floor(tileSize * 0.28))}px sans-serif`;
      ctx.fillStyle = '#93c5fd';
      ctx.textAlign = 'center';
      ctx.fillText(rp.name, rpx + tileSize / 2, rpy - 4);
    });

    // Draw local player
    const lpx = px * tileSize + offsetX;
    const lpy = py * tileSize + offsetY;

    // Player glow
    const time = Date.now() / 1000;
    const glowSize = tileSize / 2.5 + Math.sin(time * 3) * 2;
    ctx.fillStyle = state.player.combat.inCombat
      ? 'rgba(220, 38, 38, 0.25)'
      : 'rgba(245, 158, 11, 0.2)';
    ctx.beginPath();
    ctx.arc(lpx + tileSize / 2, lpy + tileSize / 2, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Player character
    ctx.font = `${Math.floor(tileSize * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.player.equipment.weapon ? '⚔️' : '🧍', lpx + tileSize / 2, lpy + tileSize / 2);

    // Player name
    ctx.font = `bold ${Math.max(9, Math.floor(tileSize * 0.3))}px sans-serif`;
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'center';
    ctx.fillText(state.player.name, lpx + tileSize / 2, lpy - 8);

    // Player HP bar
    const hpBarW = tileSize;
    const hpBarH = 4;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(lpx, lpy + tileSize + 2, hpBarW, hpBarH);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(lpx, lpy + tileSize + 2, hpBarW * (state.player.hp / state.player.maxHp), hpBarH);

    // Combat hit splats
    if (state.player.combat.inCombat && state.player.combat.targetNpcId) {
      const target = state.npcs.find(n => n.id === state.player.combat.targetNpcId);
      if (target && target.hp > 0) {
        const tnx = target.position.x * tileSize + offsetX;
        const tny = target.position.y * tileSize + offsetY;
        // Attack indicator line
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(lpx + tileSize / 2, lpy + tileSize / 2);
        ctx.lineTo(tnx + tileSize / 2, tny + tileSize / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Skilling progress bar
    if (state.skilling) {
      const barW = 100;
      const barH = 12;
      const barX = viewW / 2 - barW / 2;
      const barY = viewH - 40;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(barX - 2, barY - 14, barW + 4, barH + 18);
      ctx.fillStyle = '#334155';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(barX, barY, barW * state.skilling.progress, barH);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(state.skilling.target, viewW / 2, barY - 3);
    }

    // Minimap area label
    // (Drawn in HUD component instead)

    animFrame.current = requestAnimationFrame(render);
  }, [state, getTileSize]);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      dispatch({ type: 'SET_MOBILE', isMobile: window.innerWidth < 768 });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // Game loop
  useEffect(() => {
    animFrame.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame.current);
  }, [render]);

  // Keyboard input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': dispatch({ type: 'MOVE', dx: 0, dy: -1 }); break;
        case 'ArrowDown': case 's': case 'S': dispatch({ type: 'MOVE', dx: 0, dy: 1 }); break;
        case 'ArrowLeft': case 'a': case 'A': dispatch({ type: 'MOVE', dx: -1, dy: 0 }); break;
        case 'ArrowRight': case 'd': case 'D': dispatch({ type: 'MOVE', dx: 1, dy: 0 }); break;
        case 'Escape': dispatch({ type: 'END_COMBAT' }); dispatch({ type: 'STOP_SKILLING' }); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch]);

  // Click/tap to interact
  const handleCanvasClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const tileSize = getTileSize();
    const offsetX = Math.floor(canvas.width / 2) - state.player.position.x * tileSize;
    const offsetY = Math.floor(canvas.height / 2) - state.player.position.y * tileSize;

    const tileX = Math.floor((canvasX - offsetX) / tileSize);
    const tileY = Math.floor((canvasY - offsetY) / tileSize);

    // Check if clicking an NPC
    for (const npc of state.npcs) {
      if (npc.hp > 0 && npc.position.x === tileX && npc.position.y === tileY) {
        if (getDistance(state.player.position, npc.position) <= 1) {
          dispatch({ type: 'START_COMBAT', npcId: npc.id });
          return;
        } else {
          dispatch({ type: 'LOG', message: `Too far to attack ${npc.name}. Move closer!` });
          // Move toward NPC
          const dx = Math.sign(npc.position.x - state.player.position.x);
          const dy = Math.sign(npc.position.y - state.player.position.y);
          dispatch({ type: 'MOVE', dx, dy: 0 });
          return;
        }
      }
    }

    // Check tile interactions
    const tile = getTile(tileX, tileY);
    if (tile?.interactable && getDistance(state.player.position, { x: tileX, y: tileY }) <= 1) {
      handleTileInteract(tile.type, { x: tileX, y: tileY });
      return;
    }

    // Move toward click
    const dx = Math.sign(tileX - state.player.position.x);
    const dy = Math.sign(tileY - state.player.position.y);
    if (dx !== 0 || dy !== 0) {
      // Prefer horizontal/vertical based on distance
      if (Math.abs(tileX - state.player.position.x) > Math.abs(tileY - state.player.position.y)) {
        dispatch({ type: 'MOVE', dx, dy: 0 });
      } else {
        dispatch({ type: 'MOVE', dx: 0, dy });
      }
    }
  }, [state, dispatch, getTileSize]);

  const handleTileInteract = (tileType: string, pos: WorldPosition) => {
    switch (tileType) {
      case 'tree':
        dispatch({ type: 'START_SKILLING', skill: 'woodcutting', target: 'Chopping tree...' });
        break;
      case 'rock':
        dispatch({ type: 'START_SKILLING', skill: 'mining', target: 'Mining rock...' });
        break;
      case 'bank':
        dispatch({ type: 'SET_PANEL', panel: 'inventory' });
        dispatch({ type: 'LOG', message: '🏦 Welcome to the bank!' });
        break;
      case 'ge':
        dispatch({ type: 'SET_PANEL', panel: 'market' });
        dispatch({ type: 'LOG', message: '💰 Welcome to the Grand Exchange!' });
        break;
      case 'altar':
        dispatch({ type: 'HEAL', amount: 999 });
        dispatch({ type: 'LOG', message: '⛪ You pray at the altar. HP restored!' });
        break;
      case 'furnace':
        dispatch({ type: 'START_SKILLING', skill: 'smithing', target: 'Smelting...' });
        break;
      case 'anvil':
        dispatch({ type: 'START_SKILLING', skill: 'smithing', target: 'Smithing...' });
        break;
      case 'portal':
        dispatch({ type: 'LOG', message: '🌀 The portal hums with energy...' });
        break;
      default:
        if (pos.y === 37 && pos.x >= 10 && pos.x < 25) {
          dispatch({ type: 'START_SKILLING', skill: 'fishing', target: 'Fishing...' });
        }
    }
  };

  // Touch controls for mobile movement
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStart.current.x;
    const dy = endY - touchStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 15) {
      // Tap - treat as click
      // Already handled by onClick
      touchStart.current = null;
      return;
    }

    // Swipe
    if (Math.abs(dx) > Math.abs(dy)) {
      dispatch({ type: 'MOVE', dx: dx > 0 ? 1 : -1, dy: 0 });
    } else {
      dispatch({ type: 'MOVE', dx: 0, dy: dy > 0 ? 1 : -1 });
    }
    touchStart.current = null;
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer touch-none"
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
