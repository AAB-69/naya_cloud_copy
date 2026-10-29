import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import NayatelLogo from './NayatelLogo';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordModal({ onNavigate }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!identifier.trim()) {
      setError('Please enter your username or registered email.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(identifier.trim());
      setMessage(res.message || 'Password reset instructions have been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header-top">
        <NayatelLogo />
      </div>

      <div className="auth-form-content">
        <button
          type="button"
          className="back-button"
          onClick={() => onNavigate('login')}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <h1 className="auth-heading">Reset Password</h1>
        <p className="auth-subheading">
          Enter your username or email address and we will assist you in regaining access.
        </p>

        {error && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="auth-alert success" role="alert">
            <CheckCircle size={18} className="alert-icon" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username or Email address"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="form-input"
              required
            />
            <span className="input-icon-right">
              <Mail size={18} />
            </span>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-content">
                <Loader2 size={18} className="spinner" />
                <span>Sending instructions...</span>
              </span>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
