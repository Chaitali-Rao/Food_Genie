import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

export const FoodDetailModal = ({ food, onClose }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const currentCartQty = food ? getItemQuantity(food._id) : 0;
  const [qty, setQty] = useState(currentCartQty > 0 ? currentCartQty : 1);

  useEffect(() => {
    if (food) {
      const current = getItemQuantity(food._id);
      setQty(current > 0 ? current : 1);
    }
  }, [food, getItemQuantity]);

  if (!food) return null;

  const handleAddToCart = () => {
    if (currentCartQty > 0) {
      updateQuantity(food._id, qty);
    } else {
      addToCart(food, qty);
    }
    onClose();
  };

  const getSpiceLabel = (level) => {
    if (level === 0) return 'Mild';
    if (level === 1) return 'Medium 🌶️';
    if (level === 2) return 'Hot 🌶️🌶️';
    return 'Extra Hot 🌶️🌶️🌶️';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content food-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-image-wrapper">
          <img src={food.image} alt={food.name} className="detail-hero-img" />
          <button className="detail-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
          <div className="detail-floating-badges">
            <span className={`dietary-badge ${food.isVeg ? 'veg' : 'non-veg'}`}>
              <span className="dietary-dot"></span>
              {food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
            <span className="badge-spice">{getSpiceLabel(food.spicyLevel)}</span>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-header-row">
            <div>
              <span className="detail-category-tag">{food.category?.name || 'Specialty'}</span>
              <h2 className="detail-dish-title">{food.name}</h2>
            </div>
            <div className="detail-price-tag">₹{food.price}</div>
          </div>

          <div className="detail-meta-strip">
            <span className="meta-badge">⭐ {food.rating} ({food.numReviews} reviews)</span>
            <span className="meta-badge">⏱️ {food.prepTimeMinutes} mins</span>
            <span className="meta-badge">🔥 {food.calories} kcal</span>
          </div>

          <p className="detail-description">{food.description}</p>

          {food.ingredients && food.ingredients.length > 0 && (
            <div className="detail-ingredients-section">
              <h4>Key Ingredients</h4>
              <div className="ingredients-pills">
                {food.ingredients.map((ing, idx) => (
                  <span key={idx} className="ingredient-pill">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {food.tags && food.tags.length > 0 && (
            <div className="detail-tags-strip">
              {food.tags.map((tag, idx) => (
                <span key={idx} className="food-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="detail-action-footer">
            <div className="qty-picker">
              <button
                type="button"
                className="btn-qty"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                -
              </button>
              <span className="qty-number">{qty}</span>
              <button
                type="button"
                className="btn-qty"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary btn-add-cart-detail"
            >
              <span>{currentCartQty > 0 ? 'Update Cart' : 'Add to Cart'}</span>
              <span className="btn-price-divider">•</span>
              <span>₹{food.price * qty}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;

