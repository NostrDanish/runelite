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
      dispatch({ type: 'LOG', message: 'Login with Nostr to chat.' });
      return;
    }
    const type = tab === 'trade' ? 'trade' : 'public';
    await sendChatMessage(message.trim(), type);
    setMessage('');
  };

  const messages = tab === 'game'
    ? state.gameLog.map((msg, i) => ({ id: `log-${i}`, name: '', content: msg, timestamp: 0, type: 'system' as const }))
    : state.chatMessages.filter(m => tab === 'trade' ? m.type === 'trade' : m.type === 'public').slice(-50);

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex" style={{ borderBottom: '1px solid var(--osrs-border-dark)' }}>
        {(['game', 'public', 'trade'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`osrs-tab flex-1 osrs-font capitalize ${tab === t ? 'active' : ''}`}
            style={{ fontSize: 7, padding: '3px 0' }}
          >
            {t === 'game' ? 'Game' : t === 'public' ? 'Public' : 'Trade'}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-1"
        style={{ background: 'var(--osrs-chat-bg)' }}
      >
        {messages.map((msg, i) => (
          <div key={msg.id || i} style={{ fontSize: 10, lineHeight: 1.5, wordBreak: 'break-word' }}>
            {tab === 'game' ? (
              <span style={{ color: '#000' }}>{msg.content}</span>
            ) : (
              <>
                <span style={{ color: msg.type === 'trade' ? '#8800aa' : '#0000cc', fontWeight: 'bold' }}>
                  {msg.name}:
                </span>{' '}
                <span style={{ color: '#000' }}>{msg.content}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      {tab !== 'game' && (
        <div className="flex" style={{ borderTop: '1px solid var(--osrs-border-dark)' }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={tab === 'trade' ? 'Trade message...' : 'Chat here...'}
            className="osrs-input flex-1"
            style={{ border: 'none', borderRight: '1px solid var(--osrs-border-dark)' }}
          />
          <button onClick={handleSend} className="osrs-button" style={{ padding: '4px 10px', fontSize: 8 }}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}
