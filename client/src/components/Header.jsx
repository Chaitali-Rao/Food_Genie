import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const Header = ({ onOpenAuth, onOpenOrders, onOpenAdmin, onOpenProfile }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount, setIsCartOpen } = useCart();

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="brand-logo">
          <div className="genie-badge">
            <span className="genie-icon">🧞</span>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">
              Food Genie <span className="brand-ai-badge">AI-Powered</span>
            </h1>
            <p className="brand-subtitle">Smart Food Ordering Platform</p>
          </div>
        </div>

        <div className="header-meta">
          {/* Admin Dashboard Portal Button (Admin only) */}
          {isAuthenticated && user?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="btn-admin-nav-pulse"
              title="Open Admin Operations & Business Analytics"
            >
              <span className="admin-nav-icon">🛡️</span>
              <span className="admin-nav-text">Admin Portal</span>
            </button>
          )}

          {/* My Orders Button */}
          {isAuthenticated && (
            <button
              onClick={onOpenOrders}
              className="btn-orders-nav"
              title="View my placed orders and live tracking"
            >
              <span>📦</span>
              <span className="orders-nav-text">My Orders</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`btn-cart-nav ${totalCount > 0 ? 'has-items' : ''}`}
            aria-label="Open Shopping Cart"
          >
            <span className="cart-nav-icon">🛍️</span>
            <span className="cart-nav-label">Cart</span>
            {totalCount > 0 && (
              <span className="cart-nav-count-badge">{totalCount}</span>
            )}
          </button>

          <div className="auth-nav-section">
            {isAuthenticated ? (
              <div className="user-nav-box">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="user-nav-info btn-user-profile-trigger"
                  title="View Account Profile & Settings"
                >
                  <span className="user-nav-avatar">
                    {user?.role === 'admin' ? '🛡️' : '👤'}
                  </span>
                  <div className="user-nav-details">
                    <span className="user-nav-name">{user?.name}</span>
                    <span className={`user-nav-role ${user?.role === 'admin' ? 'role-admin' : 'role-customer'}`}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <span className="user-nav-caret" aria-hidden="true">▾</span>
                </button>
                <button
                  onClick={logout}
                  className="btn-outline-sm btn-nav-signout"
                  title="Sign out of account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-primary btn-auth-trigger"
              >
                <span>🔑 Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
