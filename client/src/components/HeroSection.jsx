import React from 'react';
import { useCart } from '../contexts/CartContext';

export const HeroSection = ({ onExploreMenu, onOpenVoiceGenie }) => {
  const { addToCart } = useCart();

  // Featured showcase dishes with real database data matching seedData
  const showcaseDishes = [
    {
      name: 'Crispy Ghee Podi Roast Dosa',
      price: 219,
      rating: 4.9,
      reviews: 320,
      prepTime: '15m',
      tag: '🔥 South Indian Classic',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80',
      description: 'Golden paper-thin crepe roasted in desi ghee & gunpowder podi.',
      isVeg: true,
    },
    {
      name: 'Fiery Pepperoni & Hot Honey Pizza',
      price: 429,
      rating: 4.9,
      reviews: 188,
      prepTime: '22m',
      tag: '✨ Chef Handcrafted',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
      description: 'Smoked pepperoni, hot chili honey drizzle & buffalo mozzarella.',
      isVeg: false,
    },
    {
      name: 'The Genie Signature Smash Burger',
      price: 329,
      rating: 4.9,
      reviews: 210,
      prepTime: '15m',
      tag: '👑 Bestseller',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      description: 'Double smashed patty, melted vintage cheddar & secret Genie glaze.',
      isVeg: false,
    },
  ];

  const handleScrollToMenu = (e) => {
    e?.preventDefault();
    if (onExploreMenu) {
      onExploreMenu();
    } else {
      const menuSection = document.getElementById('food-menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTriggerVoice = () => {
    if (onOpenVoiceGenie) {
      onOpenVoiceGenie();
    } else {
      window.dispatchEvent(new CustomEvent('open-genie-voice'));
    }
  };

  return (
    <section className="hero-section">
      {/* Decorative ambient background glows */}
      <div className="hero-glow hero-glow-1"></div>
      <div className="hero-glow hero-glow-2"></div>

      <div className="hero-content-wrapper">
        {/* Left Column: Headline, Description & CTAs */}
        <div className="hero-text-column">
          <div className="hero-badge-pill">
            <span className="hero-badge-sparkle">✨</span>
            <span className="hero-badge-text">AI-Powered Culinary Platform • Live 24-Min Delivery</span>
            <span className="hero-badge-live-dot"></span>
          </div>

          <h1 className="hero-title">
            Craving Something <br />
            <span className="hero-title-gradient">Extraordinary?</span> 🧞
          </h1>

          <p className="hero-subtitle">
            From golden <strong>Desi Ghee Podi Dosas</strong> and authentic Malabar curries to
            wood-fired <strong>Artisanal Pizzas</strong> and royal dum biryanis — summon gourmet
            flavors crafted by premier kitchens, delivered piping hot to your door.
          </p>

          <div className="hero-cta-group">
            <button
              onClick={handleScrollToMenu}
              className="hero-btn-primary"
              title="Browse our complete culinary menu"
            >
              <span>Explore Food Menu</span>
              <span className="hero-btn-arrow">➔</span>
            </button>

            <button
              onClick={handleTriggerVoice}
              className="hero-btn-voice"
              title="Order your food by speaking with Genie Voice AI"
            >
              <span className="hero-mic-pulse">🎙️</span>
              <div className="hero-voice-text-group">
                <span className="hero-voice-label">Ask Genie Voice AI</span>
                <span className="hero-voice-sub">Speak your craving</span>
              </div>
            </button>
          </div>

          {/* Social Proof & Metrics Badges */}
          <div className="hero-metrics-strip">
            <div className="hero-metric-item">
              <div className="metric-icon-box">⚡</div>
              <div className="metric-info">
                <span className="metric-val">24 Mins</span>
                <span className="metric-label">Avg. Delivery Speed</span>
              </div>
            </div>

            <div className="hero-metric-divider"></div>

            <div className="hero-metric-item">
              <div className="metric-icon-box">⭐</div>
              <div className="metric-info">
                <span className="metric-val">4.9 / 5.0</span>
                <span className="metric-label">14,000+ Foodies</span>
              </div>
            </div>

            <div className="hero-metric-divider"></div>

            <div className="hero-metric-item">
              <div className="metric-icon-box">🌱</div>
              <div className="metric-info">
                <span className="metric-val">100% Fresh</span>
                <span className="metric-label">Pure Veg & Halal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Culinary Showcase Carousel */}
        <div className="hero-visual-column">
          <div className="hero-platter-container">
            {/* Live Floating Status Badges */}
            <div className="hero-floating-pill pill-top-left">
              <span className="pill-dot-green"></span>
              <span className="pill-text">🔥 140+ Feasts Summoned Today</span>
            </div>

            {/* Showcase Food Cards Stack */}
            <div className="hero-cards-stack">
              {showcaseDishes.map((dish, idx) => (
                <div
                  key={idx}
                  className={`hero-food-card card-index-${idx}`}
                >
                  <div className="hero-card-img-wrapper">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="hero-card-img"
                      loading="lazy"
                    />
                    <span className="hero-card-tag">{dish.tag}</span>
                    <span
                      className={`hero-card-veg-indicator ${dish.isVeg ? 'veg' : 'non-veg'}`}
                      title={dish.isVeg ? 'Pure Veg' : 'Non-Veg'}
                    >
                      <span className="veg-dot"></span>
                    </span>
                  </div>

                  <div className="hero-card-body">
                    <div className="hero-card-header">
                      <h3 className="hero-card-title">{dish.name}</h3>
                      <span className="hero-card-price">₹{dish.price}</span>
                    </div>

                    <p className="hero-card-desc">{dish.description}</p>

                    <div className="hero-card-footer">
                      <div className="hero-card-meta">
                        <span className="card-rating">⭐ {dish.rating}</span>
                        <span className="card-prep">⏱️ {dish.prepTime}</span>
                      </div>
                      <button
                        onClick={handleScrollToMenu}
                        className="hero-card-order-btn"
                        title="Order this dish from menu"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

