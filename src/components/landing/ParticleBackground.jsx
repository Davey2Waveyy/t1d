import { useEffect, useRef, useCallback } from 'react';
import './ParticleBackground.css';

const PARTICLE_COUNT = 50;
const CONNECTION_DISTANCE = 150;
const MOUSE_RADIUS = 200;

// Glucose-themed colors
const COLORS = {
  inRange: { r: 45, g: 212, b: 168 },    // Teal/green - normal glucose
  warning: { r: 251, g: 191, b: 36 },    // Amber - borderline
  outOfRange: { r: 251, g: 113, b: 133 } // Rose - high/low
};

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
    // Start at random positions
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 1;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.02;

    // Assign glucose zone (weighted towards in-range)
    const zone = Math.random();
    if (zone < 0.7) {
      this.color = COLORS.inRange;
    } else if (zone < 0.9) {
      this.color = COLORS.warning;
    } else {
      this.color = COLORS.outOfRange;
    }
  }

  update(mouseX, mouseY, scrollY) {
    // Pulse effect
    this.pulsePhase += this.pulseSpeed;
    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    this.currentRadius = this.radius * pulse;

    // Parallax based on scroll
    const parallaxY = scrollY * 0.1;

    // Mouse interaction
    if (mouseX !== null && mouseY !== null) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        this.vx -= Math.cos(angle) * force * 0.5;
        this.vy -= Math.sin(angle) * force * 0.5;
      }
    }

    // Apply velocity with damping
    this.x += this.vx;
    this.y += this.vy + parallaxY * 0.01;
    this.vx *= 0.98;
    this.vy *= 0.98;

    // Wrap around edges
    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;
  }

  draw(ctx) {
    const { r, g, b } = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentRadius * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
    ctx.fill();
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const scrollRef = useRef(0);
  const animationRef = useRef(null);

  const initParticles = useCallback((canvas) => {
    particlesRef.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(new Particle(canvas));
    }
  }, []);

  const drawConnections = useCallback((ctx, particles) => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;

          // Gradient line between two particle colors
          const c1 = particles[i].color;
          const c2 = particles[j].color;
          const gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${opacity})`);
          gradient.addColorStop(1, `rgba(${c2.r}, ${c2.g}, ${c2.b}, ${opacity})`);

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const { x: mouseX, y: mouseY } = mouseRef.current;

    // Update and draw particles
    particles.forEach(particle => {
      particle.update(mouseX, mouseY, scrollRef.current);
      particle.draw(ctx);
    });

    // Draw connections
    drawConnections(ctx, particles);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawConnections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    // Initial setup
    handleResize();

    // Start animation
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [initParticles, animate]);

  return <canvas ref={canvasRef} className="particle-background" />;
}
