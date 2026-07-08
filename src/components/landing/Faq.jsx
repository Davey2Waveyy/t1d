import { motion } from 'framer-motion';

const ease = [0.23, 1, 0.32, 1];

const QA = [
  {
    q: 'Is this a real product?',
    a: 'Betatrace is a working preview demo — the logging, charts, and assistant all function, but it’s a personal project, not a released medical product.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. The demo runs entirely in guest mode. Entries you add are stored in your browser and never leave your device.',
  },
  {
    q: 'Can it tell me how much insulin to take?',
    a: 'No, deliberately. It records what you log and describes patterns. Dosing decisions belong with you and your clinician.',
  },
  {
    q: 'Does it connect to my CGM?',
    a: 'A Nightscout import exists in the demo, and Dexcom import is sketched as a future option. The preview mostly uses generated sample data.',
  },
  {
    q: 'Why “Betatrace”?',
    a: 'Named after beta cells — the ones people with Type 1 are missing. The app traces what they used to handle quietly.',
  },
];

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="container faq-inner">
        <div className="faq-head">
          <motion.p
            className="text-kicker"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
          >
            Questions
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            Asked often,
            <em> answered plainly.</em>
          </motion.h2>
        </div>

        <dl className="faq-list">
          {QA.map((item, i) => (
            <motion.div
              key={item.q}
              className="faq-item"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.05, duration: 0.6, ease }}
            >
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
