import { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2 className="modal-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="modal-subtitle">
            {isSignUp ? 'Start your journey to better glucose management' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  className="form-input"
                  id="auth-name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                className="form-input"
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                className="form-input"
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg modal-submit">
            {isSignUp ? 'Create Account' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="modal-divider">
          <span>or</span>
        </div>

        <div className="modal-social">
          <button className="btn-social" type="button">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button className="btn-social" type="button">
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 0C4.028 0 0 4.028 0 9c0 3.977 2.579 7.35 6.154 8.543.45.083.615-.195.615-.433 0-.213-.008-.78-.012-1.53-2.503.544-3.032-1.206-3.032-1.206-.41-1.04-1-1.317-1-1.317-.816-.558.062-.546.062-.546.902.063 1.377.926 1.377.926.802 1.374 2.104.977 2.616.747.082-.58.314-.977.572-1.201-1.998-.227-4.1-1-4.1-4.448 0-.983.351-1.786.927-2.415-.093-.228-.402-1.143.088-2.382 0 0 .756-.242 2.475.922A8.622 8.622 0 0 1 9 4.37c.765.004 1.534.104 2.253.304 1.718-1.164 2.472-.922 2.472-.922.492 1.24.183 2.154.09 2.382.577.629.926 1.432.926 2.415 0 3.457-2.105 4.218-4.11 4.44.323.278.611.828.611 1.668 0 1.203-.011 2.174-.011 2.47 0 .24.163.52.619.432C15.425 16.346 18 12.974 18 9c0-4.972-4.028-9-9-9z" fill="currentColor"/></svg>
            Continue with GitHub
          </button>
        </div>

        <button className="modal-guest" type="button" onClick={onLogin}>
          Continue as Guest →
        </button>

        <div className="modal-toggle">
          {isSignUp ? (
            <p>Already have an account? <button type="button" onClick={() => setIsSignUp(false)}>Sign In</button></p>
          ) : (
            <p>Don't have an account? <button type="button" onClick={() => setIsSignUp(true)}>Sign Up</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
