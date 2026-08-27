import { motion } from 'framer-motion';
import { Bot, Eye, NotebookPen, RotateCcw, ShieldCheck } from 'lucide-react';

const ease = [0.23, 1, 0.32, 1];

const TOOLS = [
  {
    icon: Eye,
    name: 'get_demo_state',
    badge: 'Read-only',
    badgeTone: 'read',
    copy: 'Returns a factual snapshot of the synthetic demo — current glucose, time in range, today\'s totals, and recent entries — with a safety boundary attached to every response.',
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
            Built for the WebMCP challenge
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            An agent can log alongside you,
            <em> right in the browser.</em>
          </motion.h2>
          <motion.p
            className="webmcp-lede"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.16, duration: 0.65, ease }}
          >
            Betatrace registers three tools with the page itself, using the native{' '}
            <code>document.modelContext.registerTool()</code> API — no server, no polyfill. A
            WebMCP-aware agent can read and log to the exact same guest demo you see on screen,
            and the dashboard updates the moment it does.
          </motion.p>
        </div>

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
      </div>
    </section>
  );
}
