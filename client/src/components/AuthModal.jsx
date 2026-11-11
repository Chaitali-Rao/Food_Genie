import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, authError, clearError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleTabSwitch = (loginMode) => {
    setIsLoginMode(loginMode);
    clearError();
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();
    setSuccessMsg('');

    try {
      if (isLoginMode) {
        const result = await login(email, password);
        if (result.success) {
          setSuccessMsg('Welcome back to Food Genie!');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const result = await register({
          name,
          email,
          password,
          phone,
          role,
        });
        if (result.success) {
          setSuccessMsg(`Account created successfully as ${role.toUpperCase()}!`);
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (preset) => {
    clearError();
    setSuccessMsg('');
    if (preset === 'customer') {
      setIsLoginMode(false);
      setName('Sarah Foodie');
      setEmail(`sarah_${Math.floor(Math.random() * 9000 + 1000)}@genie.com`);
      setPassword('password123');
      setPhone('9876501234');
      setRole('customer');
    } else if (preset === 'admin') {
      setIsLoginMode(false);
      setName('Alex Restaurant Admin');
      setEmail(`admin_${Math.floor(Math.random() * 9000 + 1000)}@genie.com`);
      setPassword('adminPass123');
      setPhone('9123456789');
      setRole('admin');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-brand">
            <span className="modal-icon">🧞</span>
            <h3>{isLoginMode ? 'Sign In to Food Genie' : 'Create Food Genie Account'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${isLoginMode ? 'active' : ''}`}
            onClick={() => handleTabSwitch(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
            onClick={() => handleTabSwitch(false)}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Pre-fill helpers */}
        <div className="quick-fill-strip">
          <span className="quick-fill-title">Quick Test:</span>
          <button
            type="button"
            className="btn-quick"
            onClick={() => handleQuickFill('customer')}
          >
            👤 Customer Preset
          </button>
          <button
            type="button"
            className="btn-quick"
            onClick={() => handleQuickFill('admin')}
          >
            🛡️ Admin Preset
          </button>
        </div>

        {authError && (
          <div className="alert alert-danger auth-alert">
            <span>⚠️ {authError}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success auth-alert">
            <span>✓ {successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Account Role</label>
                <div className="role-selector">
                  <label className={`role-radio-box ${role === 'customer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={role === 'customer'}
                      onChange={() => setRole('customer')}
                    />
                    <div className="role-box-text">
                      <strong>Customer</strong>
                      <span>Browse food, order & track</span>
                    </div>
                  </label>
                  <label className={`role-radio-box ${role === 'admin' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                    />
                    <div className="role-box-text">
                      <strong>Admin</strong>
                      <span>Manage dishes & orders</span>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary auth-submit-btn"
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                <span>Processing...</span>
              </>
            ) : isLoginMode ? (
              'Sign In with Food Genie'
            ) : (
              `Register as ${role === 'admin' ? 'Administrator' : 'Customer'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

