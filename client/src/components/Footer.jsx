import React from 'react';

export const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-left">
          <p className="copyright">
            Food Genie &bull; AI-Powered Food Ordering Platform
          </p>
          <p className="footer-sub">
            Built with React.js, Express.js, Node.js, MongoDB, Mongoose, JWT & Axios
          </p>
        </div>
        <div className="footer-right">
          <span className="footer-tag">⚡ 30-Min Fast Delivery</span>
          <span className="footer-tag">🔒 100% Secure Checkout</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

