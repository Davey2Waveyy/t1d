import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Footer from '../components/landing/Footer';
import LoginModal from '../components/auth/LoginModal';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <a href="#" className="landing-logo">
            <Activity size={22} />
            <span>Betatrace</span>
          </a>

          <div className={`landing-nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="https://github.com/Davey2Waveyy/t1d" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>GitHub</a>
            <button className="btn btn-ghost" onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}>Get Started</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <Hero onGetStarted={() => setShowLogin(true)} />
      <Features />
      <HowItWorks />
      <Footer />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}
