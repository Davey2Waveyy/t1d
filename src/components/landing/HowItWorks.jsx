import { ClipboardList, BarChart3, Zap } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Log',
    description: 'Log meals, insulin doses, and glucose readings in one place so your day is easy to review later.',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Review',
    description: 'Betatrace organizes your entries into trend views, summaries, and settings context that are easier to scan.',
  },
  {
    number: '03',
    icon: Zap,
    title: 'Prepare',
    description: 'Use those patterns to prepare better questions for your care team while following your prescribed care plan.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <ScrollReveal>
          <p className="text-subheading">How It Works</p>
          <h2 className="hiw-title text-display">
            Three steps to<br />
            <em>a calmer review.</em>
          </h2>
        </ScrollReveal>

        <div className="hiw-steps">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <div className="hiw-step">
                <div className="hiw-step-number">{step.number}</div>
                <div className="hiw-step-icon">
                  <step.icon size={28} />
                </div>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.description}</p>
                {i < steps.length - 1 && <div className="hiw-step-connector" />}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
