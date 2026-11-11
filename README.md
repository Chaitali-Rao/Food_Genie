# 🧞 Food Genie - AI-Powered Food Ordering Platform

Food Genie is a modern, responsive full-stack food delivery application built on the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with an extensible AI recommendation engine, AI Voice Ordering, and Live Animated Delivery Radar.

> 📖 **Comprehensive Engineering Journal & Modification Log**: For an exhaustive, minute-by-minute record of all architectural decisions, folder creation steps, user-requested modifications, and technical rationales, see [PROJECT_DEVELOPMENT_LOG.md](./PROJECT_DEVELOPMENT_LOG.md).

---

## 🏗️ Architecture & Proposed Folder Structure

The project is organized into `client/` and `server/` with modular architectural layers:

```
Food-Genie/
├── package.json                   # Root package with orchestrator scripts
├── .gitignore                     # Monorepo-level ignore rules
├── README.md                      # Comprehensive documentation & setup guide
│
├── client/                        # React Frontend (Vite)
│   ├── .env.example               # Frontend environment template
│   ├── .env                       # Frontend environment configuration
│   ├── .gitignore                 # Client-specific gitignore
│   ├── index.html                 # Single Page Application HTML entry
│   ├── vite.config.js             # Vite configuration with /api reverse proxy
│   ├── package.json               # Client dependencies (React, Axios, Vite)
│   └── src/
│       ├── assets/                # Images, icons, static assets
│       ├── components/            # Reusable UI components
│       │   ├── Header.jsx         # Site header with branding, cart badge & user session
│       │   ├── FoodCatalog.jsx    # Menu catalog with search, dietary filters & sorting
│       │   ├── FoodDetailModal.jsx# Dish modal with ingredients, calories & qty selector
│       │   ├── CartDrawer.jsx     # Slide-over cart drawer with free delivery meter & bill
│       │   ├── CheckoutModal.jsx  # Delivery address & payment method selection modal
│       │   ├── OrderTrackerModal.jsx # 5-step visual stepper & interactive step simulator
│       │   ├── OrderHistoryModal.jsx # Past orders invoice list & 1-click re-order
│       │   ├── AdminDashboardModal.jsx # Admin Management Center (KPIs, Order pipeline, Menu stock)
│       │   ├── GenieChatbot.jsx   # AI food recommendation chatbot with in-chat ordering
│       │   ├── HealthMonitor.jsx  # Interactive live API & DB health monitor
│       │   ├── ArchitecturePlan.jsx # Roadmap & phase progression viewer
│       │   ├── AuthModal.jsx      # Login / Registration modal with role selection
│       │   ├── UserProfileCard.jsx# Active session card with JWT viewer & edit profile
│       │   ├── AdminUsersList.jsx # RBAC Inspector & user management modal (Admin only)
│       │   └── Footer.jsx         # Site footer
│       ├── contexts/              # React Context providers
│       │   ├── AuthContext.jsx    # Authentication & RBAC context provider
│       │   └── CartContext.jsx    # Shopping cart, subtotal, tax & delivery fee provider
│       ├── hooks/                 # Custom reusable React hooks
│       ├── pages/                 # Full view pages (Home, Menu, Cart, Orders, Admin)
│       ├── services/              # API communication layer
│       │   ├── api.js             # Pre-configured Axios instance with JWT interceptors
│       │   ├── healthService.js   # Health check API connector
│       │   ├── authService.js     # Auth API connector (Register, Login, Profile)
│       │   ├── foodService.js     # Food catalog & categories API connector
│       │   ├── orderService.js    # Orders & live tracking API connector
│       │   ├── adminService.js    # Admin analytics, order operations & food stock connector
│       │   └── aiService.js       # AI conversational recommender & pairing API connector
│       ├── utils/                 # Client helpers, formatters, validation
│       ├── App.jsx                # Main Application shell
│       ├── App.css                # Application-level styling
│       ├── index.css              # Global design tokens and reset
│       └── main.jsx               # React 18 DOM mount point
│
└── server/                        # Node.js + Express REST API (ES Modules)
    ├── .env.example               # Backend environment template
    ├── .env                       # Backend environment configuration
    ├── .gitignore                 # Server-specific gitignore
    ├── package.json               # Server dependencies (Express, Mongoose, JWT, bcryptjs)
    ├── server.js                  # Express application entry, CORS & graceful shutdown
    ├── config/                    # Configuration modules
    │   └── db.js                  # Resilient MongoDB Mongoose connection
    ├── controllers/               # Request handling logic
    │   ├── healthController.js    # System health, memory & DB status controller
    │   ├── authController.js      # Register, Login, Profile & User admin controller
    │   ├── foodController.js      # Food search, filtering, categories & CRUD controller
    │   ├── orderController.js     # Order placement, tracking & status controller
    │   ├── adminController.js     # Business metrics, order operations & food stock controller
    │   └── aiController.js        # AI chat recommendations, pairings & suggestions controller
    ├── middleware/                # Custom Express middlewares
    │   ├── errorMiddleware.js     # 404 handler & centralized error handler
    │   └── authMiddleware.js      # JWT verification (`protect`) & RBAC (`authorize`, `adminOnly`)
    ├── models/                    # Mongoose data schemas
    │   ├── User.js                # User schema with bcrypt pre-save hash & matchPassword
    │   ├── Category.js            # Food category schema with slugs and icons
    │   ├── Food.js                # Food item schema with dietary flags, spicyLevel, prices
    │   └── Order.js               # Order schema with snapshots, addresses, prices & 5-step status
    ├── routes/                    # Express modular route definitions
    │   ├── healthRoutes.js        # Health check router (/api/health)
    │   ├── authRoutes.js          # Authentication router (/api/auth)
    │   ├── foodRoutes.js          # Food catalog router (/api/foods)
    │   ├── orderRoutes.js         # Orders & live tracking router (/api/orders)
    │   ├── adminRoutes.js         # Admin dashboard router (/api/admin)
    │   └── aiRoutes.js            # AI recommendations & pairing router (/api/ai)
    ├── services/                  # Business logic services (AI, Payment)
    │   └── aiService.js           # Multi-factor NLU parser, candidate scorer & pairing engine
    ├── utils/                     # Utility helpers
    │   ├── generateToken.js       # Signed JWT generator with configurable expiry
    │   └── seedData.js            # Initial dataset of categories & gourmet dishes
    └── test/                      # Automated test suite
        ├── health.test.js         # Integration tests for health API & routing (6 tests)
        ├── auth.test.js           # Integration tests for Auth & RBAC (13 tests)
        ├── food.test.js           # Integration tests for Catalog & Filtering (13 tests)
        ├── order.test.js          # Integration tests for Orders & Status Tracking (11 tests)
        ├── admin.test.js          # Integration tests for Admin Dashboard & Stock Control (10 tests)
        └── ai.test.js             # Integration tests for AI Recommendations & Pairings (10 tests)
```

