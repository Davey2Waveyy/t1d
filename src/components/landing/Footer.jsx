import { Activity, ExternalLink, Heart, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <Activity size={24} />
              <span>Betatrace</span>
            </div>
            <p className="footer-tagline">
              A preview demo for Type 1 diabetes logging and pattern review.<br />
              Named after beta cells — the ones we're missing.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4 className="footer-col-title">Product</h4>
              <a href="/#features">Features</a>
              <a href="/#how-it-works">How It Works</a>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/changelog">Changelog</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <Link to="/documentation">Documentation</Link>
              <Link to="/api-reference">Security</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Connect</h4>
              <a href="https://github.com/Davey2Waveyy/t1d" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> GitHub
              </a>
              <a href="https://linkedin.com/in/david-cilliers/" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> LinkedIn
              </a>
              <Link to="/contact">
                <Mail size={14} /> Contact
              </Link>
              <a href="mailto:davdancil@gmail.com">
                <ExternalLink size={14} /> Email
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} Betatrace. All rights reserved.</p>
          <p className="footer-made">
            Made with <Heart size={12} className="footer-heart" /> for the T1D community
          </p>
        </div>
      </div>
    </footer>
  );
}
