import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles, X } from 'lucide-react';
import './DemoChat.css';

const MAX_MESSAGES = 5;
const STORAGE_KEY = 'betatrace_chat_count_v2';
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat';

const WELCOME = {
  role: 'assistant',
  content:
    "Hi, I'm Beta. Ask me about the sample glucose, meals, insulin, or what the preview is showing.",
};

function createFallbackReply(text, context) {
  const lower = text.toLowerCase();

  if (lower.includes('range') || lower.includes('tir')) {
    return `The sample data is showing ${context?.stats?.timeInRange ?? 'unknown'}% time in range. Treat that as preview data only, not medical guidance.`;
  }

  if (lower.includes('meal') || lower.includes('carb')) {
    const meal = context?.recentMeals?.[0];
    return meal
      ? `The most recent sample meal is ${meal.name} with ${meal.carbs}g carbs. I can discuss patterns around logged meals, but not recommend dosing.`
      : 'I do not see recent meal entries in the sample context.';
  }

  if (lower.includes('insulin') || lower.includes('dose')) {
    const dose = context?.recentInsulin?.[0];
    return dose
      ? `The most recent sample insulin entry is ${dose.units}u of ${dose.type}. I can explain the log, but dosing decisions should stay with your care team.`
      : 'I do not see recent insulin entries in the sample context.';
  }

  if (lower.includes('glucose') || lower.includes('trend')) {
    return `The current sample glucose is ${context?.stats?.currentGlucose ?? 'unknown'} ${context?.settings?.glucoseUnit ?? 'mg/dL'} with a ${context?.stats?.glucoseTrend ?? 'stable'} trend. This is preview data only.`;
  }

  return 'I am in local demo mode, so I can summarize the sample dashboard without calling the model. Ask about time in range, recent meals, insulin, or glucose trends.';
}

export default function DemoChat({ context, hidden = false }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('Demo mode');
  const [used, setUsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return Number.parseInt(stored || '0', 10) || 0;
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const remaining = Math.max(0, MAX_MESSAGES - used);
  const limitReached = remaining === 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open && !limitReached) {
      inputRef.current?.focus();
    }
  }, [open, limitReached]);

  async function sendMessage(event) {
    event.preventDefault();

    const text = input.trim();
    if (!text || sending || limitReached) return;

    setInput('');
    setSending(true);
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message !== WELCOME)
            .map(({ role, content }) => ({ role, content })),
          context,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Chat service unavailable');
      }

      const nextUsed = used + 1;
      localStorage.setItem(STORAGE_KEY, String(nextUsed));
      setUsed(nextUsed);
      setStatus('AI live');
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch {
      setStatus('Demo mode');
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: createFallbackReply(text, context), error: true },
      ]);
    } finally {
      setSending(false);
    }
  }

  // Guard placed after hooks so hook order never changes between renders.
  if (hidden) return null;

  return (
    <div className="demochat">
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            className="demochat-fab"
            onClick={() => setOpen(true)}
            aria-label="Open Beta assistant"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <Sparkles size={16} strokeWidth={2.2} />
            <span>Beta</span>
          </motion.button>
        )}

        {open && (
          <motion.section
            key="panel"
            className="demochat-panel"
            role="dialog"
            aria-label="Beta demo assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <header className="demochat-header">
              <div className="demochat-title">
                <Sparkles size={15} strokeWidth={2.2} />
                <span>Beta</span>
              </div>
              <div className="demochat-meta">
                <span className={status === 'AI live' ? 'demochat-status demochat-status--live' : 'demochat-status'}>
                  {status}
                </span>
                <span className="demochat-remaining">{remaining} left</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close Beta assistant">
                  <X size={17} />
                </button>
              </div>
            </header>

            <div className="demochat-messages" ref={scrollRef}>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`demochat-message demochat-message-${message.role}`}
                >
                  {message.content}
                </div>
              ))}
              {sending && (
                <div className="demochat-message demochat-message-assistant demochat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <form className="demochat-form" onSubmit={sendMessage}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={limitReached ? 'Demo limit reached' : 'Ask about the preview…'}
                disabled={sending || limitReached}
                maxLength={320}
              />
              <button type="submit" disabled={sending || limitReached || !input.trim()} aria-label="Send message">
                <Send size={15} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
