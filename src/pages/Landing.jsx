import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import WebMcp from '../components/landing/WebMcp';
import Safety from '../components/landing/Safety';
import Faq from '../components/landing/Faq';
import Footer from '../components/landing/Footer';
import LoginModal from '../components/auth/LoginModal';
import '../components/landing/landing.css';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#webmcp', label: 'WebMCP' },
  { href: '#safety', label: 'Safety' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, continueAsGuest, isGuest } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const enterDemo = () => {
    continueAsGuest();
    setShowLogin(false);
    setMenuOpen(false);
    navigate('/dashboard');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', menuOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [menuOpen]);

  // Keep the marketing page reachable in guest mode; only signed-in accounts skip it.
  useEffect(() => {
    if (user && !isGuest) navigate('/dashboard');
  }, [user, isGuest, navigate]);

  if (user && !isGuest) return null;

  return (
    <div className="landing grain">
      <a href="#main" className="skip-link">Skip to content</a>

      <header className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <a href="#hero" className="landing-logo" aria-label="Betatrace home">
            <span className="landing-logo-mark"><Activity size={17} strokeWidth={2.4} /></span>
            <span className="landing-logo-word">Betatrace</span>
          </a>

          <nav className="landing-nav-links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <div className="landing-nav-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setShowLogin(true)}>Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={enterDemo}>Open the demo</button>
          </div>

          <button
            className="landing-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="landing-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="landing-menu-top">
              <span className="landing-logo">
                <span className="landing-logo-mark"><Activity size={17} strokeWidth={2.4} /></span>
                <span className="landing-logo-word">Betatrace</span>
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="landing-menu-btn">
                <X size={22} />
              </button>
            </div>
            <nav className="landing-menu-links" aria-label="Menu">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="landing-menu-actions"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <button className="btn btn-glass btn-lg" onClick={() => { setShowLogin(true); setMenuOpen(false); }}>
                Sign in
              </button>
              <button className="btn btn-primary btn-lg" onClick={enterDemo}>Open the demo</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main">
        <Hero onOpenDemo={enterDemo} />
        <Features />
        <HowItWorks />
        <WebMcp onOpenDemo={enterDemo} />
        <Safety />
        <Faq />
      </main>

      <Footer onOpenDemo={enterDemo} />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onContinue={enterDemo}
      />
    </div>
  );
}
