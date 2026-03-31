import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const validateForm = () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (isSignUp && !formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    setError('');
    setMessage('');

    // Validate before proceeding
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }
    console.log('Validation passed, proceeding...');

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.name
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data?.user) {
          setMessage('Check your email for the confirmation link!');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        const { data, error: signInError } = await signIn({
          email: formData.email,
          password: formData.password
        });

        if (signInError) {
          setError(signInError.message);
        } else if (data?.user) {
          onClose();
          navigate('/dashboard');
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('Google sign in clicked');
    setError('');
    setLoading(true);

    try {
      const { error: googleError } = await signInWithGoogle();

      if (googleError) {
        console.error('Google sign in error:', googleError);
        setError(googleError.message);
        setLoading(false);
      }
      // If successful, Supabase will redirect to Google
      // Don't set loading to false here as we're redirecting
    } catch (err) {
      console.error('Google auth error:', err);
      setError('Failed to connect to Google. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setMessage('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
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

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {message && (
          <div className="modal-success">
            {message}
          </div>
        )}

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
                  disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg modal-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="modal-divider">
          <span>or</span>
        </div>

        <div className="modal-social">
          <button className="btn-social" type="button" onClick={handleGoogleSignIn} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>

        <div className="modal-toggle">
          {isSignUp ? (
            <p>Already have an account? <button type="button" onClick={toggleMode} disabled={loading}>Sign In</button></p>
          ) : (
            <p>Don't have an account? <button type="button" onClick={toggleMode} disabled={loading}>Sign Up</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
