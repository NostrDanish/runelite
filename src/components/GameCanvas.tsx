import { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../game/store.ts';
import { MAP_WIDTH, MAP_HEIGHT, WORLD_MAP, getTile, getDistance } from '../game/world.ts';
import type { NpcData, WorldPosition } from '../game/types.ts';

const TILE_BASE = 32;

// Terrain colors - authentic OSRS palette
const TERRAIN: Record<string, { base: string; dark: string; accent?: string }> = {
  grass:   { base: '#3a6b1e', dark: '#2d5a16' },
  dirt:    { base: '#7a6543', dark: '#695538' },
  stone:   { base: '#707070', dark: '#585858', accent: '#888' },
  water:   { base: '#1a4a7a', dark: '#0d3a66', accent: '#2266aa' },
  sand:    { base: '#c4a86a', dark: '#b09858' },
  tree:    { base: '#3a6b1e', dark: '#2d5a16' },
  rock:    { base: '#3a6b1e', dark: '#2d5a16' },
  bank:    { base: '#707070', dark: '#585858' },
  ge:      { base: '#c4a86a', dark: '#b09858' },
  altar:   { base: '#707070', dark: '#585858' },
  furnace: { base: '#707070', dark: '#585858' },
  anvil:   { base: '#707070', dark: '#585858' },
  portal:  { base: '#3a6b1e', dark: '#2d5a16' },
};

// NPC visual styles
const NPC_COLORS: Record<string, { body: string; head: string }> = {
  Chicken:      { body: '#ffffff', head: '#ff4444' },
  Goblin:       { body: '#44aa22', head: '#338811' },
  Cow:          { body: '#8b6914', head: '#6b4914' },
  Guard:        { body: '#4455cc', head: '#ddccaa' },
  'Dark Wizard':{ body: '#220033', head: '#ddccaa' },
  'Hill Giant': { body: '#aa8855', head: '#886633' },
  'Lesser Demon':{ body: '#cc2222', head: '#aa1111' },
};

function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, ts: number, type: string) {
  const t = TERRAIN[type] || TERRAIN.grass;
  // Base color with slight variation for texture
  const hash = (x * 73 + y * 137) % 7;
  ctx.fillStyle = hash < 3 ? t.base : t.dark;
  ctx.fillRect(x, y, ts, ts);

  // Texture details based on tile type
  if (type === 'grass') {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    if (hash < 2) {
      ctx.fillRect(x + ts * 0.2, y + ts * 0.3, 2, 2);
      ctx.fillRect(x + ts * 0.7, y + ts * 0.6, 2, 2);
    }
  } else if (type === 'water') {
    ctx.fillStyle = 'rgba(100,180,255,0.15)';
    const wave = Math.sin(Date.now() / 500 + x * 0.5 + y * 0.3) * 0.5 + 0.5;
    ctx.fillRect(x, y + ts * wave * 0.3, ts, 2);
  } else if (type === 'stone') {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(x, y + ts - 1, ts, 1);
    ctx.fillRect(x + ts - 1, y, 1, ts);
  }
}

function drawCharacter(ctx: CanvasRenderingContext2D, cx: number, cy: number, ts: number, bodyColor: string, headColor: string, hasWeapon: boolean, facing: number) {
  const s = ts * 0.7;
  const bx = cx - s / 2;
  const by = cy - s;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, s * 0.4, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#443322';
  ctx.fillRect(bx + s * 0.25, by + s * 0.65, s * 0.18, s * 0.35);
  ctx.fillRect(bx + s * 0.57, by + s * 0.65, s * 0.18, s * 0.35);

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(bx + s * 0.15, by + s * 0.3, s * 0.7, s * 0.4);

  // Arms
  ctx.fillRect(bx + s * 0.02, by + s * 0.32, s * 0.18, s * 0.3);
  ctx.fillRect(bx + s * 0.8, by + s * 0.32, s * 0.18, s * 0.3);

  // Head
  ctx.fillStyle = headColor;
  ctx.fillRect(bx + s * 0.25, by + s * 0.02, s * 0.5, s * 0.32);

  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(bx + s * 0.32, by + s * 0.12, 2, 2);
  ctx.fillRect(bx + s * 0.56, by + s * 0.12, 2, 2);

  // Weapon
  if (hasWeapon) {
    ctx.fillStyle = '#888888';
    ctx.save();
    ctx.translate(bx + s * 0.9, by + s * 0.2);
    ctx.rotate(0.3 + Math.sin(Date.now() / 200) * 0.1);
    ctx.fillRect(-1, 0, 3, s * 0.7);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(-3, 0, 7, 3);
    ctx.restore();
  }
}

