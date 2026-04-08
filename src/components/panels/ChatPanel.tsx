import { useState, useRef, useEffect } from 'react';
import { useGame } from '../../game/store.ts';
import { sendChatMessage } from '../../nostr/events.ts';

export function ChatPanel() {
  const { state, dispatch } = useGame();
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'game' | 'public' | 'trade'>('game');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatMessages, state.gameLog]);

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!state.isLoggedIn) {
      dispatch({ type: 'LOG', message: '❌ Login with Nostr to chat!' });
      return;
    }

    const type = tab === 'trade' ? 'trade' : 'public';
    await sendChatMessage(message.trim(), type);
    setMessage('');
  };

  const messages = tab === 'game'
    ? state.gameLog.map((msg, i) => ({
        id: `log-${i}`,
        name: 'System',
        content: msg,
        timestamp: 0,
        type: 'system' as const,
      }))
    : state.chatMessages
        .filter(m => tab === 'trade' ? m.type === 'trade' : m.type === 'public')
        .slice(-50);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-osrs-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-osrs-gold">💬 Chat</h2>
        </div>
        <div className="flex gap-1 mt-1">
          {(['game', 'public', 'trade'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors
                ${tab === t ? 'bg-osrs-gold text-osrs-darker' : 'bg-osrs-panel text-osrs-muted hover:text-osrs-text'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className="text-[11px] leading-relaxed">
            {msg.type === 'system' || tab === 'game' ? (
              <span className="text-osrs-muted">{msg.content}</span>
            ) : (
              <>
                <span className={msg.type === 'trade' ? 'text-osrs-purple font-bold' : 'text-osrs-cyan font-bold'}>
                  {msg.name}:
                </span>{' '}
                <span className="text-osrs-text">{msg.content}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {tab !== 'game' && (
        <div className="p-2 border-t border-osrs-border">
          <div className="flex gap-1">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={tab === 'trade' ? 'Trade message...' : 'Chat...'}
              className="flex-1 bg-osrs-darker border border-osrs-border rounded px-2 py-1 text-xs text-osrs-text placeholder:text-osrs-muted/50 focus:outline-none focus:border-osrs-gold"
            />
            <button
              onClick={handleSend}
              className="px-3 py-1 bg-osrs-gold text-osrs-darker rounded text-xs font-bold hover:bg-osrs-gold-dark"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
