import { motion } from 'framer-motion';
import { Activity, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ease = [0.23, 1, 0.32, 1];

export default function Footer({ onOpenDemo }) {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <motion.div
          className="footer-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
        >
          <h2>
            Ready to<em> review your week?</em>
          </h2>
          <p>Open the guest demo in your browser. No account or installation required.</p>
          <button className="btn btn-primary btn-lg" onClick={onOpenDemo}>
            Open the live demo
            <span className="btn-orb"><ArrowRight size={15} strokeWidth={2} /></span>
          </button>
        </motion.div>

        <div className="footer-main">
          <div className="footer-brand">
            <span className="landing-logo">
              <span className="landing-logo-mark"><Activity size={17} strokeWidth={2.4} /></span>
              <span className="landing-logo-word">Betatrace</span>
            </span>
            <p>
              A preview demo for Type 1 diabetes logging and pattern review,
              named after the beta cells that produce insulin.
            </p>
          </div>

          <nav className="footer-cols" aria-label="Footer">
            <div className="footer-col">
              <h3>Product</h3>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#ask-beta">Ask Beta</a>
              <Link to="/changelog">Changelog</Link>
            </div>
            <div className="footer-col">
              <h3>Resources</h3>
              <Link to="/documentation">Documentation</Link>
              <a href="https://github.com/Davey2Waveyy/t1d" target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight size={12} strokeWidth={2.4} />
              </a>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-col">
              <h3>Legal</h3>
              <Link to="/privacy-policy">Privacy policy</Link>
              <Link to="/terms-of-service">Terms of service</Link>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Betatrace. Not medical advice.</p>
          <p>Made with care for the T1D community.</p>
        </div>
      </div>
    </footer>
  );
}
