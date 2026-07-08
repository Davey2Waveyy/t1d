import { motion } from 'framer-motion';
import { Stethoscope, HardDrive, Ban } from 'lucide-react';

const ease = [0.23, 1, 0.32, 1];

const PRINCIPLES = [
  {
    icon: Ban,
    title: 'Not medical advice',
    copy: 'Betatrace is a logging and review tool. It never suggests doses, corrections, or treatment changes — and the assistant is built to refuse if asked.',
  },
  {
    icon: HardDrive,
    title: 'Demo data stays on your device',
    copy: 'Guest mode keeps every entry in your browser’s local storage. Nothing is uploaded, tracked, or shared. Clearing your browser data removes it completely.',
  },
  {
    icon: Stethoscope,
    title: 'Made to support your care team',
    copy: 'The goal is a clearer conversation at your next appointment — your prescribed care plan always comes first.',
  },
];

export default function Safety() {
  return (
    <section className="safety" id="safety">
      <div className="container safety-inner">
        <div className="safety-head">
          <motion.p
            className="text-kicker"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
          >
            Safety first
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            Boring by design,
            <em> where it matters.</em>
          </motion.h2>
        </div>

        <div className="safety-list">
          {PRINCIPLES.map((principle, i) => (
            <motion.article
              key={principle.title}
              className="safety-item"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ delay: i * 0.09, duration: 0.65, ease }}
            >
              <span className="safety-icon"><principle.icon size={18} strokeWidth={2} /></span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </motion.article>
          ))}
        </div>

        <motion.p
          className="safety-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          If you are experiencing a medical emergency, call your local emergency
          number. Betatrace is a preview demo and is not an emergency tool.
        </motion.p>
      </div>
    </section>
  );
}
