import { TrendingUp, Utensils, Syringe, BarChart3, Upload, Brain, AlertTriangle, Target, Gauge, Settings } from 'lucide-react';
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
    icon: Brain,
    title: 'ICR Predictor',
    description: 'AI-powered insulin-to-carb ratio predictions based on your personal meal and dosing history.',
    color: 'violet',
  },
  {
    icon: BarChart3,
    title: 'Glucose Trends',
    description: 'Interactive charts with zoomable time ranges. See your time-in-range, standard deviation, and more.',
    color: 'emerald',
  },
  {
    icon: Upload,
    title: 'Dexcom Import',
    description: 'Import your CGM data directly from Dexcom Clarity. Seamless integration with your continuous monitor.',
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
  {
    icon: Gauge,
    title: 'Correction Factor',
    description: 'Calculate and track your insulin sensitivity factor by time of day for precision dosing.',
    color: 'sky',
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
