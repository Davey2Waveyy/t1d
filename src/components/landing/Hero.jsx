import { useState, useEffect } from 'react';
import { ArrowRight, Activity } from 'lucide-react';
import heroImg from '../../assets/hero.png';
import './Hero.css';

export default function Hero({ onGetStarted }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <section className="hero" id="hero">
      {/* Animated glucose curve background */}
      <div className="hero-bg">
        <svg className="hero-glucose-curve" viewBox="0 0 1440 400" preserveAspectRatio="none"
          style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -10}px)` }}>
          <defs>
            <linearGradient id="glucoseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DD4A8" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#2DD4A8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DD4A8" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#2DD4A8" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d="M0,280 C120,260 180,180 300,200 C420,220 480,120 600,140 C720,160 780,100 900,80 C1020,60 1080,160 1200,180 C1320,200 1380,140 1440,160"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
          />
          <path
            d="M0,280 C120,260 180,180 300,200 C420,220 480,120 600,140 C720,160 780,100 900,80 C1020,60 1080,160 1200,180 C1320,200 1380,140 1440,160 L1440,400 L0,400 Z"
            fill="url(#glucoseGrad)"
          />
          {/* Second wave */}
          <path
            d="M0,320 C160,300 240,220 400,250 C560,280 640,180 800,200 C960,220 1040,150 1200,130 C1360,110 1400,180 1440,200"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </svg>
        {/* Floating orbs */}
        <div className="hero-orb hero-orb-1" style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 20}px)` }} />
        <div className="hero-orb hero-orb-2" style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * 25}px)` }} />
        <div className="hero-orb hero-orb-3" style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * -15}px)` }} />
      </div>

      <div className="hero-content container">
        <div className="hero-copy">
          <div className="hero-badge animate-fade-in-up">
            <Activity size={14} />
            <span>Intelligent T1D Management</span>
          </div>

          <h1 className="hero-title animate-fade-in-up stagger-1">
            Take control of<br />
            <span className="hero-title-accent">your Type 1.</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up stagger-2">
            Betatrace uses your meal and insulin data to build predictive models,
            optimize your insulin-to-carb ratio, and surface patterns you'd never spot alone.
          </p>

          <div className="hero-actions animate-fade-in-up stagger-3">
            <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
              Get Started
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See Features
            </button>
          </div>

          <div className="hero-stats animate-fade-in-up stagger-4">
            <div className="hero-stat">
              <span className="hero-stat-value">72%</span>
              <span className="hero-stat-label">Avg Time in Range</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">6.4</span>
              <span className="hero-stat-label">Est. A1C</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">1:10</span>
              <span className="hero-stat-label">Predicted ICR</span>
            </div>
          </div>
        </div>

        <div className="hero-mockup animate-fade-in-up stagger-3">
          <div className="hero-phone">
            <div className="hero-phone-notch" />
            <div className="hero-phone-screen">
              <img src={heroImg} alt="Betatrace app screenshot" />
            </div>
            <div className="hero-phone-home" />
          </div>
        </div>
      </div>
    </section>
  );
}