function drawNpc(ctx: CanvasRenderingContext2D, cx: number, cy: number, ts: number, npc: NpcData) {
  const colors = NPC_COLORS[npc.name] || { body: '#888', head: '#aaa' };

  if (npc.name === 'Chicken') {
    // Small chicken
    const s = ts * 0.4;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, s * 0.4, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.3, s * 0.4, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.head;
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.3, cy - s * 0.55, s * 0.18, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Beak
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(cx + s * 0.42, cy - s * 0.55, 3, 2);
    // Legs
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy);
    ctx.lineTo(cx - 3, cy + 5);
    ctx.moveTo(cx + 3, cy);
    ctx.lineTo(cx + 3, cy + 5);
    ctx.stroke();
  } else if (npc.name === 'Cow') {
    const s = ts * 0.6;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, s * 0.5, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(cx, cy - s * 0.2, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = '#ddccaa';
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.4, cy - s * 0.45, s * 0.2, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs
    ctx.fillStyle = '#6b4914';
    ctx.fillRect(cx - s * 0.3, cy, 3, 8);
    ctx.fillRect(cx - s * 0.1, cy, 3, 8);
    ctx.fillRect(cx + s * 0.1, cy, 3, 8);
    ctx.fillRect(cx + s * 0.3, cy, 3, 8);
  } else {
    // Humanoid NPCs
    drawCharacter(ctx, cx, cy, ts * 0.9, colors.body, colors.head,
      npc.combatLevel > 5, 0);
  }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, ts: number) {
  const cx = x + ts / 2;
  const by = y + ts;
  // Trunk
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(cx - 3, by - ts * 0.6, 6, ts * 0.6);
  // Crown
  ctx.fillStyle = '#1a5a0e';
  ctx.beginPath();
  ctx.arc(cx, by - ts * 0.7, ts * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22661a';
  ctx.beginPath();
  ctx.arc(cx - 4, by - ts * 0.65, ts * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, by - ts * 0.75, ts * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, ts: number) {
  const cx = x + ts / 2;
  const cy = y + ts * 0.6;
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.ellipse(cx, cy, ts * 0.35, ts * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.ellipse(cx - 3, cy - 3, ts * 0.2, ts * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.ellipse(cx + 5, cy + 2, ts * 0.15, ts * 0.12, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, ts: number, type: string) {
  if (type === 'bank') {
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
    ctx.fillStyle = '#aa8833';
    ctx.fillRect(x + 4, y + 4, ts - 8, ts - 8);
    ctx.fillStyle = '#ffcc00';
    ctx.font = `bold ${Math.max(8, ts * 0.35)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x + ts / 2, y + ts / 2);
  } else if (type === 'ge') {
    ctx.fillStyle = '#c4a040';
    ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
    ctx.strokeStyle = '#aa8822';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 3, ts - 6, ts - 6);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(7, ts * 0.28)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GE', x + ts / 2, y + ts / 2);
  } else if (type === 'altar') {
    ctx.fillStyle = '#8866aa';
    ctx.fillRect(x + ts * 0.2, y + ts * 0.5, ts * 0.6, ts * 0.4);
    ctx.fillStyle = '#aaaaff';
    ctx.beginPath();
    ctx.moveTo(x + ts * 0.5, y + ts * 0.15);
    ctx.lineTo(x + ts * 0.3, y + ts * 0.5);
    ctx.lineTo(x + ts * 0.7, y + ts * 0.5);
    ctx.fill();
    // Glow
    ctx.fillStyle = 'rgba(100,100,255,0.15)';
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts * 0.4, ts * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'furnace') {
    ctx.fillStyle = '#8a4400';
    ctx.fillRect(x + ts * 0.15, y + ts * 0.2, ts * 0.7, ts * 0.7);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x + ts * 0.3, y + ts * 0.4, ts * 0.4, ts * 0.35);
    // Glow
    const glow = Math.sin(Date.now() / 300) * 0.1 + 0.2;
    ctx.fillStyle = `rgba(255,100,0,${glow})`;
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts * 0.5, ts * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'anvil') {
    ctx.fillStyle = '#444';
    ctx.fillRect(x + ts * 0.2, y + ts * 0.55, ts * 0.6, ts * 0.15);
    ctx.fillRect(x + ts * 0.35, y + ts * 0.35, ts * 0.3, ts * 0.2);
    ctx.fillRect(x + ts * 0.3, y + ts * 0.7, ts * 0.1, ts * 0.2);
    ctx.fillRect(x + ts * 0.6, y + ts * 0.7, ts * 0.1, ts * 0.2);
  } else if (type === 'portal') {
    const glow = Math.sin(Date.now() / 400) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(80,80,255,${glow})`;
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts / 2, ts * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6666ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = `rgba(150,150,255,${glow * 0.5})`;
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts / 2, ts * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, current: number, max: number) {
  const h = 5;
  ctx.fillStyle = '#300';
  ctx.fillRect(x, y, w, h);
  const pct = current / max;
  ctx.fillStyle = pct > 0.5 ? '#00cc00' : pct > 0.25 ? '#cccc00' : '#cc0000';
  ctx.fillRect(x, y, w * pct, h);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, w, h);
}

function drawHitsplat(ctx: CanvasRenderingContext2D, cx: number, cy: number, damage: number, isPlayer: boolean) {
  const r = 8;
  ctx.fillStyle = damage > 0 ? '#cc0000' : '#0055aa';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(damage), cx, cy);
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useGame();
  const animFrame = useRef<number>(0);

  const getTileSize = useCallback(() => {
    if (!containerRef.current) return TILE_BASE;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    return Math.max(20, Math.min(Math.floor(w / 17), Math.floor(h / 13)));
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ts = getTileSize();
    const vw = canvas.width;
    const vh = canvas.height;
    const px = state.player.position.x;
    const py = state.player.position.y;
    const ox = Math.floor(vw / 2) - px * ts;
    const oy = Math.floor(vh / 2) - py * ts;

    const tilesX = Math.ceil(vw / ts) + 2;
    const tilesY = Math.ceil(vh / ts) + 2;
    const startX = Math.max(0, Math.floor(-ox / ts) - 1);
    const startY = Math.max(0, Math.floor(-oy / ts) - 1);
    const endX = Math.min(MAP_WIDTH, startX + tilesX);
    const endY = Math.min(MAP_HEIGHT, startY + tilesY);

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, vw, vh);

    // === TERRAIN ===
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = WORLD_MAP[y]?.[x];
        if (!tile) continue;
        const sx = x * ts + ox;
        const sy = y * ts + oy;
        drawTile(ctx, sx, sy, ts, tile.type);

        // Wilderness overlay
        if (y < 4) {
          ctx.fillStyle = 'rgba(180,0,0,0.12)';
          ctx.fillRect(sx, sy, ts, ts);
        }
      }
    }

    // === OBJECTS (trees, rocks, buildings) ===
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = WORLD_MAP[y]?.[x];
        if (!tile) continue;
        const sx = x * ts + ox;
        const sy = y * ts + oy;

        if (tile.type === 'tree') drawTree(ctx, sx, sy, ts);
        else if (tile.type === 'rock') drawRock(ctx, sx, sy, ts);
        else if (['bank', 'ge', 'altar', 'furnace', 'anvil', 'portal'].includes(tile.type)) {
          drawBuilding(ctx, sx, sy, ts, tile.type);
        }
      }
    }

    // === NPCs ===
    for (const npc of state.npcs) {
      if (npc.hp <= 0) continue;
      const nx = npc.position.x * ts + ox;
      const ny = npc.position.y * ts + oy;
      const ncx = nx + ts / 2;
      const ncy = ny + ts;

      drawNpc(ctx, ncx, ncy, ts, npc);

      // HP bar when damaged
      if (npc.hp < npc.maxHp) {
        drawHpBar(ctx, ncx - ts * 0.3, ny - 2, ts * 0.6, npc.hp, npc.maxHp);
      }

      // Name & level when close
      if (getDistance(state.player.position, npc.position) <= 6) {
        ctx.font = `bold ${Math.max(8, ts * 0.28)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = npc.aggressive ? '#ff4444' : '#ffff00';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const label = `${npc.name} (Lvl-${npc.combatLevel})`;
        ctx.strokeText(label, ncx, ny - 6);
        ctx.fillText(label, ncx, ny - 6);
      }
    }

    // === REMOTE PLAYERS ===
    state.remotePlayers.forEach((rp) => {
      if (rp.pubkey === state.player.pubkey) return;
      const rpx = rp.position.x * ts + ox;
      const rpy = rp.position.y * ts + oy;
      drawCharacter(ctx, rpx + ts / 2, rpy + ts, ts, '#3366cc', '#ddccaa', true, 0);

      ctx.font = `bold ${Math.max(8, ts * 0.28)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(rp.name, rpx + ts / 2, rpy - 4);
      ctx.fillText(rp.name, rpx + ts / 2, rpy - 4);
    });

    // === LOCAL PLAYER ===
    const lpx = px * ts + ox;
    const lpy = py * ts + oy;
    const lcx = lpx + ts / 2;
    const lcy = lpy + ts;

    // Player glow in combat
    if (state.player.combat.inCombat) {
      const g = Math.sin(Date.now() / 200) * 0.1 + 0.2;
      ctx.fillStyle = `rgba(255,0,0,${g})`;
      ctx.beginPath();
      ctx.arc(lcx, lcy - ts * 0.3, ts * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCharacter(ctx, lcx, lcy, ts, '#cc8833', '#ddccaa', !!state.player.equipment.weapon, 0);

    // HP bar
    drawHpBar(ctx, lcx - ts * 0.3, lpy - 2, ts * 0.6, state.player.hp, state.player.maxHp);

    // Name
    ctx.font = `bold ${Math.max(9, ts * 0.3)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText(state.player.name, lcx, lpy - 10);
    ctx.fillText(state.player.name, lcx, lpy - 10);

    // === COMBAT LINE ===
    if (state.player.combat.inCombat && state.player.combat.targetNpcId) {
      const target = state.npcs.find(n => n.id === state.player.combat.targetNpcId);
      if (target && target.hp > 0) {
        const tx = target.position.x * ts + ox + ts / 2;
        const ty = target.position.y * ts + oy + ts / 2;
        ctx.strokeStyle = 'rgba(255,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(lcx, lcy - ts * 0.3);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // === SKILLING BAR ===
    if (state.skilling) {
      const bw = 120;
      const bh = 16;
      const bx = vw / 2 - bw / 2;
      const by = vh - 50;
      // Background
      ctx.fillStyle = 'rgba(43,38,32,0.9)';
      ctx.strokeStyle = '#6b5c4a';
      ctx.lineWidth = 1;
      ctx.fillRect(bx - 2, by - 16, bw + 4, bh + 20);
      ctx.strokeRect(bx - 2, by - 16, bw + 4, bh + 20);
      // Label
      ctx.fillStyle = '#ff981f';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.skilling.target, vw / 2, by - 4);
      // Bar
      ctx.fillStyle = '#1b1610';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(bx, by, bw * state.skilling.progress, bh);
      ctx.strokeStyle = '#6b5c4a';
      ctx.strokeRect(bx, by, bw, bh);
      // Percentage
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`${Math.floor(state.skilling.progress * 100)}%`, vw / 2, by + bh - 3);
    }

    // Wilderness warning
    if (state.player.position.y < 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(vw / 2 - 80, 40, 160, 22);
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WARNING: Wilderness!', vw / 2, 55);
    }

    animFrame.current = requestAnimationFrame(render);
  }, [state, getTileSize]);

  // Resize handler
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      dispatch({ type: 'SET_MOBILE', isMobile: window.innerWidth < 768 });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [dispatch]);

  // Render loop
  useEffect(() => {
    animFrame.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame.current);
  }, [render]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); dispatch({ type: 'MOVE', dx: 0, dy: -1 }); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); dispatch({ type: 'MOVE', dx: 0, dy: 1 }); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); dispatch({ type: 'MOVE', dx: -1, dy: 0 }); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); dispatch({ type: 'MOVE', dx: 1, dy: 0 }); break;
        case 'Escape': dispatch({ type: 'END_COMBAT' }); dispatch({ type: 'STOP_SKILLING' }); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  // Click
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ts = getTileSize();
    const ox = Math.floor(canvas.width / 2) - state.player.position.x * ts;
    const oy = Math.floor(canvas.height / 2) - state.player.position.y * ts;
    const tx = Math.floor((cx - ox) / ts);
    const ty = Math.floor((cy - oy) / ts);

    // Check NPC click
    for (const npc of state.npcs) {
      if (npc.hp > 0 && npc.position.x === tx && npc.position.y === ty) {
        if (getDistance(state.player.position, npc.position) <= 1) {
          dispatch({ type: 'START_COMBAT', npcId: npc.id });
        } else {
          const dx = Math.sign(npc.position.x - state.player.position.x);
          const dy = Math.sign(npc.position.y - state.player.position.y);
          dispatch({ type: 'MOVE', dx, dy: 0 });
        }
        return;
      }
    }

    // Tile interact
    const tile = getTile(tx, ty);
    if (tile?.interactable && getDistance(state.player.position, { x: tx, y: ty }) <= 1) {
      handleTileInteract(tile.type, { x: tx, y: ty });
      return;
    }

    // Move toward
    const dx = Math.sign(tx - state.player.position.x);
    const dy = Math.sign(ty - state.player.position.y);
    if (Math.abs(tx - state.player.position.x) >= Math.abs(ty - state.player.position.y)) {
      dispatch({ type: 'MOVE', dx, dy: 0 });
    } else {
      dispatch({ type: 'MOVE', dx: 0, dy });
    }
  }, [state, dispatch, getTileSize]);

  const handleTileInteract = (type: string, pos: WorldPosition) => {
    switch (type) {
      case 'tree': dispatch({ type: 'START_SKILLING', skill: 'woodcutting', target: 'Chopping tree...' }); break;
      case 'rock': dispatch({ type: 'START_SKILLING', skill: 'mining', target: 'Mining rock...' }); break;
      case 'bank': dispatch({ type: 'SET_PANEL', panel: 'inventory' }); dispatch({ type: 'LOG', message: 'Welcome to the bank.' }); break;
      case 'ge': dispatch({ type: 'SET_PANEL', panel: 'market' }); dispatch({ type: 'LOG', message: 'Welcome to the Grand Exchange.' }); break;
      case 'altar': dispatch({ type: 'HEAL', amount: 999 }); dispatch({ type: 'LOG', message: 'You pray at the altar. HP restored.' }); break;
      case 'furnace': dispatch({ type: 'START_SKILLING', skill: 'smithing', target: 'Smelting...' }); break;
      case 'anvil': dispatch({ type: 'START_SKILLING', skill: 'smithing', target: 'Smithing...' }); break;
      case 'portal': dispatch({ type: 'LOG', message: 'The portal hums with energy...' }); break;
      default:
        if (pos.y === 37 && pos.x >= 10 && pos.x < 25) {
          dispatch({ type: 'START_SKILLING', skill: 'fishing', target: 'Fishing...' });
        }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleClick} />
    </div>
  );
}
