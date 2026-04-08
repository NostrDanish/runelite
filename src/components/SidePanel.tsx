import { useGame } from '../game/store.ts';
import { StatsPanel } from './panels/StatsPanel.tsx';
import { InventoryPanel } from './panels/InventoryPanel.tsx';
import { EquipmentPanel } from './panels/EquipmentPanel.tsx';
import { MarketPanel } from './panels/MarketPanel.tsx';
import { ChatPanel } from './panels/ChatPanel.tsx';
import { MapPanel } from './panels/MapPanel.tsx';

const TABS: { id: string; label: string; row: number }[] = [
  { id: 'stats', label: 'Stats', row: 0 },
  { id: 'inventory', label: 'Inv', row: 0 },
  { id: 'equipment', label: 'Equip', row: 0 },
  { id: 'market', label: 'G.E.', row: 1 },
  { id: 'chat', label: 'Chat', row: 1 },
  { id: 'map', label: 'Map', row: 1 },
];

export function SidePanel() {
  const { state, dispatch } = useGame();

  const row0 = TABS.filter(t => t.row === 0);
  const row1 = TABS.filter(t => t.row === 1);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--osrs-bg)' }}>
      {/* Tab rows */}
      <div style={{ background: 'var(--osrs-dark)' }}>
        <div className="flex">
          {row0.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_PANEL', panel: tab.id as any })}
              className={`osrs-tab flex-1 py-1.5 text-center osrs-font ${state.activePanel === tab.id ? 'active' : ''}`}
              style={{ fontSize: 8 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex">
          {row1.map(tab => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_PANEL', panel: tab.id as any })}
              className={`osrs-tab flex-1 py-1.5 text-center osrs-font ${state.activePanel === tab.id ? 'active' : ''}`}
              style={{ fontSize: 8 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden" style={{ background: 'var(--osrs-panel)' }}>
        {state.activePanel === 'stats' && <StatsPanel />}
        {state.activePanel === 'inventory' && <InventoryPanel />}
        {state.activePanel === 'equipment' && <EquipmentPanel />}
        {state.activePanel === 'market' && <MarketPanel />}
        {state.activePanel === 'chat' && <ChatPanel />}
        {state.activePanel === 'map' && <MapPanel />}
      </div>
    </div>
  );
}
