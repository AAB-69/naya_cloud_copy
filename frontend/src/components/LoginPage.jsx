import React, { useState } from 'react';
import { User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import NayatelLogo from './NayatelLogo';
import { loginUser } from '../services/api';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(username.trim(), password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {/* Top Header with Brand Logo */}
      <div className="auth-header-top">
        <NayatelLogo />
      </div>

      <div className="auth-form-content">
        <h1 className="auth-heading">Login to your account</h1>
        <p className="auth-subheading">
          Not a member?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate('register')}
          >
            Create account
          </button>
        </p>

        {/* Error notification banner */}
        {error && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Username Field */}
          <div className="input-group">
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              autoComplete="username"
              required
            />
            <span className="input-icon-right">
              <User size={18} />
            </span>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-icon-right action-icon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password-row">
            <button
              type="button"
              className="forgot-link"
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-content">
                <Loader2 size={18} className="spinner" />
                <span>Logging in...</span>
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer info & Links */}
        <p className="legal-terms">
          Read our{' '}
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              alert('Nayatel Cloud Terms and Conditions agreement.');
            }}
          >
            Terms and Conditions
          </a>{' '}
          or{' '}
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              alert('Nayatel Cloud Privacy Policy.');
            }}
          >
            Privacy Policy
          </a>
          .
        </p>

        {/* Divider */}
        <div className="divider-row">
          <span className="divider-line" />
          <span className="divider-text">OR</span>
          <span className="divider-line" />
        </div>

        {/* Website Link */}
        <div className="bottom-link-row">
          Visit the{' '}
          <a
            href="https://nayatel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="external-site-link"
          >
            website.
          </a>
        </div>
      </div>
    </div>
  );
}
