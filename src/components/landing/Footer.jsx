import { Activity, ExternalLink, Mail, Heart } from 'lucide-react';
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
              Built for Type 1 Diabetics, by someone who gets it.<br />
              Named after beta cells — the ones we're missing.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4 className="footer-col-title">Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#" >Dashboard</a>
              <a href="#" >Changelog</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Connect</h4>
              <a href="https://github.com/Davey2Waveyy/t1d" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> GitHub
              </a>
              <a href="#">
                <Mail size={14} /> Contact
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
