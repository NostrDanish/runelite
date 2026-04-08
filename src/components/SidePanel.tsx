import { useGame } from '../game/store.ts';
import { StatsPanel } from './panels/StatsPanel.tsx';
import { InventoryPanel } from './panels/InventoryPanel.tsx';
import { EquipmentPanel } from './panels/EquipmentPanel.tsx';
import { MarketPanel } from './panels/MarketPanel.tsx';
import { ChatPanel } from './panels/ChatPanel.tsx';
import { MapPanel } from './panels/MapPanel.tsx';

const TABS: { id: string; icon: string; label: string }[] = [
  { id: 'inventory', icon: '🎒', label: 'Inv' },
  { id: 'equipment', icon: '🛡️', label: 'Equip' },
  { id: 'stats', icon: '📊', label: 'Stats' },
  { id: 'market', icon: '💰', label: 'GE' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'map', icon: '🗺️', label: 'Map' },
];

export function SidePanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="h-full flex flex-col bg-osrs-dark border-l border-osrs-border">
      {/* Tab bar */}
      <div className="flex border-b border-osrs-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: 'SET_PANEL', panel: tab.id as any })}
            className={`flex-1 py-1.5 text-center transition-colors
              ${state.activePanel === tab.id
                ? 'bg-osrs-panel border-b-2 border-osrs-gold'
                : 'hover:bg-osrs-panel/50'
              }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span className="text-[8px] block text-osrs-muted">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
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
