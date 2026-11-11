import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

export const AdminUsersList = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.getAllUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-brand">
            <span className="modal-icon">🛡️</span>
            <div>
              <h3>Admin User Management & RBAC Inspector</h3>
              <p className="modal-subtitle">
                Secured via Express <code>protect</code> and <code>adminOnly</code> middleware
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {error ? (
          <div className="alert alert-danger">
            <strong>Access Blocked:</strong> {error}
          </div>
        ) : loading ? (
          <div className="loading-state">
            <span className="spinner"></span>
            <span>Loading registered users from MongoDB...</span>
          </div>
        ) : (
          <div className="users-table-container">
            <div className="table-meta">
              <span>Total Accounts: <strong>{users.length}</strong></span>
              <button onClick={fetchUsers} className="btn-secondary btn-sm">
                ↻ Refresh List
              </button>
            </div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-pill ${u.role === 'admin' ? 'pill-admin' : 'pill-customer'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.phone || '--'}</td>
                    <td>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersList;

