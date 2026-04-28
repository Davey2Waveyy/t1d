import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import './DemoChat.css';

const MAX_MESSAGES = 3;
const STORAGE_KEY = 'betatrace_chat_count_v1';

const WELCOME = {
  role: 'assistant',
  content:
    "Hi, I'm Beta — your T1D demo assistant. Ask me about carb counting, ICR, or how Betatrace works. (Demo limit: 3 messages.)",
};

export default function DemoChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [used, setUsed] = useState(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const remaining = Math.max(0, MAX_MESSAGES - used);
  const limitReached = remaining === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  useEffect(() => {
    if (open && !limitReached) inputRef.current?.focus();
  }, [open, limitReached]);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending || limitReached) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter((m) => m !== WELCOME).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      const newUsed = used + 1;
      setUsed(newUsed);
      try {
        localStorage.setItem(STORAGE_KEY, String(newUsed));
      } catch {
        /* ignore */
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Sorry — ${err.message}. Try again in a moment.`, error: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          className="demochat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open demo chat"
        >
          <MessageCircle size={22} />
          <span className="demochat-fab-label">Ask Beta</span>
        </button>
      )}

      {open && (
        <div className="demochat-panel" role="dialog" aria-label="Demo chat assistant">
          <header className="demochat-header">
            <div className="demochat-header-title">
              <Sparkles size={16} />
              <span>Beta — Demo Assistant</span>
            </div>
            <div className="demochat-header-meta">
              <span className="demochat-counter">
                {remaining}/{MAX_MESSAGES} left
              </span>
              <button
                className="demochat-close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="demochat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`demochat-msg demochat-msg-${m.role}${m.error ? ' demochat-msg-error' : ''}`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="demochat-msg demochat-msg-assistant demochat-msg-typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <form className="demochat-input-row" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                limitReached ? 'Demo limit reached' : 'Ask about carbs, ICR, glucose...'
              }
              disabled={sending || limitReached}
              maxLength={500}
            />
            <button
              type="submit"
              className="demochat-send"
              disabled={sending || limitReached || !input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>

          {limitReached && (
            <div className="demochat-limit-note">
              You've used your 3 demo messages. Sign up to chat without limits (coming soon).
            </div>
          )}
        </div>
      )}
    </>
  );
}
