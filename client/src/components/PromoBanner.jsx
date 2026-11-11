import React, { useState } from 'react';

export const PromoBanner = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const promos = [
    {
      id: 'promo-1',
      code: 'GENIE50',
      badge: 'FIRST ORDER',
      icon: '🎟️',
      title: 'Flat ₹50 OFF',
      description: 'On your first royal culinary feast above ₹299.',
      accent: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      textColor: '#c2410c',
    },
    {
      id: 'promo-2',
      code: 'FREEDEL',
      badge: 'SPEEDY EXPRESS',
      icon: '🛵',
      title: 'Free Express Delivery',
      description: 'Zero delivery fee on all feasts above ₹499 with live radar.',
      accent: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      textColor: '#047857',
    },
    {
      id: 'promo-3',
      code: 'KAAPI',
      badge: 'SOUTH INDIAN SPECIAL',
      icon: '☕',
      title: 'Free Degree Filter Kaapi',
      description: 'Complimentary traditional brass-tumbler brew with Dosa & Idli platters.',
      accent: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      textColor: '#5b21b6',
    },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2200);
  };

  return (
    <section className="promo-banner-section" aria-label="Promotional Deals and Discounts">
      <div className="promo-banner-header">
        <div className="promo-title-group">
          <span className="promo-section-badge">🔥 EXCLUSIVE DEALS & OFFERS</span>
          <h2 className="promo-section-title">Save Big On Your Next Craving</h2>
        </div>
        <span className="promo-guarantee-tag">⚡ Applied instantly at checkout</span>
      </div>

      <div className="promo-cards-grid">
        {promos.map((promo) => (
          <div key={promo.id} className="promo-deal-card">
            <div className="promo-card-top">
              <span className="promo-badge-tag">{promo.badge}</span>
              <span className="promo-deal-icon">{promo.icon}</span>
            </div>

            <div className="promo-card-content">
              <h3 className="promo-deal-title">{promo.title}</h3>
              <p className="promo-deal-desc">{promo.description}</p>
            </div>

            <div className="promo-coupon-dash">
              <div className="promo-code-box">
                <span className="promo-code-label">CODE:</span>
                <strong className="promo-code-val">{promo.code}</strong>
              </div>

              <button
                onClick={() => handleCopy(promo.code)}
                className={`promo-copy-btn ${copiedCode === promo.code ? 'copied' : ''}`}
                title="Copy coupon code"
              >
                {copiedCode === promo.code ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoBanner;

