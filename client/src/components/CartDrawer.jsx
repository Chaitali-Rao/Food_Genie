import React from 'react';
import { useCart } from '../contexts/CartContext';

export const CartDrawer = ({ onOpenCheckout }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    subtotal,
    tax,
    deliveryFee,
    isFreeDelivery,
    amountUntilFreeDelivery,
    freeDeliveryProgress,
    grandTotal,
    freeDeliveryThreshold,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <span className="cart-icon">🛍️</span>
            <h3>Your Genie Cart</h3>
            <span className="cart-count-badge">{totalCount} items</span>
          </div>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="delivery-meter-box">
          {isFreeDelivery && subtotal > 0 ? (
            <div className="delivery-free-msg">
              <span>🎉</span>
              <strong>Awesome! You unlocked FREE Delivery!</strong>
            </div>
          ) : (
            <div className="delivery-progress-info">
              <p>
                Add <strong>₹{amountUntilFreeDelivery}</strong> more to get <strong>FREE delivery</strong> (above ₹{freeDeliveryThreshold})!
              </p>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${freeDeliveryProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-emoji">🍽️</span>
              <h4>Your Genie cart is empty</h4>
              <p>Explore our handcrafted menu and summon delicious food!</p>
              <button
                className="btn-primary btn-explore"
                onClick={() => setIsCartOpen(false)}
              >
                Explore Menu
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.food._id} className="cart-item-row">
                <img
                  src={item.food.image}
                  alt={item.food.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <div className="cart-item-top">
                    <span className={`dietary-dot-sm ${item.food.isVeg ? 'veg' : 'non-veg'}`}></span>
                    <h4 className="cart-item-name">{item.food.name}</h4>
                  </div>
                  <span className="cart-item-unit-price">₹{item.food.price} each</span>

                  <div className="cart-item-bottom">
                    <div className="cart-qty-controls">
                      <button
                        className="btn-cart-qty"
                        onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="cart-qty-text">{item.quantity}</span>
                      <button
                        className="btn-cart-qty"
                        onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item-total">
                      ₹{item.food.price * item.quantity}
                    </span>

                    <button
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.food._id)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Bill */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-bill-summary">
              <div className="bill-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-green">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="bill-row">
                <span>Taxes & Restaurant Charges (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="bill-divider"></div>
              <div className="bill-row grand-total-row">
                <strong>Grand Total</strong>
                <strong className="grand-price">₹{grandTotal}</strong>
              </div>
            </div>

            <div className="cart-checkout-actions">
              <button
                className="btn-primary btn-checkout-drawer"
                onClick={() => {
                  setIsCartOpen(false);
                  if (onOpenCheckout) {
                    onOpenCheckout();
                  }
                }}
              >
                <span>Proceed to Checkout</span>
                <span>➔</span>
              </button>

              <button
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

