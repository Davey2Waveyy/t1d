import { Utensils, Syringe, BarChart3, Shield, AlertTriangle, Target, Activity, Calculator } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import './Features.css';

const features = [
  {
    icon: Utensils,
    title: 'Meal Logging',
    description: 'Track every meal with detailed carb counts. Build a comprehensive food database tailored to your diet.',
    color: 'teal',
  },
  {
    icon: Syringe,
    title: 'Insulin Tracking',
    description: 'Log bolus, basal, and correction doses. Monitor your daily insulin usage patterns over time.',
    color: 'sky',
  },
  {
    icon: BarChart3,
    title: 'Glucose Trends',
    description: 'Interactive charts with zoomable time ranges. See your time-in-range, standard deviation, and more.',
    color: 'emerald',
  },
  {
    icon: Calculator,
    title: 'Ratio Tools',
    description: 'Review insulin-to-carb and correction guidance using the data you already log in the app.',
    color: 'violet',
  },
  {
    icon: Activity,
    title: 'Daily Overview',
    description: 'See today’s glucose, insulin, carb totals, and recent activity in a single dashboard snapshot.',
    color: 'fuchsia',
  },
  {
    icon: Shield,
    title: 'Private Workspace',
    description: 'Authentication and user-scoped data keep each account focused on its own records and preferences.',
    color: 'amber',
  },
  {
    icon: AlertTriangle,
    title: 'Pattern Detection',
    description: 'Automatically detect recurring highs, lows, and trends. Get actionable recommendations.',
    color: 'rose',
  },
  {
    icon: Target,
    title: 'A1C Estimator',
    description: 'Real-time estimated A1C based on your glucose data. Track your progress over months.',
    color: 'teal',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <ScrollReveal>
          <p className="text-subheading features-label">Features</p>
          <h2 className="features-title text-display">
            Everything you need to<br />
            <em>understand your diabetes.</em>
          </h2>
        </ScrollReveal>
        
        <div className="features-grid">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08}>
              <div className={`feature-card feature-card--${feature.color}`}>
                <div className={`feature-icon feature-icon--${feature.color}`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-desc">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
