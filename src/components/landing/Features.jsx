import {
  Activity,
  AlertTriangle,
  BarChart3,
  ListChecks,
  SlidersHorizontal,
  Syringe,
} from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import './Features.css';

const features = [
  {
    icon: ListChecks,
    title: 'Meal Logging',
    description: 'Review recent meals with logged carbs and timestamps in the same structure as the phone preview.',
    preview: 'meal',
  },
  {
    icon: Syringe,
    title: 'Insulin Tracking',
    description: 'Record bolus, basal, or correction doses without the assistant bubble covering the form.',
    preview: 'insulin',
  },
  {
    icon: BarChart3,
    title: 'Glucose Trends',
    description: 'Scan glucose averages, GMI context, and the last 24 hours from a focused chart view.',
    preview: 'glucose',
  },
  {
    icon: SlidersHorizontal,
    title: 'Settings Review',
    description: 'Keep units and target ranges visible as review context, not dosing recommendations.',
    preview: 'settings',
  },
  {
    icon: Activity,
    title: 'Daily Overview',
    description: "See today's glucose, carbs, insulin, time-in-range, and A1C context in one dashboard.",
    preview: 'overview',
  },
  {
    icon: AlertTriangle,
    title: 'Pattern Review',
    description: 'Surface recurring highs, lows, and calmer baselines from your demo timeline.',
    preview: 'pattern',
  },
];

function FeaturePreview({ type }) {
  if (type === 'meal') {
    return (
      <div className="feature-preview feature-preview--phone" aria-hidden="true">
        <PreviewTopBar />
        <PreviewTitle title="Meals" subtitle="A day-by-day view of recent carbs." />
        <p className="preview-kicker">Today</p>
        <PreviewListRow tone="gold" title="Breakfast" meta="Logged meal" value="45g" time="17:01" />
        <PreviewListRow tone="violet" title="Dinner" meta="Logged meal" value="85g" time="02:01" />
      </div>
    );
  }

  if (type === 'insulin') {
    return (
      <div className="feature-preview feature-preview--form" aria-hidden="true">
        <h4>Log insulin dose</h4>
        <div className="preview-segments">
          <span className="is-active">Bolus</span>
          <span>Basal</span>
          <span>Correction</span>
        </div>
        <PreviewField label="Units (u)" />
        <PreviewField label="Brand (optional)" value="e.g. Humalog" />
        <PreviewField label="Note" value="Dose reason, timing, site..." multiline />
        <button type="button" tabIndex={-1}>Save dose</button>
      </div>
    );
  }

  if (type === 'glucose') {
    return (
      <div className="feature-preview feature-preview--phone" aria-hidden="true">
        <PreviewTopBar />
        <div className="preview-stat-grid">
          <PreviewMetric label="Avg glucose" value="139" unit="mg/dL" />
          <PreviewMetric label="GMI" value="6.5" unit="%" />
        </div>
        <div className="preview-section-title">
          <h4>Trend</h4>
          <span>Last 24H</span>
        </div>
        <div className="preview-chart-card">
          <svg viewBox="0 0 220 82" preserveAspectRatio="none">
            <path d="M0 28 L12 31 L20 48 L34 62 L47 59 L59 66 L73 57 L88 55 L102 42 L113 30 L126 36 L139 33 L151 45 L164 27 L178 31 L192 35 L204 50 L220 29" />
          </svg>
        </div>
      </div>
    );
  }

  if (type === 'settings') {
    return (
      <div className="feature-preview feature-preview--phone" aria-hidden="true">
        <PreviewTopBar />
        <PreviewTitle title="Settings" subtitle="Guest session" />
        <div className="preview-settings-card">
          <strong>Glucose targets</strong>
          <div className="preview-toggle">
            <span className="is-active">mg/dL</span>
            <span>mmol/L</span>
          </div>
          <div className="preview-stepper-row">
            <PreviewStepper label="Target glucose" value="110" />
            <PreviewStepper label="High threshold" value="180" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'overview') {
    return (
      <div className="feature-preview feature-preview--phone" aria-hidden="true">
        <PreviewTopBar />
        <PreviewTitle title="Good evening, guest" subtitle="Here is your daily snapshot." />
        <div className="preview-current-card">
          <span>Current</span>
          <strong>168 <small>mg/dL</small></strong>
          <em>In range</em>
        </div>
        <div className="preview-mini-grid">
          <PreviewMetric label="Today's carbs" value="130" unit="g" />
          <PreviewMetric label="Last insulin" value="4.5" unit="u" />
          <PreviewMetric label="Time in range" value="100" unit="%" />
          <PreviewMetric label="A1C est." value="6.5" unit="%" />
        </div>
      </div>
    );
  }

  return (
    <div className="feature-preview feature-preview--phone feature-preview--pattern" aria-hidden="true">
      <PreviewListRow tone="gold" title="Post-dinner rise detected" meta="Your demo timeline shows a glucose climb after dinner." />
      <PreviewListRow tone="teal" title="Morning range looks steady" meta="The guest dataset spends most of the morning inside target." />
    </div>
  );
}

function PreviewTopBar() {
  return (
    <div className="preview-topbar">
      <span>G</span>
      <strong>Glucose</strong>
      <i />
    </div>
  );
}

function PreviewTitle({ title, subtitle }) {
  return (
    <div className="preview-title">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
  );
}

function PreviewListRow({ tone, title, meta, value, time }) {
  return (
    <div className={`preview-list-row preview-list-row--${tone}`}>
      <span />
      <div>
        <strong>{title}</strong>
        <p>{meta}</p>
      </div>
      {value && (
        <em>
          {value}
          <small>{time}</small>
        </em>
      )}
    </div>
  );
}

function PreviewField({ label, value, multiline }) {
  return (
    <label className="preview-field">
      <span>{label}</span>
      <i className={multiline ? 'is-tall' : ''}>{value}</i>
    </label>
  );
}

function PreviewMetric({ label, value, unit }) {
  return (
    <div className="preview-metric">
      <span>{label}</span>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
    </div>
  );
}

function PreviewStepper({ label, value }) {
  return (
    <div className="preview-stepper">
      <span>{label}</span>
      <div>
        <i>-</i>
        <strong>{value}</strong>
        <i>+</i>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <ScrollReveal>
          <p className="text-subheading features-label">Features</p>
          <h2 className="features-title text-display">
            A preview toolkit for<br />
            <em>logging and pattern review.</em>
          </h2>
        </ScrollReveal>

        <div className="features-grid">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08}>
              <div className="feature-card">
                <div className="feature-card-copy">
                  <div className="feature-icon">
                    <feature.icon size={18} strokeWidth={2} />
                  </div>
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-desc">{feature.description}</p>
                </div>
                <FeaturePreview type={feature.preview} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