---

## 🚀 Phases Progress Summary

### Phase 1: Foundation, Environment & Health-Check `[COMPLETED]`
- [x] Initialized both `client/` and `server/` with modular structures.
- [x] Configured Express.js server with JSON parsing, CORS, and clean error handling.
- [x] Configured Vite React.js client with responsive UI and modern styling.
- [x] Built MongoDB Mongoose connection with resilient fallback and readyState monitoring.
- [x] Created `.env.example` and `.gitignore` files for both client and server.
- [x] Working Health Check API (`GET /api/health`) and live client monitor.

### Phase 2: Authentication & Role-Based Access Control (RBAC) `[COMPLETED]`
- [x] Installed `jsonwebtoken` and `bcryptjs`.
- [x] Built Mongoose `User` schema with bcrypt password hashing and comparison methods.
- [x] Implemented JWT generation (`generateToken`) with signed expiration (`7d`).
- [x] Implemented authentication middleware (`protect`) and RBAC middleware (`authorize`, `adminOnly`).
- [x] Built auth endpoints: register, login, profile, update profile, and admin users list.
- [x] Implemented client `authService`, `AuthContext`, and interactive UI components.

### Phase 3: Food Catalog, Categories, Search, Filters & Shopping Cart `[COMPLETED]`
- [x] Created Mongoose `Category` and `Food` schemas with dietary flags (`isVeg`), spice levels (`0-3`), ratings, prep times, calories, and ingredients.
- [x] Built database seeding utility (`server/utils/seedData.js`) with 7 cuisines and 12 gourmet dishes.
- [x] Implemented food controllers and routes:
  - `GET /api/foods` (with search keyword, category slug/ID, veg/non-veg filter, spice filter, price sorting, and pagination)
  - `GET /api/foods/categories` (active categories with dish counts)
  - `GET /api/foods/:id` (populated dish details)
  - `POST /api/foods` (Admin-only creation)
  - `PUT /api/foods/:id` (Admin-only update)
  - `DELETE /api/foods/:id` (Admin-only deletion)
