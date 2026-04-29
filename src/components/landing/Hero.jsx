import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import './Hero.css';

// Animated counter hook - counts up when element becomes visible
function useAnimatedCounter(end, duration = 2000, decimals = 0) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;

            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toString();

  return { ref, value: formatted };
}

export default function Hero({ onGetStarted, onContinueAsGuest }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Animated counters for stats
  const { ref: tirRef, value: tirValue } = useAnimatedCounter(72, 2000, 0);
  const { ref: a1cRef, value: a1cValue } = useAnimatedCounter(6.4, 2000, 1);
  const { ref: icrRef, value: icrValue } = useAnimatedCounter(10, 2000, 0);

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
        <ParticleBackground />
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
        <div className="hero-badge animate-fade-in-up">
          <Activity size={14} />
          <span>Preview demo for T1D logging</span>
        </div>
        
        <h1 className="hero-title animate-fade-in-up stagger-1">
          Preview Type 1<br />
          <span className="hero-title-accent">patterns calmly.</span>
        </h1>
        
        <p className="hero-subtitle animate-fade-in-up stagger-2">
          Betatrace brings meals, insulin, and glucose trends into one calmer mobile workspace
          for personal logging, pattern review, and clinician conversations.
        </p>

        <div className="hero-actions animate-fade-in-up stagger-3">
          <button className="btn btn-primary btn-lg" onClick={onGetStarted}>
            Get Started
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-glass btn-lg" onClick={onContinueAsGuest}>
            Explore Guest Demo
          </button>
        </div>

        <div className="hero-stats animate-fade-in-up stagger-4">
          <div className="hero-stat" ref={tirRef}>
            <span className="hero-stat-value">{tirValue}%</span>
            <span className="hero-stat-label">Demo Time in Range</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat" ref={a1cRef}>
            <span className="hero-stat-value">{a1cValue}</span>
            <span className="hero-stat-label">Demo A1C Estimate</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat" ref={icrRef}>
            <span className="hero-stat-value">1:{icrValue}</span>
            <span className="hero-stat-label">Demo Ratio Setting</span>
          </div>
        </div>
      </div>
    </section>
  );
}
