import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, MessageCircleQuestion, Database } from 'lucide-react';

const ease = [0.23, 1, 0.32, 1];

const SCRIPT = [
  { role: 'user', text: 'Why did I go high after dinner?' },
  {
    role: 'assistant',
    text: 'Dinner carried your largest carb entry today (74g at 19:24), and the rise starts about 40 minutes later. Worth checking how close the bolus landed to the meal.',
  },
  { role: 'user', text: 'Is this a one-off or a pattern?' },
  {
    role: 'assistant',
    text: 'It repeats — 4 of the last 7 evenings show the same shape. That would be a useful pattern to bring to your care team; I can’t advise on dose changes.',
  },
];

const GUARDRAILS = [
  {
    icon: ShieldCheck,
    title: 'Never doses',
    copy: 'Beta reads your logs and describes patterns. Dosing, corrections, and therapy changes stay with you and your clinician.',
  },
  {
    icon: Database,
    title: 'Grounded in your entries',
    copy: 'Answers reference the meals, doses, and readings on screen — not generic diabetes advice from the internet.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Built for questions',
    copy: 'Ask why a day looked rough or which meals hit hardest, in plain language.',
  },
];

function ChatDemo() {
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, margin: '-120px' });
  const reduced = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) {
      setVisibleCount(SCRIPT.length);
      return undefined;
    }
    if (visibleCount >= SCRIPT.length) return undefined;

    const next = SCRIPT[visibleCount];
    const isAssistant = next.role === 'assistant';
    const lead = visibleCount === 0 ? 700 : isAssistant ? 1500 : 1100;

    let showTimer;
    const typingTimer = setTimeout(() => {
      if (isAssistant) setTyping(true);
      showTimer = setTimeout(() => {
        setTyping(false);
        setVisibleCount((count) => count + 1);
      }, isAssistant ? 1300 : 80);
    }, lead);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(showTimer);
    };
  }, [inView, visibleCount, reduced]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount, typing]);

  return (
    <div className="askbeta-chat" ref={wrapRef}>
      <div className="askbeta-chat-core">
      <div className="askbeta-chat-head">
        <span className="askbeta-chat-title"><Sparkles size={14} strokeWidth={1.8} /> Beta</span>
        <span className="askbeta-chat-status">Demo conversation</span>
      </div>
      <div className="askbeta-chat-scroll" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {SCRIPT.slice(0, visibleCount).map((message, i) => (
            <motion.div
              key={i}
              className={`askbeta-bubble askbeta-bubble--${message.role}`}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease }}
            >
              {message.text}
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              className="askbeta-bubble askbeta-bubble--assistant askbeta-typing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span /><span /><span />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="askbeta-chat-foot" aria-hidden="true">
        <span>Ask about the preview…</span>
        <i><ArrowRight size={13} strokeWidth={2} /></i>
      </div>
      </div>
    </div>
  );
}

export default function AskBeta({ onOpenDemo }) {
  return (
    <section className="askbeta" id="ask-beta">
      <div className="container askbeta-inner">
        <ChatDemo />

        <div className="askbeta-copy">
          <motion.p
            className="text-kicker"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
          >
            Ask Beta
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            An assistant that reads your logs,
            <em> not your mind.</em>
          </motion.h2>

          <ul className="askbeta-points">
            {GUARDRAILS.map((point, i) => (
              <motion.li
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ delay: 0.14 + i * 0.09, duration: 0.6, ease }}
              >
                <span className="askbeta-point-icon"><point.icon size={16} strokeWidth={2.2} /></span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.copy}</p>
                </div>
              </motion.li>
            ))}
          </ul>

          <motion.button
            className="btn btn-glass"
            onClick={onOpenDemo}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ delay: 0.42, duration: 0.6, ease }}
          >
            Try five questions in the demo
            <span className="btn-orb"><ArrowRight size={14} strokeWidth={2} /></span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
