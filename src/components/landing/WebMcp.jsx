import { motion } from 'framer-motion';
import { ArrowRight, Bot, Eye, NotebookPen, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import GlucoseChart from '../v2/charts/GlucoseChart';
import { mockGlucoseReadings, mockMeals } from '../../lib/mockData';

const ease = [0.23, 1, 0.32, 1];

const TOOLS = [
  {
    icon: Eye,
    name: 'get_demo_state',
    badge: 'Read-only',
    badgeTone: 'read',
    copy: 'Returns the current synthetic snapshot or the complete chronological seven-day glucose history with every aligned meal, including timestamps and provenance for descriptive pattern review.',
  },
  {
    icon: NotebookPen,
    name: 'log_demo_entry',
    badge: 'Combined write',
    badgeTone: 'write',
    copy: 'Logs a glucose reading, a meal, and an insulin dose you say already happened, in one call. Validated the same way the manual forms are — it never calculates or recommends a dose.',
  },
  {
    icon: RotateCcw,
    name: 'reset_demo_data',
    badge: 'Requires confirm',
    badgeTone: 'confirm',
    copy: 'Clears every agent- and human-added demo entry and restores the seeded sample data. Requires an explicit confirm — it never runs silently.',
  },
];

const SEVEN_DAY_SAMPLE_SIZE = 336;
const PROOF_READINGS = Array.from({ length: SEVEN_DAY_SAMPLE_SIZE }, (_, index) => {
  const sourceIndex = Math.round((index * (mockGlucoseReadings.length - 1)) / (SEVEN_DAY_SAMPLE_SIZE - 1));
  return mockGlucoseReadings[sourceIndex];
});
const PROOF_STATS = `${PROOF_READINGS.length} readings · ${mockMeals.length} meals`;

function WebMcpProof() {
  return (
    <motion.div
      className="webmcp-proof"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ delay: 0.18, duration: 0.7, ease }}
    >
      <div className="webmcp-proof-prompt">
        <span className="webmcp-proof-label">
          <Sparkles size={14} strokeWidth={1.8} />
          Ask Betatrace
        </span>
        <blockquote>“Graph my last seven days and mark my meals.”</blockquote>
        <p>
          The agent reads the same synthetic guest demo that powers the dashboard,
          then aligns every meal to the glucose timeline.
        </p>
        <code>get_demo_state({'{ range: "7d" }'})</code>
      </div>

      <div className="webmcp-proof-arrow" aria-hidden="true">
        <ArrowRight size={20} strokeWidth={1.8} />
      </div>

      <div className="webmcp-proof-result">
        <div className="webmcp-proof-result-head">
          <div>
            <span>Seven-day result</span>
            <strong>Glucose + meals, aligned</strong>
          </div>
          <small>{PROOF_STATS}</small>
        </div>
        <div className="webmcp-proof-chart">
          <GlucoseChart
            readings={PROOF_READINGS}
            meals={mockMeals}
            height={250}
          />
        </div>
        <p className="webmcp-proof-caption">
          Meal markers stay attached to their exact timestamps as the week comes into view.
        </p>
      </div>
    </motion.div>
  );
}

export default function WebMcp({ onOpenDemo }) {
  return (
    <section className="webmcp" id="webmcp">
      <div className="container">
        <div className="section-head webmcp-head">
          <motion.p
            className="text-kicker"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
          >
            <Bot size={12} strokeWidth={1.8} />
            Browser-native agent tools
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            Ask for the week.
            <em> See every meal in context.</em>
          </motion.h2>
          <motion.p
            className="webmcp-lede"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.16, duration: 0.65, ease }}
          >
            A WebMCP-aware agent can read and log to the exact same synthetic guest demo you see
            on screen. Ask it to review the week, record what already happened, or restore the
            sample data — and the dashboard reflects the result.
          </motion.p>
        </div>

        <WebMcpProof />

        <motion.div
          className="webmcp-technical-head"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-kicker">How it works in the browser</p>
          <p>
            Betatrace registers three page-native tools with{' '}
            <code>document.modelContext.registerTool()</code> — no server and no polyfill.
          </p>
        </motion.div>

        <div className="webmcp-tools">
          {TOOLS.map((tool, i) => (
            <motion.article
              key={tool.name}
              className="webmcp-tool"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ delay: i * 0.09, duration: 0.65, ease }}
            >
              <div className="webmcp-tool-head">
                <span className="webmcp-tool-name"><tool.icon size={15} strokeWidth={1.8} /> {tool.name}</span>
                <span className={`webmcp-badge webmcp-badge--${tool.badgeTone}`}>{tool.badge}</span>
              </div>
              <p>{tool.copy}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="webmcp-note"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.7, ease }}
        >
          <p>
            <ShieldCheck size={14} strokeWidth={1.8} style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />
            Guest demo only, synthetic data only. These tools never read or write your account —
            they can’t reach Supabase even if asked.
          </p>
          <button className="btn btn-primary btn-sm" onClick={onOpenDemo}>
            Try it in the live demo
          </button>
        </motion.div>

        <p className="webmcp-challenge-note">Originally built for the WebMCP Challenge.</p>
      </div>
    </section>
  );
}
