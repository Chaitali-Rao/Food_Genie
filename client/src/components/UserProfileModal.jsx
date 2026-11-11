import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UserProfileModal = ({
  isOpen,
  onClose,
  onOpenAdminView,
  onOpenAdminDashboard,
  onOpenOrders,
}) => {
  const { user, token, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [stateName, setStateName] = useState(user?.address?.state || '');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDevToken, setShowDevToken] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMsg('');
    try {
      const payload = {
        name,
        phone,
        address: {
          city,
          state: stateName,
        },
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setMsg('Profile updated successfully!');
        setNewPassword('');
        setTimeout(() => {
          setIsEditing(false);
          setMsg('');
        }, 1200);
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container profile-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="User Account Profile"
      >
        {/* Modal Header */}
        <div className="modal-header profile-modal-header">
          <div className="profile-badge-row">
            <span className="profile-modal-avatar">
              {user.role === 'admin' ? '🛡️' : '👤'}
            </span>
            <div>
              <h2 className="modal-title">{user.name}</h2>
              <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close Profile Modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body profile-modal-body">
          {/* Quick Action Navigation Buttons */}
          <div className="profile-quick-nav">
            {onOpenOrders && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="btn-profile-nav"
              >
                <span>📦</span>
                <span>My Placed Orders</span>
              </button>
            )}

            {user.role === 'admin' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminDashboard && onOpenAdminDashboard();
                  }}
                  className="btn-profile-nav btn-profile-admin"
                >
                  <span>📊</span>
                  <span>Admin Operations</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminView && onOpenAdminView();
                  }}
                  className="btn-profile-nav btn-profile-admin"
                >
                  <span>🛡️</span>
                  <span>User RBAC Control</span>
                </button>
              </>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-profile-nav btn-profile-edit"
            >
              <span>{isEditing ? '✕' : '✏️'}</span>
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Edit Profile Form OR Overview Details */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className="edit-profile-form">
              <h4 className="edit-form-heading">Update Profile Details</h4>
              {msg && <div className="alert alert-success">{msg}</div>}

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    placeholder="e.g. 9876543210"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    placeholder="e.g. Bangalore"
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={stateName}
                    placeholder="e.g. Karnataka"
                    onChange={(e) => setStateName(e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>New Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    minLength={6}
                    value={newPassword}
                    placeholder="New password (min 6 characters)"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary"
                >
                  {updating ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-overview-card">
              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{user.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Contact Phone</span>
                  <span className="detail-value">{user.phone || 'Not provided'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">City & State</span>
                  <span className="detail-value">
                    {user.address?.city
                      ? `${user.address.city}, ${user.address.state || 'India'}`
                      : 'Not set'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Developer & Security Details Accordion */}
          <div className="developer-jwt-accordion">
            <button
              type="button"
              onClick={() => setShowDevToken(!showDevToken)}
              className="developer-jwt-toggle"
              aria-expanded={showDevToken}
            >
              <div className="accordion-title-left">
                <span>⚙️</span>
                <strong>Developer & Security Diagnostics (JWT Session)</strong>
              </div>
              <span className="accordion-chevron">{showDevToken ? '▲ Hide' : '▼ View Token'}</span>
            </button>

            {showDevToken && (
              <div className="jwt-token-box inside-accordion">
                <div className="jwt-header">
                  <span className="jwt-label">ACTIVE JWT BEARER TOKEN</span>
                  <button onClick={handleCopyToken} className="btn-copy">
                    {copied ? '✓ Copied' : '📋 Copy Token'}
                  </button>
                </div>
                <code className="jwt-string">
                  {token ? `${token.substring(0, 36)}...${token.substring(token.length - 18)}` : 'No Token'}
                </code>
                <small className="jwt-sub">
                  Automatically attached via Axios request interceptor for authenticated API endpoints.
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer profile-modal-footer">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="btn-danger-outline"
          >
            Sign Out of Account
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;

