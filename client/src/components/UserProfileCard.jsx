import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UserProfileCard = ({ onOpenAdminView, onOpenAdminDashboard }) => {
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

  if (!user) return null;

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
    <section className="profile-card">
      <div className="profile-header">
        <div className="profile-user-info">
          <div className="avatar-circle">
            {user.role === 'admin' ? '🛡️' : '👤'}
          </div>
          <div>
            <div className="name-badge-row">
              <h3 className="profile-name">{user.name}</h3>
              <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <div className="profile-actions">
          {user.role === 'admin' && (
            <>
              <button
                onClick={onOpenAdminDashboard}
                className="btn-primary btn-sm"
                title="Open Management Center for orders, menu & business analytics"
              >
                📊 Admin Dashboard
              </button>
              <button
                onClick={onOpenAdminView}
                className="btn-admin-view"
                title="Manage customer and admin accounts"
              >
                🛡️ Users (RBAC)
              </button>
            </>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary"
          >
            {isEditing ? 'Cancel Edit' : '✏️ Edit Profile'}
          </button>
          <button onClick={logout} className="btn-danger-outline">
            Sign Out
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="edit-profile-form">
          <h4>Update Profile Information</h4>
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
              type="submit"
              disabled={updating}
              className="btn-primary"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details-grid">
          <div className="detail-item">
            <span className="detail-label">Account Role</span>
            <span className="detail-value capitalize">{user.role}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{user.phone || 'Not provided'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">City & State</span>
            <span className="detail-value">
              {user.address?.city ? `${user.address.city}, ${user.address.state || 'India'}` : 'Not set'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
            </span>
          </div>
        </div>
      )}

      {/* JWT Token preview & verification box */}
      <div className="jwt-token-box">
        <div className="jwt-header">
          <span className="jwt-label">Active JWT Bearer Token (Session Authorization)</span>
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
    </section>
  );
};

export default UserProfileCard;

