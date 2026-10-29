import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import NayatelLogo from './NayatelLogo';
import { registerUser } from '../services/api';

export default function RegisterPage({ onNavigate, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    company: 'Individual Account',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { full_name, username, email, phone, password, password2 } = formData;

    if (!username.trim() || !email.trim() || !password || !password2) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(formData);
      setSuccess('Account created successfully! Redirecting to Cloud Console...');
      setTimeout(() => {
        onRegisterSuccess(data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {/* Header with Nayatel Cloud Logo */}
      <div className="auth-header-top">
        <NayatelLogo />
      </div>

      <div className="auth-form-content">
        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">
          Already a member?{' '}
          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate('login')}
          >
            Login here
          </button>
        </p>

        {/* Notifications */}
        {error && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert success" role="alert">
            <CheckCircle size={18} className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="input-group">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              autoComplete="name"
            />
            <span className="input-icon-right">
              <User size={18} />
            </span>
          </div>

          {/* Username */}
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username *"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              autoComplete="username"
              required
            />
            <span className="input-icon-right">
              <Shield size={18} />
            </span>
          </div>

          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              autoComplete="email"
              required
            />
            <span className="input-icon-right">
              <Mail size={18} />
            </span>
          </div>

          {/* Phone */}
          <div className="input-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone (e.g. 0300-1234567)"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              autoComplete="tel"
            />
            <span className="input-icon-right">
              <Phone size={18} />
            </span>
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password (min. 6 characters) *"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password2"
              placeholder="Confirm Password *"
              value={formData.password2}
              onChange={handleChange}
              className="form-input"
              autoComplete="new-password"
              required
            />
            <span className="input-icon-right">
              <Lock size={18} />
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-content">
                <Loader2 size={18} className="spinner" />
                <span>Creating Account...</span>
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="legal-terms">
          By signing up, you agree to our{' '}
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              alert('Nayatel Cloud Terms of Service.');
            }}
          >
            Terms and Conditions
          </a>{' '}
          and{' '}
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

        <div className="divider-row">
          <span className="divider-line" />
          <span className="divider-text">OR</span>
          <span className="divider-line" />
        </div>

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
