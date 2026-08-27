import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowDown, Lock, Smartphone } from 'lucide-react';

const ease = [0.32, 0.72, 0, 1];

const rise = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.1 + i * 0.1, duration: 0.9, ease },
  }),
};

// 24h of believable glucose, hand-tuned: overnight flat, breakfast rise,
// lunch bump, post-dinner climb that settles.
const CURVE = 'M0,66 C10,64 18,62 28,63 C38,64 44,58 52,42 C60,28 66,30 74,40 C82,50 88,54 98,50 C108,46 114,36 124,38 C134,40 142,52 152,56 C160,59 166,44 176,30 C186,18 194,22 202,34 C210,45 218,52 228,54 C238,56 246,53 256,52';

function GlucoseSpark({ delay = 1 }) {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 256 88" className="phone-spark" aria-hidden="true">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4be0b4" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#4be0b4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="26" width="256" height="34" rx="4" className="phone-spark-band" />
      <motion.path
        d={`${CURVE} L256,88 L0,88 Z`}
        fill="url(#sparkFill)"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1.1, duration: 0.8 }}
      />
      <motion.path
        d={CURVE}
        fill="none"
        stroke="#4be0b4"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 1.8, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="256"
        cy="52"
        r="3.5"
        className="phone-spark-dot"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 1.7, duration: 0.3 }}
      />
    </svg>
  );
}

function PhonePreview() {
  const [glucose, setGlucose] = useState(112);

  // Gentle live drift so the mock feels alive without being noisy
  useEffect(() => {
    const id = setInterval(() => {
      setGlucose((value) => {
        const next = value + Math.round((Math.random() - 0.45) * 3);
        return Math.max(96, Math.min(128, next));
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="hero-phone-wrap"
      initial={{ opacity: 0, y: 50, rotate: 2, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.4, duration: 1.2, ease }}
    >
      <div className="hero-phone" role="img" aria-label="Preview of the Betatrace mobile dashboard">
        <div className="hero-phone-core">
          <div className="hero-phone-notch" />
          <div className="hero-phone-screen">
            <div className="phone-topbar">
              <span className="phone-avatar">B</span>
              <span className="phone-wordmark">Betatrace</span>
              <span className="phone-bell" />
            </div>

            <p className="phone-greeting">Good evening, guest</p>

            <div className="phone-hero-card">
              <div className="phone-hero-head">
                <span>Current</span>
                <span className="phone-chip">In range</span>
              </div>
              <div className="phone-hero-value">
                <strong>{glucose}</strong>
                <small>mg/dL</small>
              </div>
              <GlucoseSpark />
            </div>

            <div className="phone-stat-row">
              <div className="phone-stat">
                <span>Carbs today</span>
                <strong>128<small>g</small></strong>
              </div>
              <div className="phone-stat">
                <span>Time in range</span>
                <strong>74<small>%</small></strong>
              </div>
            </div>

            <div className="phone-activity">
              <div className="phone-activity-row">
                <span className="phone-dot phone-dot--meal" />
                <div><strong>Dinner</strong><em>Pasta, 62g carbs</em></div>
                <small>19:24</small>
              </div>
              <div className="phone-activity-row">
                <span className="phone-dot phone-dot--insulin" />
                <div><strong>Bolus</strong><em>5.5u Humalog</em></div>
                <small>19:12</small>
              </div>
            </div>
          </div>
          <div className="hero-phone-home" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero({ onOpenDemo }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-aurora" aria-hidden="true">
        <span className="hero-aurora-a" />
        <span className="hero-aurora-b" />
        <span className="hero-aurora-grid" />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <motion.p className="text-kicker hero-kicker" variants={rise} initial="hidden" animate="show" custom={0}>
            <Smartphone size={12} strokeWidth={1.8} />
            A T1D logging demo
          </motion.p>

          <motion.h1 className="hero-title" variants={rise} initial="hidden" animate="show" custom={1}>
            See your Type&nbsp;1 patterns,
            <em> in one place.</em>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={rise} initial="hidden" animate="show" custom={2}>
            Betatrace brings meals, insulin, and glucose into one mobile workspace,
            so you can review the week without piecing together separate logs.
          </motion.p>

          <motion.div className="hero-actions" variants={rise} initial="hidden" animate="show" custom={3}>
            <button className="btn btn-primary btn-lg" onClick={onOpenDemo}>
              Explore the live demo
              <span className="btn-orb"><ArrowRight size={15} strokeWidth={2} /></span>
            </button>
            <a className="btn btn-glass btn-lg" href="#how-it-works">
              How it works
              <span className="btn-orb"><ArrowDown size={15} strokeWidth={2} /></span>
            </a>
          </motion.div>

          <motion.ul className="hero-trust" variants={rise} initial="hidden" animate="show" custom={4}>
            <li><Lock size={12} strokeWidth={1.8} /> No account needed</li>
            <li>Demo data stays on this device</li>
            <li>Not medical advice</li>
          </motion.ul>
        </div>

        <PhonePreview />
      </div>

      <motion.div
        className="hero-scroll-hint"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
      >
        <span />
      </motion.div>
    </section>
  );
}
