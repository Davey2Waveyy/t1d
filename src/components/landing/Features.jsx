import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { TrendingUp, UtensilsCrossed, Syringe, Radar, SlidersHorizontal } from 'lucide-react';

const ease = [0.23, 1, 0.32, 1];

function useSpotlight() {
  const ref = useRef(null);
  const onMove = (event) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };
  return { ref, onMove };
}

function Card({ area, icon: Icon, title, children, copy, index = 0 }) {
  const { ref, onMove } = useSpotlight();
  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      className={`bento-card bento-card--${area}`}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.85, ease }}
    >
      <div className="bento-card-core">
        <div className="bento-visual">{children}</div>
        <div className="bento-copy">
          <h3><Icon size={15} strokeWidth={1.8} /> {title}</h3>
          <p>{copy}</p>
        </div>
      </div>
    </motion.article>
  );
}

// ---- In-card visuals ------------------------------------------------------

const TREND_PATH = 'M0,72 C24,70 40,64 58,66 C76,68 88,44 106,36 C124,28 138,34 156,46 C174,58 186,64 206,60 C226,56 240,38 262,32 C284,26 300,34 320,40';

function TrendVisual() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  return (
    <div ref={ref} className="viz-trend viz-screen">
      <div className="viz-trend-head">
        <div>
          <span className="viz-label">Avg glucose</span>
          <span className="viz-number">132<small>mg/dL</small></span>
        </div>
        <div>
          <span className="viz-label">GMI</span>
          <span className="viz-number">6.4<small>%</small></span>
        </div>
        <span className="viz-range">Last 24h</span>
      </div>
      <svg viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4be0b4" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#4be0b4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="30" width="320" height="42" rx="5" className="viz-band" />
        <motion.path
          d={`${TREND_PATH} L320,110 L0,110 Z`}
          fill="url(#trendFill)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.9 }}
        />
        <motion.path
          d={TREND_PATH}
          fill="none"
          stroke="#4be0b4"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.9, ease: 'easeInOut' }}
        />
      </svg>
      <div className="viz-trend-times" aria-hidden="true">
        <span>6 am</span><span>noon</span><span>6 pm</span><span>midnight</span>
      </div>
    </div>
  );
}

const MEALS = [
  { name: 'Oats and berries', kind: 'Breakfast', carbs: '46g', time: '07:58' },
  { name: 'Chicken wrap', kind: 'Lunch', carbs: '38g', time: '12:41' },
  { name: 'Pasta night', kind: 'Dinner', carbs: '74g', time: '19:24' },
];

function MealsVisual() {
  return (
    <ul className="viz-meals">
      {MEALS.map((meal, i) => (
        <motion.li
          key={meal.name}
          initial={{ opacity: 0, x: 22 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.35 + i * 0.14, duration: 0.55, ease }}
        >
          <span className="viz-meal-kind">{meal.kind}</span>
          <div>
            <strong>{meal.name}</strong>
            <em>{meal.time}</em>
          </div>
          <b>{meal.carbs}</b>
        </motion.li>
      ))}
    </ul>
  );
}

function InsulinVisual() {
  return (
    <div className="viz-insulin">
      <div className="viz-segments" aria-hidden="true">
        <span className="is-active">Bolus</span>
        <span>Basal</span>
        <span>Correction</span>
      </div>
      <div className="viz-dose">
        <span className="viz-label">Units</span>
        <div className="viz-dose-value">
          <i>−</i><strong>5.5</strong><i>+</i>
        </div>
      </div>
      <div className="viz-dose-meta">Humalog · with dinner</div>
    </div>
  );
}

function PatternVisual() {
  return (
    <div className="viz-patterns">
      <motion.div
        className="viz-insight viz-insight--warn"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ delay: 0.4, duration: 0.5, ease }}
      >
        <strong>Post-dinner rise, 4 of 7 nights</strong>
        <em>The climb starts about 40 minutes after eating.</em>
      </motion.div>
      <motion.div
        className="viz-insight"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ delay: 0.55, duration: 0.5, ease }}
      >
        <strong>Mornings hold steady</strong>
        <em>Most of the 6 am – noon window stays inside target.</em>
      </motion.div>
    </div>
  );
}

function SettingsVisual() {
  return (
    <div className="viz-settings">
      <div className="viz-toggle" aria-hidden="true">
        <span className="is-active">mg/dL</span>
        <span>mmol/L</span>
      </div>
      <div className="viz-setting-row">
        <span>Target</span>
        <div className="viz-stepper"><i>−</i><strong>110</strong><i>+</i></div>
      </div>
      <div className="viz-setting-row">
        <span>High threshold</span>
        <div className="viz-stepper"><i>−</i><strong>180</strong><i>+</i></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-head">
          <motion.p
            className="text-kicker"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            Everything from your logbook,
            <em> none of the noise.</em>
          </motion.h2>
        </div>

        <div className="bento">
          <Card
            area="trend"
            icon={TrendingUp}
            title="Glucose trends"
            copy="A focused 24-hour view with your target band always visible — averages and GMI context, without chart clutter."
            index={0}
          >
            <TrendVisual />
          </Card>

          <Card
            area="meals"
            icon={UtensilsCrossed}
            title="Meal logging"
            copy="Carbs, timing, and what you actually ate — grouped by day so the story reads top to bottom."
            index={1}
          >
            <MealsVisual />
          </Card>

          <Card
            area="insulin"
            icon={Syringe}
            title="Insulin tracking"
            copy="Bolus, basal, or correction in three taps, with brand and site noted for later review."
            index={2}
          >
            <InsulinVisual />
          </Card>

          <Card
            area="patterns"
            icon={Radar}
            title="Pattern review"
            copy="Recurring highs and steady stretches surface on their own — observations, never dosing advice."
            index={3}
          >
            <PatternVisual />
          </Card>

          <Card
            area="settings"
            icon={SlidersHorizontal}
            title="Targets and units"
            copy="Your ranges, your units. Settings stay visible as context on every chart."
            index={4}
          >
            <SettingsVisual />
          </Card>
        </div>
      </div>
    </section>
  );
}
