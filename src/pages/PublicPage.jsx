import { Activity, ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/landing/Footer';
import './PublicPage.css';

const iconMap = {
  email: Mail,
  external: ExternalLink,
};

const publicPageContent = {
  documentation: {
    eyebrow: 'Documentation',
    title: 'A clear overview of the Betatrace preview demo.',
    intro:
      'Betatrace is a Type 1 diabetes logging preview focused on meals, insulin, glucose, settings, and personal pattern review. It is not medical advice, diagnosis, treatment planning, or an emergency tool.',
    sections: [
      {
        title: 'What the preview does',
        copy: [
          'Lets visitors explore a guest demo for logging meals, insulin doses, glucose readings, and settings in a phone-framed dashboard.',
          'Keeps guest demo entries on the current device so the preview can work even when account sync is unavailable.',
          'Surfaces trend views and review context without giving insulin dosing advice, treatment recommendations, or clinical decision support.',
        ],
      },
      {
        title: 'Current stack',
        copy: [
          'React 19 and Vite power the frontend, with React Router handling public and protected routes.',
          'Supabase is wired for beta account sync, but the guest demo is designed to remain usable if the backend is missing or unreachable.',
          'The UI is designed as a publishable preview surface with a deeper dashboard experience behind it.',
        ],
      },
    ],
    highlights: [
      { label: 'Product', value: 'T1D logging preview demo' },
      { label: 'Frontend', value: 'React 19, Vite, React Router' },
      { label: 'Sync', value: 'Supabase beta, guest mode first' },
    ],
  },
  apiReference: {
    eyebrow: 'Security',
    title: 'Public access is intentionally narrow in this release.',
    intro:
      'Betatrace does not publish a developer API in this release. The app is focused on authenticated product access, user-scoped records, and a smaller public surface area.',
    sections: [
      {
        title: 'Current access model',
        copy: [
          'Public visitors can browse the landing, documentation, legal, changelog, and contact pages without creating an account.',
          'Guest visitors can enter the dashboard demo and store preview entries locally on their current device.',
          'Signed-in account sync is beta and should not be treated as guaranteed storage until the backend connection is verified.',
          'The challenge experience uses synthetic data and does not require third-party service credentials.',
        ],
      },
      {
        title: 'Release posture',
        copy: [
          'Sensitive integrations are being held back until they can be moved behind a safer server-side boundary.',
          'Any future public API would need explicit consent, clear authentication rules, and a data model designed for external access rather than internal app usage.',
          'Betatrace does not provide medical advice, treatment recommendations, insulin dosing instructions, or emergency support.',
        ],
      },
    ],
    highlights: [
      { label: 'Status', value: 'No public API' },
      { label: 'Access', value: 'Guest demo plus beta sync' },
      { label: 'Posture', value: 'No client-side third-party secrets' },
    ],
  },
  changelog: {
    eyebrow: 'Changelog',
    title: 'A quick snapshot of how the project is evolving.',
    intro:
      'This page gives preview visitors a lightweight product history so the footer does not dead-end and the project feels actively maintained.',
    sections: [
      {
        title: 'Recent progress',
        copy: [
          'Landing experience refined to communicate Betatrace as a preview demo for personal logging and pattern review.',
          'Dashboard work now prioritizes a reliable guest demo, local entries, and account sync that fails gracefully.',
          'Footer and public route wiring provide complete navigation across product, legal, and contact pages.',
        ],
      },
      {
        title: 'Next focus areas',
        copy: [
          'Keep guest mode predictable across meals, insulin, glucose, settings, and preview notices.',
          'Diagnose Supabase configuration before expanding account sync.',
          'Continue smoothing the marketing-to-dashboard experience for demos, hiring review, and public preview use.',
        ],
      },
    ],
    highlights: [
      { label: 'Phase', value: 'Preview demo' },
      { label: 'Priority', value: 'Reliable guest mode' },
      { label: 'Audience', value: 'Preview visitors and future users' },
    ],
  },
  privacyPolicy: {
    eyebrow: 'Privacy Policy',
    title: 'This preview is designed to treat health information carefully.',
    intro:
      'Betatrace handles sensitive personal data categories when visitors enter health-related information, so the preview posture should stay straightforward and cautious.',
    sections: [
      {
        title: 'What is collected',
        copy: [
          'Guest demo entries may include meal, insulin, glucose, and settings data stored on the current device.',
          'Account details and synced records may be stored only when account sync is configured and a visitor chooses to sign in.',
          'No claim is made here that the product is a medical service or a HIPAA-compliant production platform.',
          'Visitors using the public landing pages are not asked to submit a contact form or message through the site itself.',
        ],
      },
      {
        title: 'How data is used',
        copy: [
          'User-entered data is used only to power the preview experience, including charts, logs, and pattern review surfaces.',
          'The project owner does not sell user data or expose it publicly through the marketing site.',
          'Because this is still a project-stage application, users should avoid entering anything they would not want stored in a prototype environment.',
        ],
      },
    ],
    highlights: [
      { label: 'Use', value: 'Product functionality only' },
      { label: 'Sharing', value: 'No sale of personal data' },
      { label: 'Stage', value: 'Preview demo' },
    ],
  },
  termsOfService: {
    eyebrow: 'Terms of Service',
    title: 'Betatrace is a preview demo, not medical advice.',
    intro:
      'These terms set the expectation that the app is a preview for personal logging and pattern review. It should not be treated as clinical guidance.',
    sections: [
      {
        title: 'Use at your own discretion',
        copy: [
          'Betatrace is offered as a software preview for demonstration and personal tracking purposes.',
          'Nothing in the app should replace medical advice, treatment planning, insulin dosing instructions, or clinician guidance.',
          'Users remain responsible for any insulin, carbohydrate, emergency, or treatment decisions they make.',
        ],
      },
      {
        title: 'Project limitations',
        copy: [
          'The app may change, break, or be taken offline as the project evolves.',
          'Guest mode and account sync may behave differently while the backend and release path are still being verified.',
          'By using the app, visitors acknowledge that it is a preview demo rather than a regulated medical platform.',
        ],
      },
    ],
    highlights: [
      { label: 'Purpose', value: 'Preview and personal logging' },
      { label: 'Advice', value: 'Not medical guidance' },
      { label: 'Availability', value: 'Best effort, may change' },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'The best way to reach the developer behind Betatrace.',
    intro:
      'This project is part product prototype, part portfolio piece, so the contact page stays simple: direct links to the channels that actually reach the developer.',
    sections: [
      {
        title: 'What to use each channel for',
        copy: [
          'Email is best for hiring conversations, collaboration, or thoughtful product feedback.',
          'GitHub is the best place to explore the codebase and review ongoing technical work.',
          'LinkedIn is the easiest way to connect professionally and learn more about the builder behind the project.',
        ],
      },
      {
        title: 'Messaging approach',
        copy: [
          'This site does not collect messages directly through a backend contact form.',
          'All contact actions route to external channels so the page stays lightweight and trustworthy.',
        ],
      },
    ],
    highlights: [
      {
        label: 'Email',
        value: 'davdancil@gmail.com',
        href: 'mailto:davdancil@gmail.com',
        icon: 'email',
      },
      {
        label: 'GitHub',
        value: 'github.com/Davey2Waveyy/t1d',
        href: 'https://github.com/Davey2Waveyy/t1d',
        icon: 'external',
      },
      {
        label: 'LinkedIn',
        value: 'linkedin.com/in/david-cilliers/',
        href: 'https://linkedin.com/in/david-cilliers/',
        icon: 'external',
      },
    ],
  },
};

function HighlightLink({ item }) {
  const Icon = iconMap[item.icon] ?? ArrowUpRight;

  if (!item.href) {
    return (
      <div className="public-page-highlight">
        <span className="public-page-highlight-label">{item.label}</span>
        <strong>{item.value}</strong>
      </div>
    );
  }

  return (
    <a
      className="public-page-highlight public-page-highlight--link"
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      <span className="public-page-highlight-label">{item.label}</span>
      <strong>{item.value}</strong>
      <Icon size={16} />
    </a>
  );
}

export default function PublicPage({ pageKey }) {
  const page = publicPageContent[pageKey];

  if (!page) {
    return null;
  }

  return (
    <div className="public-page">
      <header className="public-page-header">
        <div className="container public-page-header-inner">
          <Link to="/" className="public-page-logo">
            <Activity size={20} />
            <span>Betatrace</span>
          </Link>

          <div className="public-page-header-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <a href="https://github.com/Davey2Waveyy/t1d" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="public-page-main">
        <div className="container">
          <section className="public-page-hero">
            <p className="text-subheading">{page.eyebrow}</p>
            <h1 className="public-page-title">{page.title}</h1>
            <p className="public-page-intro">{page.intro}</p>
          </section>

          <div className="public-page-grid">
            <div className="public-page-sections">
              {page.sections.map((section) => (
                <section key={section.title} className="public-page-section">
                  <h2>{section.title}</h2>
                  <div className="public-page-copy">
                    {section.copy.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="public-page-sidebar">
              <div className="public-page-sidebar-card">
                <p className="text-subheading">Quick Links</p>
                <div className="public-page-highlights">
                  {page.highlights.map((item) => (
                    <HighlightLink key={`${item.label}-${item.value}`} item={item} />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