- [x] Built client `CartContext` with real-time tax (5%), free delivery threshold meter (above ₹500), and `localStorage` persistence.
- [x] Built responsive catalog UI:
  - Live search bar with instant clear button
  - Horizontal scrolling category tabs with emoji icons and dish counts
  - Dietary filter buttons ("All", "🟢 Pure Veg", "🔴 Non-Veg")
  - Spice level and sorting dropdowns
  - Dish cards with dietary indicators, prep time, price, and instant "+ ADD" / `[-] [qty] [+]` cart counters
  - Dish details modal with full image, calories, spice rating, and ingredients
  - Slide-over Cart Drawer with free delivery progress meter, item breakdown, and bill summary
  - Floating bottom Cart bar when items are added
- [x] Automated test suite: **32 tests across 3 test suites, 100% pass rate**.

### Phase 4: Checkout, Orders & Real-Time Tracking `[COMPLETED]`
- [x] Created Mongoose `Order` schema with snapshot items, address, payment method, tax, delivery fee, 5-step status progression, and audit logs.
- [x] Implemented server-side price calculation and tamper protection against client payload manipulations.
- [x] Built order routes (`/api/orders`, `/api/orders/myorders`, `/api/orders/:id`, `/api/orders/:id/simulate-step`, `/api/orders/:id/status`).
- [x] Built UI components: `CheckoutModal`, `OrderTrackerModal` (with 5-step visual stepper and step simulator), and `OrderHistoryModal` (with 1-click re-ordering).

### Phase 5: Admin Dashboard, Operations & Menu Management `[COMPLETED]`
- [x] Implemented Admin backend routes and controller (`server/controllers/adminController.js`, `server/routes/adminRoutes.js`):
  - `GET /api/admin/stats` (Aggregated KPIs: Gross revenue, total orders, active dishes, registered users, order pipeline breakdown, top 5 selling dishes)
  - `GET /api/admin/orders` (Full order pipeline with status filtering and pagination)
  - `PUT /api/admin/orders/:id/status` (Order status progression with custom note logging)
  - `GET /api/admin/foods` (Full menu inventory including out-of-stock items)
  - `PUT /api/admin/foods/:id/toggle-stock` (1-click stock availability toggle)
- [x] Built Admin frontend services and UI:
  - `client/src/services/adminService.js` (Complete API integration)
  - `client/src/components/AdminDashboardModal.jsx` with 3 comprehensive tabs:
    - **📊 Analytics & KPIs**: Revenue card, lifetime orders card, active inventory card, customer accounts card, visual order pipeline distribution pills, top-selling gourmet dishes ranking, and recent orders activity stream.
    - **📦 Order Pipeline**: Status filter tabs (All, Placed, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled), search filter, customer & delivery details, order items breakdown, and 1-click status progression toolbar (`Confirm Order`, `Send to Kitchen`, `Dispatch for Delivery`, `Mark Delivered`, `Cancel`) with optional custom note input.
    - **🍽️ Menu & Stock Inventory**: Menu search, category filter, stock filter, **1-click In Stock 🟢 / Out of Stock 🔴 toggle switch**, Add New Dish modal form, dish edit, and dish deletion.
  - Header & User Profile direct navigation shortcuts for authenticated Admin users.
