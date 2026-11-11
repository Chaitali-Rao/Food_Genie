import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import orderService from '../services/orderService';

export const CheckoutModal = ({ isOpen, onClose, onOpenAuth, onOrderPlaced }) => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, subtotal, tax, deliveryFee, grandTotal, clearCart } = useCart();

  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [stateName, setStateName] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          food: item.food._id,
          name: item.food.name,
          image: item.food.image,
          price: item.food.price,
          quantity: item.quantity,
          isVeg: item.food.isVeg,
        })),
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: stateName.trim() || 'Karnataka',
          zipCode: zipCode.trim(),
          country: 'India',
        },
        phone: phone.trim(),
        paymentMethod,
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.order) {
        clearCart();
        onClose();
        if (onOrderPlaced) {
          onOrderPlaced(res.order);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-brand">
            <span className="modal-icon">🛍️</span>
            <div>
              <h3>Checkout & Delivery</h3>
              <p className="modal-subtitle">Phase 4: Order Creation & Address Verification</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="checkout-auth-prompt">
            <span className="auth-prompt-icon">🔒</span>
            <h4>Account Required to Place Order</h4>
            <p>
              Please sign in or register a free Food Genie customer account so we can link your orders and provide live real-time status tracking.
            </p>
            <div className="auth-prompt-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                Sign In / Register
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Return to Menu
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="checkout-form">
            {error && (
              <div className="alert alert-danger">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Delivery Details */}
            <div className="checkout-section">
              <h4 className="section-subtitle">📍 Delivery Address</h4>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Street Address / Flat / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 42 Brigade Road, Flat 3B"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code / Zip</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 560025"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h4 className="section-subtitle">💳 Select Payment Method</h4>
              <div className="payment-options-grid">
                <label className={`payment-card ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className="payment-card-body">
                    <span className="pay-icon">💵</span>
                    <strong>Cash on Delivery</strong>
                    <span>Pay at doorstep</span>
                  </div>
                </label>

                <label className={`payment-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div className="payment-card-body">
                    <span className="pay-icon">⚡</span>
                    <strong>Instant UPI</strong>
                    <span>GPay / PhonePe (Instant)</span>
                  </div>
                </label>

                <label className={`payment-card ${paymentMethod === 'Card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="Card"
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                  />
                  <div className="payment-card-body">
                    <span className="pay-icon">💳</span>
                    <strong>Credit / Debit Card</strong>
                    <span>Visa / Mastercard</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Items & Bill Breakdown */}
            <div className="checkout-bill-card">
              <div className="checkout-items-preview">
                <strong>Order Summary ({cartItems.length} items)</strong>
                <div className="items-chip-list">
                  {cartItems.map((item) => (
                    <span key={item.food._id} className="item-chip">
                      {item.food.name} &times; {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="checkout-bill-rows">
                <div className="bill-row">
                  <span>Items Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-green">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="bill-row">
                  <span>Taxes (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="bill-divider"></div>
                <div className="bill-row grand-total-row">
                  <strong>Total Payable</strong>
                  <strong className="grand-price">₹{grandTotal}</strong>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn-place-order"
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  <span>Placing Order with Genie...</span>
                </>
              ) : (
                <>
                  <span>Summon & Place Order</span>
                  <span>•</span>
                  <span>₹{grandTotal}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;

