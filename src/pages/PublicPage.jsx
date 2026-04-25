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
    title: 'A clear overview of what Betatrace is building.',
    intro:
      'Betatrace is a Type 1 diabetes tracking project focused on helping people log meals, insulin, and glucose data in one place while surfacing patterns that are hard to notice manually.',
    sections: [
      {
        title: 'What the app does',
        copy: [
          'Tracks meals, insulin doses, glucose trends, and user-specific settings in a single dashboard.',
          'Uses Supabase for authentication and user-scoped data so each account sees only its own records.',
          'Includes forecasting and insight-oriented components such as insulin-to-carb ratio guidance, correction factor tools, and pattern alerts.',
        ],
      },
      {
        title: 'Current stack',
        copy: [
          'React 19 and Vite power the frontend, with React Router handling public and protected routes.',
          'Supabase provides auth, persistence, and row-level security for personal health data.',
          'The UI is designed as a polished portfolio-style product surface with a deeper dashboard experience behind it.',
        ],
      },
    ],
    highlights: [
      { label: 'Product', value: 'Type 1 diabetes logging and insights' },
      { label: 'Frontend', value: 'React 19, Vite, React Router' },
      { label: 'Backend', value: 'Supabase auth and database' },
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
          'Signed-in users access their own meals, insulin entries, glucose readings, and preferences through authenticated app flows.',
          'The production bundle for this release avoids asking end users to paste third-party AI or CGM secrets directly into the browser.',
        ],
      },
      {
        title: 'Release posture',
        copy: [
          'Sensitive integrations are being held back until they can be moved behind a safer server-side boundary.',
          'Any future public API would need explicit consent, clear authentication rules, and a data model designed for external access rather than internal app usage.',
        ],
      },
    ],
    highlights: [
      { label: 'Status', value: 'No public API' },
      { label: 'Access', value: 'Authenticated and user-scoped' },
      { label: 'Posture', value: 'Secrets removed from client settings' },
    ],
  },
  changelog: {
    eyebrow: 'Changelog',
    title: 'A quick snapshot of how the project is evolving.',
    intro:
      'This page gives portfolio viewers a lightweight product history so the footer does not dead-end and the project feels actively maintained.',
    sections: [
      {
        title: 'Recent progress',
        copy: [
          'Landing experience refined to better communicate the product story and guide visitors into the dashboard.',
          'Dashboard work is in progress to replace mock data with real saved records and stronger empty states.',
          'Footer and public route wiring now provide complete navigation across product, legal, and contact pages.',
        ],
      },
      {
        title: 'Next focus areas',
        copy: [
          'Deepen real-data flows across meals, insulin, glucose, and settings.',
          'Improve interpretation features so the app offers stronger practical support rather than only logging.',
          'Continue smoothing the marketing-to-dashboard experience for demos, hiring review, and portfolio presentation.',
        ],
      },
    ],
    highlights: [
      { label: 'Phase', value: 'Working prototype' },
      { label: 'Priority', value: 'Real data and stronger UX' },
      { label: 'Audience', value: 'Portfolio reviewers and future users' },
    ],
  },
  privacyPolicy: {
    eyebrow: 'Privacy Policy',
    title: 'This project is designed to respect personal health information.',
    intro:
      'Betatrace is a portfolio project that handles sensitive personal data categories, so the privacy posture should be straightforward even at this stage.',
    sections: [
      {
        title: 'What is collected',
        copy: [
          'Account details needed for sign-in plus any meal, insulin, glucose, or settings data entered by the user.',
          'No claim is made here that the product is a medical service or a HIPAA-compliant production platform.',
          'Visitors using the public landing pages are not asked to submit a contact form or message through the site itself.',
        ],
      },
      {
        title: 'How data is used',
        copy: [
          'User-entered data is used only to power the product experience, including charts, logs, and personalized analysis features.',
          'The project owner does not sell user data or expose it publicly through the marketing site.',
          'Because this is still a project-stage application, users should avoid entering anything they would not want stored in a prototype environment.',
        ],
      },
    ],
    highlights: [
      { label: 'Use', value: 'Product functionality only' },
      { label: 'Sharing', value: 'No sale of personal data' },
      { label: 'Stage', value: 'Portfolio / prototype project' },
    ],
  },
  termsOfService: {
    eyebrow: 'Terms of Service',
    title: 'Betatrace is presented as a portfolio project, not medical advice.',
    intro:
      'These terms set the expectation that the app is an educational and portfolio-oriented software project that should not be treated as clinical guidance.',
    sections: [
      {
        title: 'Use at your own discretion',
        copy: [
          'Betatrace is offered as a software project for demonstration and personal tracking purposes.',
          'Nothing in the app should replace medical advice, treatment planning, or clinician guidance.',
          'Users remain responsible for any insulin, carb, or treatment decisions they make.',
        ],
      },
      {
        title: 'Project limitations',
        copy: [
          'The app may change, break, or be taken offline as the project evolves.',
          'Feature availability and accuracy are not guaranteed, especially while parts of the product are still under active development.',
          'By using the app, visitors acknowledge that it is a personal project rather than a regulated medical platform.',
        ],
      },
    ],
    highlights: [
      { label: 'Purpose', value: 'Portfolio and educational use' },
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
