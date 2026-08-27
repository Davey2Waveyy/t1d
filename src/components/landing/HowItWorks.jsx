import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { PencilLine, ScanSearch, MessagesSquare } from 'lucide-react';

const ease = [0.23, 1, 0.32, 1];

const STEPS = [
  {
    icon: PencilLine,
    title: 'Log as you go',
    copy: 'Meals, insulin doses, and glucose readings land in one place. Each entry takes a few seconds, so logging survives real life.',
  },
  {
    icon: ScanSearch,
    title: 'Review the shape of your week',
    copy: 'Trends, time-in-range balance, and day-by-day meal views turn scattered numbers into something you can actually read.',
  },
  {
    icon: MessagesSquare,
    title: 'Bring better questions to your care team',
    copy: 'Walk into appointments with concrete patterns — “I rise after dinner most nights” — instead of trying to remember the month.',
  },
];

export default function HowItWorks() {
  const listRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 0.75', 'end 0.55'],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section className="how" id="how-it-works">
      <div className="container how-inner">
        <div className="how-head">
          <motion.p
            className="text-kicker"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.65, ease }}
          >
            Log the day.
            <em> Review the week.</em>
          </motion.h2>
          <motion.p
            className="how-lede"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.16, duration: 0.65, ease }}
          >
            Record meals, insulin, and glucose as they happen. When you review
            the week, the full timeline is already there.
          </motion.p>
        </div>

        <div className="how-steps" ref={listRef}>
          <div className="how-line" aria-hidden="true">
            <motion.span style={{ scaleY: lineScale }} />
          </div>
          {STEPS.map((step, i) => (
            <motion.article
              key={step.title}
              className="how-step"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-90px' }}
              transition={{ delay: i * 0.06, duration: 0.65, ease }}
            >
              <div className="how-step-marker">
                <span className="how-step-num">0{i + 1}</span>
                <span className="how-step-icon"><step.icon size={17} strokeWidth={2.2} /></span>
              </div>
              <div className="how-step-body">
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
