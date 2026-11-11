import React from 'react';

export const ArchitecturePlan = () => {
  return (
    <section className="architecture-card">
      <div className="section-head">
        <span className="badge-tag">Architecture Roadmap</span>
        <h3 className="section-title">Food Genie Full-Stack Blueprint</h3>
        <p className="section-description">
          Engineered as a modular, scalable MERN stack food ordering platform with an extensible AI engine.
        </p>
      </div>

      <div className="phases-grid">
        <div className="phase-card completed">
          <div className="phase-card-header">
            <span className="phase-number active">Phase 1</span>
            <span className="phase-status done">Implemented & Verified</span>
          </div>
          <h4>Foundation, Environment & Health-Check</h4>
          <ul className="phase-list">
            <li>✓ Express.js modular server & Vite React client scaffolded</li>
            <li>✓ Resilient MongoDB connection & readyState monitoring</li>
            <li>✓ Working <code>GET /api/health</code> endpoint with latency test</li>
            <li>✓ Environment configurations & <code>.env.example</code></li>
            <li>✓ Centralized Axios client with request/response interceptors</li>
            <li>✓ Automated test suite verifying HTTP contracts & error handling</li>
          </ul>
        </div>

        <div className="phase-card completed">
          <div className="phase-card-header">
            <span className="phase-number active">Phase 2</span>
            <span className="phase-status done">Implemented & Verified</span>
          </div>
          <h4>Authentication & Role-Based Access Control</h4>
          <ul className="phase-list">
            <li>✓ Mongoose User schema with pre-save bcrypt hashing</li>
            <li>✓ JWT token generation, signed expiry & Bearer verification</li>
            <li>✓ Secure registration, login, get & update profile endpoints</li>
            <li>✓ Role-Based Access Control (RBAC) middleware for Customers & Admins</li>
            <li>✓ React <code>AuthContext</code> with persistent token & auto-sync</li>
            <li>✓ Automated integration tests (13 test cases, 100% pass)</li>
          </ul>
        </div>

        <div className="phase-card completed">
          <div className="phase-card-header">
            <span className="phase-number active">Phase 3</span>
            <span className="phase-status done">Implemented & Verified</span>
          </div>
          <h4>Food Catalog, Search, Filters & Cart</h4>
          <ul className="phase-list">
            <li>✓ Mongoose Category & Food schemas with dietary & spice flags</li>
            <li>✓ Realistic seed database with 7 cuisines & 12 gourmet dishes</li>
            <li>✓ Multi-parameter search, category filter, veg/non-veg & sorting API</li>
            <li>✓ Interactive CartContext with real-time tax & free delivery meter</li>
            <li>✓ Responsive dish card grid, quantity counters & detailed dish modal</li>
            <li>✓ Floating cart drawer with bill breakdown & checkout preparation</li>
          </ul>
        </div>

        <div className="phase-card done">
          <div className="phase-card-header">
            <span className="phase-number">Phase 4</span>
            <span className="phase-status done">Implemented & Verified</span>
          </div>
          <h4>Checkout, Orders & Real-Time Tracking</h4>
          <ul className="phase-list">
            <li>✓ Mongoose Order schema with items, address, prices & tracking history</li>
            <li>✓ Order creation with server-side price validation & tamper protection</li>
            <li>✓ Interactive Checkout modal with address management & payment options (COD/UPI/Card)</li>
            <li>✓ Visual 5-step Real-Time Order Status Tracker with animated stepper</li>
            <li>✓ Interactive status simulation button (advances Placed ➔ Confirmed ➔ Preparing ➔ Out for Delivery ➔ Delivered)</li>
            <li>✓ Order history modal with past invoices & 1-click re-ordering</li>
            <li>✓ Automated test suite (11 integration tests, 100% pass)</li>
          </ul>
        </div>

        <div className="phase-card done">
          <div className="phase-card-header">
            <span className="phase-number">Phase 5</span>
            <span className="phase-status done">Implemented & Verified</span>
          </div>
          <h4>Admin Dashboard & Management</h4>
          <ul className="phase-list">
            <li>✓ Real-time Business Analytics KPI cards (Revenue, Orders, Inventory, Customers)</li>
            <li>✓ Status breakdown distribution pipeline & top-selling dishes ranking</li>
            <li>✓ Order Management center with status filtering, search & 1-click transition actions</li>
            <li>✓ Food Menu & Inventory Management with 1-click In Stock / Out of Stock switch</li>
            <li>✓ Food dish creator & editor form with category assignment, spice & dietary tags</li>
            <li>✓ Comprehensive Admin test suite (10 integration tests, 100% pass)</li>
          </ul>
        </div>

        <div className="phase-card current">
          <div className="phase-card-header">
            <span className="phase-number active">Phase 6</span>
            <span className="phase-status done">Implemented & Verified</span>
          </div>
          <h4>Extensible AI Food Recommendation Chatbot</h4>
          <ul className="phase-list">
            <li>✓ Conversational Food Genie AI persona with natural language understanding</li>
            <li>✓ Multi-factor intent parser: dietary restrictions (Pure Veg/Non-Veg), spice tolerance (0-3), and budget ceilings (₹)</li>
            <li>✓ Active cart awareness with 1-click complementary beverage & dessert pairing engine</li>
            <li>✓ In-chat interactive dish recommendation cards with live 1-click "Add to Cart"</li>
            <li>✓ Extensible AI architecture: zero-cost heuristic NLU default with plug-and-play LLM adapter</li>
            <li>✓ Automated AI integration test suite (10 integration tests, 100% pass)</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ArchitecturePlan;