- [x] Automated test suite: **53 tests across 5 test suites, 100% pass rate**.

### Phase 6: Extensible AI Food Recommendation Chatbot `[COMPLETED]`
- [x] Built AI Service with multi-factor NLU and candidate scoring (`server/services/aiService.js`):
  - Extensible provider adapter: zero-cost heuristic NLU default with plug-and-play LLM (Google Gemini / OpenAI) support.
  - Dietary restriction extraction (Pure Veg vs. Non-Veg).
  - Spice tolerance matching (Mild 0, Medium 1, Spicy 2, Extra Hot 3).
  - Price & budget ceiling detection (`under ₹350`, `less than 500`, etc.).
  - Craving & mood concepts (cheesy, crispy, healthy, comfort food, sweet dessert).
  - Active shopping cart awareness & complementary meal pairing engine (beverages & desserts tailored to cart items).
- [x] Implemented AI endpoints and controller (`server/controllers/aiController.js`, `server/routes/aiRoutes.js`):
  - `POST /api/ai/chat`: Natural language food recommendations with structured dish cards and follow-up chips.
  - `POST /api/ai/pair`: Cart-aware beverage and dessert pairing recommendations.
  - `GET /api/ai/suggestions`: Quick prompt inspiration pills.
- [x] Built frontend conversational chatbot UI:
  - `client/src/services/aiService.js`: API service connector.
  - `client/src/components/GenieChatbot.jsx`:
    - Glowing floating trigger button with unread pairing alert.
    - Expandable modern chat window with online indicator and cart item peek.
    - Quick inspiration pills carousel for 1-click prompts.
    - **In-chat interactive food recommendation cards with 1-click "Add to Cart" directly inside chat**.
    - Cart pairing quick action button (*"Pair with my cart ✨"*).
    - Follow-up recommendation chips and live typing indicator.
- [x] Automated test suite: **63 tests across 6 test suites, 100% pass rate**.

---

## ⚙️ Running the Project

### MongoDB
MongoDB runs locally on `127.0.0.1:27017` with data stored in `server/data/db/`.

### Run Backend Server:
```powershell
npm run server
# Running on http://localhost:5000
```

### Run Frontend Client:
```powershell
npm run client
# Running on http://localhost:5173
```

---

## 🧪 Testing

Run all backend integration test suites:
```powershell
npm run test:server
```

### Test Output:
```text
✔ Food Genie Admin Dashboard & Management Test Suite (10 tests)
✔ Food Genie AI Recommendation Chatbot Test Suite (10 tests)
✔ Food Genie Authentication & RBAC Test Suite (13 tests)
✔ Food Genie Catalog, Search & Filter Test Suite (13 tests)
✔ Food Genie API - Health Check Endpoint Test (6 tests)
✔ Food Genie Orders & Status Tracking Test Suite (11 tests)
ℹ tests 63 | suites 0 | pass 63 | fail 0
```

To verify the client build:
```powershell
npm run client:build
```

---

## 🗺️ Implementation Roadmap

- **Phase 1: Foundation, Environment & Health-Check** `[COMPLETED]`
- **Phase 2: Authentication & Role-Based Access Control (User & Admin)** `[COMPLETED]`
- **Phase 3: Food Catalog, Categories, Search, Filters & Shopping Cart** `[COMPLETED]`
- **Phase 4: Checkout, Orders & Real-Time Status Tracking** `[COMPLETED]`
- **Phase 5: Admin Dashboard (Food CRUD, Order Management, Metrics)** `[COMPLETED]`
- **Phase 6: Extensible AI Food Recommendation Chatbot** `[COMPLETED]`
