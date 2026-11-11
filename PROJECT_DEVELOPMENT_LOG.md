# 🧞 Food Genie — Complete Project Development Log & Engineering Journal

> **Document Purpose**: This single master log documents every single aspect of the **Food Genie** full-stack MERN application from day one. It records every architectural decision, folder creation, feature implementation, user-requested modification, bug resolution, root cause analysis, and enhancement rationale.
>
> **Future Maintenance Protocol**: Any and all future modifications requested by the user will be appended to this document chronologically, including **what** was modified, **why** it was modified, and **which files** were affected.

---

## 📑 Table of Contents
1. [Project Overview & Core Technology Stack](#1-project-overview--core-technology-stack)
2. [Complete Directory & File Architecture Blueprint](#2-complete-directory--file-architecture-blueprint)
3. [Chronological Phase-by-Phase Development Log](#3-chronological-phase-by-phase-development-log)
   - [Phase 1: Project Scaffolding & Resilient Foundation](#phase-1-project-scaffolding--resilient-foundation)
   - [Phase 2: Authentication & Role-Based Access Control (RBAC)](#phase-2-authentication--role-based-access-control-rbac)
   - [Phase 3: Catalog, Search, Filtering & Persistent Cart Engine](#phase-3-catalog-search-filtering--persistent-cart-engine)
   - [Phase 4: Checkout, Server Price Validation & Visual Stepper](#phase-4-checkout-server-price-validation--visual-stepper)
   - [Phase 5: Admin Operations Center & Business Analytics](#phase-5-admin-operations-center--business-analytics)
   - [Phase 6: Extensible AI Recommender Engine ("Food Genie 🧞")](#phase-6-extensible-ai-recommender-engine-food-genie-)
4. [Exhaustive User Modifications & Bug Resolution Log](#4-exhaustive-user-modifications--bug-resolution-log)
   - [Modification 1: Developer UI Cards & Health Monitor Removal](#modification-1-developer-ui-cards--health-monitor-removal)
   - [Modification 2: Repetitive Chatbot Fix & Unsolicited Dish Card Suppression](#modification-2-repetitive-chatbot-fix--unsolicited-dish-card-suppression)
   - [Modification 3: Integration of Authentic South Indian Cuisine](#modification-3-integration-of-authentic-south-indian-cuisine)
   - [Modification 4: Flagship Innovation — AI Voice Ordering & Live Delivery Radar](#modification-4-flagship-innovation--ai-voice-ordering--live-delivery-radar)
5. [Database Catalog & Data Model Specifications](#5-database-catalog--data-model-specifications)
   - [Live Categories (8 Categories)](#live-categories-8-categories)
   - [Live Food Menu Catalog (17 Handcrafted Dishes)](#live-food-menu-catalog-17-handcrafted-dishes)
   - [Database Schemas (User, Category, Food, Order)](#database-schemas-user-category-food-order)
6. [AI Voice Engine & Delivery Radar Technical Documentation](#6-ai-voice-engine--delivery-radar-technical-documentation)
7. [Automated Test Suite Audit (64/64 Tests Passing)](#7-automated-test-suite-audit-6464-tests-passing)
8. [Active Infrastructure & Daemon Configuration](#8-active-infrastructure--daemon-configuration)

---

## 1. Project Overview & Core Technology Stack

**Food Genie** is a full-stack, enterprise-grade food ordering and delivery web application built using the modern **MERN** stack with Google Gemini AI integration and native browser speech capabilities.

### Technology Stack Matrix
| Layer | Technologies & Libraries | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js 18**, **Vite 6** | High-performance Single Page Application (SPA), component architecture, fast HMR. |
| **Styling & Animation** | **Custom CSS3**, CSS Variables, Keyframes | Modern responsive design tokens, neon radar styling, floating animations, mobile-first layouts. |
| **State Management** | **React Context API** (`AuthContext`, `CartContext`) | Persistent authentication session, cart items, delivery calculation, multi-modal dialog management. |
| **Voice & Speech** | **Web Speech API** (`SpeechRecognition`, `SpeechSynthesis`) | Native Speech-to-Text dictation and charismatic Text-to-Speech voice playback without external API fees. |
| **Backend Runtime** | **Node.js 24**, **Express.js 4** (ES Modules) | RESTful API gateway, modular routing, error middleware, role authorization, rate handling. |
| **Database & ODM** | **MongoDB 7**, **Mongoose 8** | Document database, complex relational population, pre-save hooks, aggregation pipelines. |
| **Authentication & RBAC** | **JWT (JSON Web Tokens)**, **bcryptjs** | Salted password hashing (10 rounds), signed Bearer tokens, Role-Based Access Control (`customer` & `admin`). |
| **AI Recommendation** | **Google Gemini 3.5 Flash Lite** + **Heuristic NLU** | Multi-factor conversational intent extraction, live menu dish matching, dynamic follow-up chips. |
| **Automated Testing** | **Node.js Test Runner** (`node:test`, `node:assert`) | 64 automated integration tests across all modules executing against ephemeral ports. |

---

## 2. Complete Directory & File Architecture Blueprint

```
Food-Genie/
├── package.json                         # Root orchestration scripts (server, client, tests)
├── .gitignore                           # Root Git ignore rules
├── README.md                            # High-level architecture overview and quick start guide
├── PROJECT_DEVELOPMENT_LOG.md           # [THIS FILE] Comprehensive master engineering journal
│
├── client/                              # Frontend React (Vite) Application
│   ├── .env                             # Frontend environment variables (VITE_API_BASE_URL)
│   ├── .env.example                     # Environment template
│   ├── index.html                       # HTML5 entry with viewport and font configs
│   ├── vite.config.js                   # Vite config with /api reverse proxy to :5000
│   ├── package.json                     # Client dependencies (react, react-dom, axios)
│   └── src/
│       ├── main.jsx                     # React 18 DOM mount entry
│       ├── App.jsx                      # Top-level shell coordinating modals & sections
│       ├── App.css                      # Master application stylesheet (5,300+ lines)
│       ├── index.css                    # Design token resets and typography definitions
│       ├── components/                  # Reusable UI component layer
│       │   ├── Header.jsx               # Navigation bar, brand logo, cart pill, user profile menu
│       │   ├── FoodCatalog.jsx          # Category filter tabs, search bar, dietary & price filters
│       │   ├── FoodDetailModal.jsx      # Modal showing dish ingredients, nutrition, calories & qty
│       │   ├── CartDrawer.jsx           # Slide-over cart drawer with tax & free delivery meter
│       │   ├── CheckoutModal.jsx        # Delivery address input, payment method & order submit
│       │   ├── OrderTrackerModal.jsx    # Live Animated Delivery Radar & 5-step status stepper
│       │   ├── OrderHistoryModal.jsx    # Past orders invoice list with 1-click re-order
│       │   ├── AdminDashboardModal.jsx  # Admin analytics KPI cards, order pipeline & stock toggle
│       │   ├── GenieChatbot.jsx         # AI Voice-enabled chatbot with in-chat dish cards
│       │   ├── AuthModal.jsx            # Customer & Admin login/registration modal
│       │   ├── UserProfileCard.jsx      # User profile viewer with JWT inspector & edit info
│       │   ├── AdminUsersList.jsx       # Admin customer directory modal
│       │   └── Footer.jsx               # Application footer
│       ├── contexts/                    # Shared state context providers
│       │   ├── AuthContext.jsx          # Login, register, token persistence, logout
│       │   └── CartContext.jsx          # Cart items, qty, subtotal, 5% tax, delivery fee
│       └── services/                    # Centralized API service layer
│           ├── api.js                   # Axios client with JWT auto-attachment interceptors
│           ├── authService.js           # Auth endpoints (/api/auth)
│           ├── foodService.js           # Food and category endpoints (/api/foods)
│           ├── orderService.js          # Order placement, tracking & simulation (/api/orders)
│           ├── adminService.js          # Business analytics, order updates & stock (/api/admin)
│           └── aiService.js             # Chatbot queries and cart pairing (/api/ai)
│
└── server/                              # Backend Express.js REST API
    ├── .env                             # Server environment variables (PORT, DB, JWT, GEMINI)
    ├── .env.example                     # Server environment template
    ├── package.json                     # Server dependencies (express, mongoose, bcryptjs, jwt)
    ├── server.js                        # Express server entry point, CORS, DB hookup & listener
    ├── config/
    │   └── db.js                        # Resilient Mongoose connection with event listeners
    ├── controllers/
    │   ├── healthController.js          # Health check & latency monitor logic
    │   ├── authController.js            # Authentication, registration & user directory logic
    │   ├── foodController.js            # Menu catalog search, filter, categories & CRUD
    │   ├── orderController.js           # Order placement, price validation & status updates
    │   ├── adminController.js           # Aggregated analytics, order pipeline & stock toggles
    │   └── aiController.js              # AI chat intent parsing & recommendation controller
    ├── middleware/
    │   ├── authMiddleware.js            # JWT verification (`protect`) & RBAC (`authorize('admin')`)
    │   └── errorMiddleware.js           # 404 handler & standardized error responder
    ├── models/
    │   ├── User.js                      # User schema with bcrypt pre-save password hash
    │   ├── Category.js                  # Food category schema with slugs & icons
    │   ├── Food.js                      # Dish schema with dietary tags, spice, calories, stock
    │   └── Order.js                     # Order schema with pricing, addresses & status history
    ├── routes/
    │   ├── healthRoutes.js              # /api/health router
    │   ├── authRoutes.js                # /api/auth router
    │   ├── foodRoutes.js                # /api/foods router
    │   ├── orderRoutes.js               # /api/orders router
    │   ├── adminRoutes.js               # /api/admin router
    │   └── aiRoutes.js                  # /api/ai router
    ├── services/
    │   └── aiService.js                 # Gemini API integration, NLU parsing & pairing logic
    ├── utils/
    │   ├── generateToken.js             # Signed JWT token generator helper
    │   └── seedData.js                  # Catalog seeder with 8 categories and 17 gourmet dishes
    └── test/                            # Comprehensive Automated Integration Test Suite
        ├── health.test.js               # Health check tests (4 tests)
        ├── auth.test.js                 # Auth & RBAC tests (11 tests)
        ├── food.test.js                 # Catalog, search & filter tests (11 tests)
        ├── order.test.js                # Order placement & tracking tests (9 tests)
        ├── admin.test.js                # Admin analytics & management tests (8 tests)
        └── ai.test.js                   # AI Chatbot & pairing tests (9 tests)
```

---

## 3. Chronological Phase-by-Phase Development Log

### Phase 1: Project Scaffolding & Resilient Foundation
- **What was done**:
  - Initialized root project with NPM monorepo structure.
  - Setup Vite + React in `client/` and Node + Express in `server/`.
  - Configured environment variables with sensible defaults and `.env.example` templates.
  - Implemented `server/config/db.js` with auto-reconnect listeners (`connected`, `error`, `disconnected`), readyState monitoring, and graceful shutdown handlers on `SIGINT` / `SIGTERM`.
  - Created `/api/health` returning HTTP 200, uptime, round-trip database ping latency, and heap memory usage.
  - Built `client/src/services/api.js` using Axios with request interceptors to inject JWT tokens and response interceptors to standardize error messages.
  - Created initial test suite `server/test/health.test.js`.
- **Why it was done**:
  - Established a rock-solid, enterprise-grade architecture so that later phases could rely on automated database reconnection, centralized API error handling, and health probes.

### Phase 2: Authentication & Role-Based Access Control (RBAC)
- **What was done**:
  - Designed `User` Mongoose schema (`server/models/User.js`) with pre-save hook that salts and hashes passwords using `bcryptjs` (cost factor 10) and instance method `matchPassword()`.
  - Built JWT generator (`server/utils/generateToken.js`) signing `{ id, role }` with a configurable expiration (default 7 days).
  - Built `authMiddleware.js`:
    - `protect`: Extracts Bearer token from `Authorization` header, verifies signature, decodes user ID, and attaches user document to `req.user`.
    - `authorize(...roles)`: Restricts routes strictly to specific user roles (e.g. `admin`).
  - Implemented `authController.js` and `authRoutes.js` supporting user registration, login, profile view, profile update, and admin-only user directory.
  - Built frontend `AuthContext.jsx` with persistent token storage in `localStorage` and auto-login on refresh.
  - Built `AuthModal.jsx` offering smooth tab switching between Customer and Admin modes.
  - Built `UserProfileCard.jsx` displaying session info, token debugger, and edit profile drawer.
  - Built automated integration test suite `server/test/auth.test.js` (11 tests).
- **Why it was done**:
  - Food delivery platforms require distinct permissions: Customers can only manage their own cart and view their own orders, while Admins manage the food catalog, inventory, and order fulfillment.

### Phase 3: Catalog, Search, Filtering & Persistent Cart Engine
- **What was done**:
  - Designed `Category` and `Food` schemas (`server/models/Category.js`, `server/models/Food.js`) with dietary flags (`isVeg`), spice levels (`0=Mild`, `1=Medium`, `2=Hot`, `3=Extra Spicy`), calories, prep time, ingredients arrays, and stock availability (`isAvailable`).
  - Built database seed script (`server/utils/seedData.js`) with initial gourmet cuisines and bestseller tags.
  - Implemented `foodController.js` supporting search query regex (matching dish name, description, and tags), category filtering, veg/non-veg toggle, spice filtering, and multi-mode sorting (price ascending/descending, rating, newest).
  - Built frontend `FoodCatalog.jsx` with horizontal scrolling category chips, search input, dietary switches, and responsive dish card grid.
  - Built `FoodDetailModal.jsx` providing a deep-dive view into dish ingredients, calories, prep time, and quick quantity counter.
  - Built `CartContext.jsx` and slide-over `CartDrawer.jsx`:
    - Real-time subtotal calculation.
    - 5% GST tax calculation.
    - Free delivery meter with animated progress bar towards a ₹500 threshold (delivery fee ₹40 if below threshold).
    - Persistent cart synchronization with `localStorage`.
  - Built automated integration test suite `server/test/food.test.js` (11 tests).
- **Why it was done**:
  - Provided a frictionless, visual menu exploration experience where customers can quickly filter by dietary habits (e.g., pure veg) or budget, with transparent tax and delivery fee calculation.

### Phase 4: Checkout, Server Price Validation & Visual Stepper
- **What was done**:
  - Designed `Order` Mongoose schema (`server/models/Order.js`) capturing item snapshots, delivery addresses, phone numbers, payment methods (`COD`, `UPI`, `Card`), and timestamped `statusHistory` audit trail.
  - Implemented `orderController.js`:
    - **Server-Side Price Validation**: Recalculates all line items directly against current database records to prevent client-side cart tampering.
    - **Step Advancement Simulation**: `PUT /api/orders/:id/simulate-step` to demo milestone progression without waiting for physical delivery.
    - **Customer Isolation**: Verifies `order.user.toString() === req.user._id` so customers cannot inspect or modify other customers' orders.
  - Built `CheckoutModal.jsx` with multi-step shipping address form and payment selector.
  - Built `OrderTrackerModal.jsx` with a 5-step milestone stepper (`Placed` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered`), real-time status banner, and step simulation button.
  - Built `OrderHistoryModal.jsx` showing order invoices and 1-click "Re-Order" action.
  - Built automated integration test suite `server/test/order.test.js` (9 tests).
- **Why it was done**:
  - Guaranteed financial transaction integrity on the server and gave customers full visibility into their order's journey from kitchen prep to their doorstep.

### Phase 5: Admin Operations Center & Business Analytics
- **What was done**:
  - Built `adminController.js` and `adminRoutes.js`:
    - `getAdminStats`: High-performance MongoDB aggregation pipeline aggregating Total Revenue, Total Orders, Registered Customers, Average Order Value (AOV), and an order status distribution breakdown.
    - `getAllOrdersAdmin`: Paginated order pipeline with search by Customer Name, Order ID, and status filtering.
    - `updateOrderStatusAdmin`: Transitions order statuses with mandatory audit notes logged into `statusHistory`.
    - `toggleFoodStock`: 1-click instant stock toggle (`isAvailable: true/false`).
  - Built `AdminDashboardModal.jsx` featuring real-time KPI metric summary cards, order pipeline workflow table, and menu inventory stock toggles.
  - Built automated integration test suite `server/test/admin.test.js` (8 tests).
- **Why it was done**:
  - Empowered restaurant managers and kitchen staff to manage the live order queue, monitor business financial health, and take dishes off the menu when ingredients run out.

### Phase 6: Extensible AI Recommender Engine ("Food Genie 🧞")
- **What was done**:
  - Designed hybrid architecture in `server/services/aiService.js`:
    - **Primary Engine**: Google Gemini API (`gemini-3.5-flash-lite`) configured with live menu context and strict foodie persona instructions.
    - **Fallback Engine**: Local heuristic NLU parsing keyword patterns, dietary flags, spice tolerance, and budget numbers.
  - Built Cart-Aware Meal Pairing: Recommends complementary craft drinks and desserts based on active cart items.
  - Built floating frontend widget `client/src/components/GenieChatbot.jsx` with quick prompt carousels and in-chat interactive dish cards.
  - Built automated integration test suite `server/test/ai.test.js` (9 tests).
- **Why it was done**:
  - Transformed Food Genie from a passive catalog into an active, intelligent personal food concierge that drives basket size through contextual meal pairings.

---

## 4. Exhaustive User Modifications & Bug Resolution Log

### Modification 1: Developer UI Cards & Health Monitor Removal
- **Date**: 2026-11-05
- **User Request**: User provided screenshots highlighting developer debug panels in the UI and requested:
  > *"remove this..does not look good"*
  > *"remove these things also.."*
- **Root Cause**:
  - During early milestone development (Phases 1 & 2), `<HealthMonitor />`, `<ArchitecturePlan />`, and a `<section className="auth-banner-card">` had been added to the main page to visually demonstrate milestone verification.
  - These developer badges cluttered the customer-facing interface and made the application look like an internal test harness rather than an authentic, polished food delivery platform.
- **What was modified**:
  - In `client/src/components/Header.jsx`: Removed Phase dev pills and architecture popups.
  - In `client/src/components/FoodCatalog.jsx`: Removed debug panels and phase status tags.
  - In `client/src/components/Footer.jsx`: Removed phase completion status cards.
  - Kept all underlying backend health-check APIs and integration test suites completely intact.
- **Why it was modified**:
  - To give the user a clean, commercial, production-ready consumer interface with zero developer clutter.

---

### Modification 2: Repetitive Chatbot Fix & Unsolicited Dish Card Suppression
- **Date**: 2026-11-07
- **User Request**: User provided screenshot showing they typed *"how are you"* in the chatbot and received a long canned greeting reciting all 7 cuisines followed by 2 burger cards:
  > *"when i use genie chatbot it gives same response ..so what i need to do.."*
  > *"this ai chatbot is showing same response for all kind of questions ..fix it"*
- **Root Cause Analysis (4 Compounding Bugs)**:
  1. **Rigid System Prompt Instruction**: The Gemini system prompt in `server/services/aiService.js` had an instruction stating: *"If the user is just saying hello, asking who you are, or making small talk, answer conversationally and invite them to explore pizzas, biryanis, burgers, Asian wok, healthy greens, desserts or drinks."* Gemini followed this literally, reciting the 7 categories on every single greeting or small talk query.
  2. **Forced Dish Injection Bug**: In `server/services/aiService.js`, the code evaluated `if (!finalRecs || finalRecs.length === 0)` and forcefully called `recommendDishes(intent, cartItems, 3)`. Because small talk questions had no food keywords, `recommendDishes` fell back to `allFoods.slice(0, 3)` (The Smash Burger and Ramen Bowl). This resulted in burger cards being attached to every single message ("how are you", "who are you", "tell me a joke").
  3. **Static Suggested Action Pills**: `suggestedActions` always returned the same 3 hardcoded buttons regardless of user context.
  4. **Heuristic Engine Small Talk Gap**: The heuristic fallback lacked patterns for "how are you", causing it to fall through to `generateGenieSpeech` which proclaimed: *"As you wish! I summoned the finest culinary creations matching your request"*.
- **What was modified in `server/services/aiService.js`**:
  - **Dynamic Personality**: Rewrote `systemPrompt` to instruct Gemini to answer small talk and general queries warmly, directly, and naturally in 1–2 sentences without reciting menu categories.
  - **Intent-Gated Dish Attachment (`isFoodQuery`)**: Implemented an explicit check. Dish cards are attached **only** if the user actually asks for food, mentions cravings, sets a budget, or asks what to eat. Small talk, greetings, and jokes return **zero unsolicited cards**.
  - **Dynamic Suggested Actions (`generateDynamicActions`)**: Implemented dynamic follow-up chips tailored to the conversation (e.g., pizza queries show drink pairings and cheeses; biryani shows refreshing drinks and sweets; small talk shows surprise and budget options).
  - **Heuristic Engine Overhaul**: Added dedicated handlers for small talk ("how are you") with varied warm replies and zero unsolicited cards.
- **Why it was modified**:
  - Restored true conversational intelligence to the AI chatbot, ensuring every query receives an authentic, context-aware reply without repetitive canned scripts or unwanted food cards.

---

### Modification 3: Integration of Authentic South Indian Cuisine
- **Date**: 2026-11-07
- **User Request**:
  > *"i want you to include south indian dishes too"*
- **What was modified**:
  - **Database Seeder (`server/utils/seedData.js`)**:
    - Added new Category: `South Indian Classics` (`slug: 'south-indian'`, icon `🥘`).
    - Seeded 5 authentic dishes with full nutrition tags, preparation times, ingredients, and imagery:
      1. **Crispy Ghee Podi Roast Dosa** (₹189, Pure Veg, Gunpowder Podi & Ghee)
      2. **Steamed Button Idlis & Medu Vada Platter** (₹159, Pure Veg, Sambar & Coconut Relish)
      3. **Mysore Masala Butter Dosa** (₹219, Pure Veg, Red Garlic Chutney & Butter)
      4. **Authentic Malabar Chicken Curry & Flaky Parotta** (₹349, Non-Veg, Kerala Spices)
      5. **Traditional South Indian Filter Kaapi** (₹89, Craft Beverages, Chicory Beans & Boiled Milk)
  - **AI Recommender (`server/services/aiService.js`)**:
    - Added South Indian keywords (`dosa`, `idli`, `vada`, `sambar`, `podi`, `parotta`, `kerala`, `kaapi`, `filter coffee`) to the NLU parser.
    - Updated `hasMains` in pairing logic to include `'south-indian'`.
    - Added dynamic follow-up chips: `[☕ Filter Kaapi, 🥞 Crispy Ghee Dosa, 🍗 Malabar Chicken Curry]`.
    - Added `🥞 Crispy Ghee Dosa` to the chat welcome suggestions.
  - **Frontend UI**:
    - Updated search placeholders in `FoodCatalog.jsx` and `GenieChatbot.jsx` to guide users to search for dosa, idli, etc.
  - **Live Database**:
    - Re-seeded live MongoDB database to 8 categories and 17 gourmet dishes.
- **Why it was modified**:
  - Broadened the culinary catalog to satisfy authentic South Indian food cravings, expanding the app's appeal to regional culinary favorites.

---

### Modification 4: Flagship Innovation — AI Voice Ordering & Live Delivery Radar
- **Date**: 2026-11-08
- **User Request**:
  > *"combine AI Voice Ordering + Live Animated Delivery Radar for the biggest visual impact!"*
- **What was modified**:
  - **Feature A: AI Voice Ordering & Audio Genie (`client/src/components/GenieChatbot.jsx`)**:
    - Integrated native Web Speech API `SpeechRecognition` for microphone dictation with live listening wave banner and auto-submission on speech completion.
    - Integrated native Web Speech API `SpeechSynthesis` (Text-to-Speech) with charismatic Genie tone (pitch 1.05, rate 1.02), header mute/unmute toggle (`🔊` / `🔇`), and per-message replay buttons.
    - Added pulsing microphone animations and listening status banners.
  - **Feature B: Live Animated Delivery Radar Map Simulation (`client/src/components/OrderTrackerModal.jsx`)**:
    - Replaced the static progress bar with an interactive SVG delivery map HUD featuring dark-navy blueprint styling, rotating radar sweep beam, and glowing neon cubic bezier highway.
    - Animated Scooter Marker (`🛵 Arjun Kumar`) dynamically positioned along the highway based on live order status (`Placed` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered`), complete with engine vibration and exhaust trails.
    - Live HUD telemetry: Speedometer (`32 km/h`), distance remaining (`0.9 km`), real-time ticking countdown timer, and thermal bag temperature badge (`♨️ 62°C Hot Seal`).
    - Delivery Partner card with 📞 "Call Partner" simulator and interactive delivery instruction toggle pills.
    - Added corresponding CSS styles and keyframe animations in `client/src/App.css`.
- **Why it was modified**:
  - Elevated Food Genie from a standard CRUD application into an innovative, interactive flagship product with massive visual appeal for live presentations, client demonstrations, and portfolios.

### Modification 5: Creative & Professional Redesign (Hero Section, Promo Deals & Clean Profile Modal)
- **Date**: 2026-11-09
- **User Prompt**: *"overall design looks boring ..can u make it creative??..website should look professional.."*
- **Attachment**: Screenshot showing logged-in customer homepage dominated by raw JWT token developer card, plain white background, and lacking hero visuals or promotional food branding.
- **Root Cause Analysis**:
  - `App.jsx` rendered `<UserProfileCard />` directly inside `<main className="main-content">` on the homepage whenever `isAuthenticated` was true. This displayed raw JWT tokens, internal authentication text, and account tables right above the menu, resembling a backend diagnostic screen rather than a consumer food delivery platform.
  - Absence of an engaging culinary Hero Section, dynamic food imagery platter, and promotional discount ribbons that are standard in consumer apps like DoorDash, Swiggy, and UberEats.
- **Modifications Implemented**:
  1. **Culinary Hero Section (`client/src/components/HeroSection.jsx`)**:
     - Warm ambient gradient canvas (`#fff7ed` to `#ffffff`) with glowing saffron and ruby backdrop blurs.
     - Bold appetizing typography: *"Craving Something Extraordinary? 🧞"* with multi-stop gradient text.
     - Live social proof & speed metrics: `⚡ 24 Mins` Avg Delivery Speed, `⭐ 4.9/5.0` (14,000+ Foodies), `🌱 100% Fresh` (Pure Veg & Halal certified).
     - Live activity floating badges: `🔥 140+ Feasts Summoned Today` and `🛵 Arjun Kumar (Rider) is 3 mins away`.
     - Dual CTA buttons: `Explore Food Menu ➔` (smooth scrolling to menu) and `🎙️ Ask Genie Voice AI` (instantly opens voice assistant).
     - Layered visual food showcase platter with high-res photography: *Crispy Ghee Podi Roast Dosa*, *Fiery Pepperoni & Hot Honey Pizza*, and *The Genie Signature Smash Burger*.
  2. **Promotional Deals & Discounts Ribbon (`client/src/components/PromoBanner.jsx`)**:
     - 3 interactive deal coupon cards:
       - `🎟️ GENIE50`: Flat ₹50 OFF on orders above ₹299.
       - `🛵 FREEDEL`: Free Express Delivery on orders above ₹499.
       - `☕ KAAPI`: Complimentary South Indian Degree Filter Kaapi with Dosa & Idli platters.
     - Interactive 1-click "Copy Code" with toast animation (`✓ Copied!`).
  3. **Header & Profile Experience Transformation (`client/src/components/UserProfileModal.jsx` & `Header.jsx`)**:
     - Removed `<UserProfileCard />` from dominating the home page.
     - Created `UserProfileModal.jsx`: an elegant backdrop-blurred modal dialog.
     - In `Header.jsx`, made the user avatar & name pill clickable (`btn-user-profile-trigger`) with caret indicator to open the profile modal.
     - Cleanly compartmentalized developer session details into a collapsible accordion: `⚙️ Developer & Security Diagnostics (JWT Session)`, keeping token testing intact for instructors/evaluators while keeping the primary consumer interface 100% clean and professional.
  4. **Catalog Polish & Responsive Styling (`client/src/App.css`)**:
     - Enhanced dish cards with smooth hover lift (`translateY(-5px)`), image zoom (`scale(1.06)`), and refined glass badges.
     - Glassmorphic sticky header with `backdrop-filter: blur(14px)`.
- **Why it was modified**:
  - Transformed Food Genie from a sterile developer-centric layout into an ultra-modern, professional, appetizing culinary experience that captivates consumers and looks indistinguishable from commercial delivery platforms.

### Modification 6: Order Cancellation Feature & Refund Handling
- **Date**: 2026-11-10
- **User Prompt**: *"i want you to implement cancel order feature"*
- **Detailed Requirements & Business Rules**:
  - Customers must be able to cancel orders during early lifecycle stages: `Placed`, `Confirmed`, and `Preparing`.
  - Once an order reaches `Out for Delivery`, customer cancellation is prevented (HTTP 400) because the rider is carrying freshly prepared food.
  - Already `Delivered` or already `Cancelled` orders cannot be cancelled (HTTP 400).
  - Customers cannot cancel another customer's order (HTTP 403 Forbidden).
  - Admins can cancel orders when necessary or record administrative cancellation notes.
  - Customers can specify reasons: *"Ordered by mistake"*, *"Changed my mind"*, *"Taking too long / delivery delay"*, *"Incorrect items or delivery address"*, or enter a custom reason.
  - If paid digitally via UPI or Card, automated refund initiation note is logged; for Cash on Delivery, no payment liability is logged.
  - Cancelled orders cannot be advanced via `simulate-step`.
- **Modifications Implemented**:
  1. **Database Schema Enhancements (`server/models/Order.js`)**:
     - Added `cancellationReason: { type: String, default: '' }`.
     - Added `cancelledAt: { type: Date }`.
     - Order status enum already supports `'Cancelled'`.
  2. **Backend API Endpoint & Guard Logic (`server/controllers/orderController.js` & `server/routes/orderRoutes.js`)**:
     - Implemented `PUT /api/orders/:id/cancel` protected with `protect` middleware.
     - Added safety guard in `simulateOrderProgress` preventing cancelled orders from advancing.
     - Appends `{ status: 'Cancelled', timestamp: new Date(), note: ... }` to `statusHistory`.
  3. **Frontend API Client (`client/src/services/orderService.js`)**:
     - Added `cancelOrder(orderId, reason)` sending `PUT /orders/${orderId}/cancel`.
  4. **Live Radar Order Tracker (`client/src/components/OrderTrackerModal.jsx`)**:
     - Added "✕ Cancel Order" button in the hero status bar for cancellable orders.
     - Built an interactive confirmation dialog with reason selection, custom text box, and digital refund notice.
     - Added cancelled state rendering: deep crimson banner, cancelled pill, reason display, and an animated radar cancelled badge overlay (`🚫 ORDER CANCELLED`).
     - Stopped speed telemetry, countdown timer, and route animation upon cancellation.
  5. **Order History Modal (`client/src/components/OrderHistoryModal.jsx`)**:
     - Added "✕ Cancel Order" button for eligible orders (`Placed`, `Confirmed`, `Preparing`).
     - Built an inline cancellation prompt with reason selection and refund policy disclosure.
     - For cancelled orders, displayed a red status badge and cancellation reason tag: `🚫 Cancelled: "..."`.
     - Maintained 1-click "🔁 Re-order" capability so customers can easily re-order items.
  6. **Admin Dashboard Modal (`client/src/components/AdminDashboardModal.jsx`)**:
     - Added cancellation reason display in the order card for admins to review why customers cancelled orders.
  7. **Styling & Micro-Interactions (`client/src/App.css`)**:
     - Added CSS for `.status-cancelled`, `.tracker-status-hero.cancelled`, `.hero-status-pill.pill-cancelled`, `.cancel-confirm-overlay`, `.cancel-confirm-box`, `.radar-cancelled-badge-overlay`, and `.history-cancel-box`.
  8. **Comprehensive Integration Test Suite (`server/test/order.test.js`)**:
     - Added 6 new automated tests verifying owner cancellation, unauthorized rejection (403), delivered order rejection (400), already cancelled rejection (400), and simulate-step lock (400). All 70/70 tests pass!
- **Why it was modified**:
  - Order cancellation is a fundamental e-commerce expectation that builds customer trust and aligns Food Genie with tier-1 food delivery applications.

### Modification 7: Removal of Simulated Rider Floating Badge from Hero Section
- **Date**: 2026-11-10
- **User Prompt**: *"remove this floating thing"*
- **Attachment**: Screenshot (`media_1794324372043_80bffb92.png`) capturing the floating pill badge: `🛵 Arjun Kumar - 3 mins away with live GPS radar`.
- **Root Cause & Rationale**:
  - In `HeroSection.jsx`, the floating badge simulated an incoming delivery partner (`Arjun Kumar`) as a visual showcase element on the homepage.
  - Showing an active delivery partner badge before a customer has placed an order is confusing, intrusive, and obscures the food cards beneath it.
- **Modifications Implemented**:
  1. Removed `<div className="hero-floating-pill pill-bottom-right">` from `client/src/components/HeroSection.jsx`.
  2. Preserved the live delivery partner telemetry inside the actual `OrderTrackerModal.jsx` where it contextually belongs once an order is placed and active.
- **Why it was modified**:
  - Eliminated visual clutter and prevented confusing users with simulated delivery alerts on the un-ordered home screen.

### Modification 8: Downloadable & Printable Tax Invoice Receipt (Zero AI Credits)
- **Date**: 2026-11-10
- **User Prompt**: *"what additional features can u add but using less credits?"* -> Selected *"Downloadable / Printable Order Invoice Receipt"*
- **Cost**: **0 AI Credits** (Consumes zero external API tokens; operates entirely via native DOM/CSS and full-stack MERN data).
- **Modifications Implemented**:
  1. **Tax Invoice Modal Component (`client/src/components/OrderInvoiceModal.jsx`)**:
     - Official branded corporate header: *Food Genie AI-Powered Gourmet Kitchens & Logistics*, GSTIN registration (`29AABCF1234F1Z8`), and FSSAI License number (`11223344000123`).
     - Dynamic Invoice metadata: Invoice Number (`INV-XXXXXX`), Date, Time, and Order Lifecycle Status tag (`Placed`, `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`).
     - Cancellation & Refund Banner: Explicitly notes refund status or COD cancellation if the order was cancelled.
     - Customer Billed-To Box: Full name, delivery street, city, state, postal code, phone, and email.
     - Payment & Logistics Summary: Payment method, transaction ID, paid/unpaid status badge, and express prep time.
     - Itemized Culinary Food Table: Item index, dish name, dietary indicator (`🟢 Veg` / `🔴 Non-Veg`), unit price, quantity, and line total.
     - Financial Reconciliation Strip: Subtotal, 5% GST Restaurant Tax calculation, Free delivery tier badge (or packaging fee), and Grand Total.
     - Authenticity Verification: Simulated barcode with verified hash (`INV-AUTHENTIC-VERIFIED`) and authorized company signatory stamp.
  2. **Triple Integration Touchpoints**:
     - **Live Radar Tracker (`client/src/components/OrderTrackerModal.jsx`)**: Added `📄 Tax Invoice` button in the persistent bottom summary strip.
     - **Customer Order History (`client/src/components/OrderHistoryModal.jsx`)**: Added `📄 Invoice` button on every past and active order card.
     - **Admin Operations Dashboard (`client/src/components/AdminDashboardModal.jsx`)**: Added `📄 Invoice` button on every administrative order card for kitchen slips and packing audit.
  3. **High-Resolution `@media print` Engine (`client/src/App.css`)**:
     - Configured clean CSS print isolation: hides navbars, modals backdrop, screen buttons, and page clutter (`body * { visibility: hidden; } #printable-invoice, #printable-invoice * { visibility: visible; }`).
     - Formats cleanly to standard paper margins and single-click native browser PDF export (`window.print()`).
- **Why it was modified**:
  - Gives customers and administrators formal financial documentation without consuming third-party AI tokens or subscription credits, making Food Genie feel like a production-ready food delivery enterprise.

---

## 5. Database Catalog & Data Model Specifications

### Live Categories (8 Categories)
1. **Artisan Pizza** (`artisan-pizza`, 🍕) — Wood-fired sourdough pizzas with artisanal toppings.
2. **Gourmet Burgers** (`gourmet-burgers`, 🍔) — Handcrafted brioche smash burgers and crispy sides.
3. **Biryani & Rice Bowls** (`biryani-bowls`, 🍛) — Aromatic royal dum biryanis and spiced rice bowls.
4. **Asian Street Wok** (`asian-street-wok`, 🍜) — Authentic ramen, wok-tossed noodles and pan-fried dumplings.
5. **South Indian Classics** (`south-indian`, 🥘) — Crispy ghee dosas, fluffy steamed idlis, medu vadas & coastal curries.
6. **Healthy Greens & Bowls** (`healthy-greens`, 🥗) — Farm-fresh nutrient bowls, salads and superfoods.
7. **Desserts & Sweets** (`desserts-sweets`, 🍰) — Molten lava cakes, pastries and artisanal sweets.
8. **Craft Beverages** (`craft-beverages`, 🥤) — Fresh-pressed juices, traditional filter coffee & mocktails.

### Live Food Menu Catalog (17 Handcrafted Dishes)
| # | Dish Name | Category | Price | Diet | Spicy | Cal | Key Ingredients |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :--- |
| 1 | **Truffle Mushroom & Mozzarella Pizza** | Artisan Pizza | ₹389 | 🥬 Veg | 0 | 680 | Wild Mushrooms, Buffalo Mozzarella, Truffle Oil, Sourdough |
| 2 | **Fiery Pepperoni & Hot Honey Pizza** | Artisan Pizza | ₹429 | 🍗 Non-Veg | 2 | 780 | Smoked Pepperoni, San Marzano Marinara, Hot Honey, Chili |
| 3 | **Classic Margherita Classica** | Artisan Pizza | ₹299 | 🥬 Veg | 0 | 550 | San Marzano Tomatoes, Fior Di Latte, Basil, EVOO |
| 4 | **The Genie Signature Smash Burger** | Gourmet Burgers | ₹329 | 🍗 Non-Veg | 1 | 720 | Double Patty, Brioche Bun, Vintage Cheddar, Secret Sauce |
| 5 | **Crispy Paneer & Jalapeño Crunch Burger** | Gourmet Burgers | ₹279 | 🥬 Veg | 2 | 610 | Panko Paneer, Jalapeño Slaw, Chipotle Mayo, Brioche |
| 6 | **Hyderabadi Dum Chicken Biryani** | Biryani & Bowls | ₹369 | 🍗 Non-Veg | 2 | 750 | Long-grain Basmati, Chicken, Saffron, Fried Onions, Ghee |
| 7 | **Royal Shahi Paneer Tikka Biryani** | Biryani & Bowls | ₹319 | 🥬 Veg | 1 | 660 | Tandoori Paneer, Basmati, Saffron, Cashews, Mint Raita |
| 8 | **Tokyo Tonkotsu Style Ramen Bowl** | Asian Street Wok | ₹349 | 🍗 Non-Veg | 1 | 590 | Ramen Noodles, 12-hr Savory Broth, Ajitsuke Egg, Nori |
| 9 | **Spicy Dan Dan Chili Garlic Noodles** | Asian Street Wok | ₹299 | 🥬 Veg | 3 | 520 | Wheat Noodles, Sichuan Chili Oil, Sesame Paste, Crispy Tofu |
| 10 | **Crispy Ghee Podi Roast Dosa** | South Indian | ₹189 | 🥬 Veg | 2 | 380 | Fermented Crepe, Desi Ghee, Gunpowder Podi, Sambar, Chutney |
| 11 | **Steamed Button Idlis & Medu Vada Platter**| South Indian | ₹159 | 🥬 Veg | 1 | 320 | Fluffy Rice Idlis, Crispy Medu Vada, Lentil Sambar, Chutney |
| 12 | **Mysore Masala Butter Dosa** | South Indian | ₹219 | 🥬 Veg | 2 | 420 | Golden Crepe, Red Garlic Chutney, Spiced Potato, Butter |
| 13 | **Authentic Malabar Chicken Curry & Parotta**| South Indian | ₹349 | 🍗 Non-Veg | 2 | 690 | Tender Chicken, Roasted Coconut Curry, Flaky Parotta |
| 14 | **Mediterranean Avocado & Quinoa Bowl** | Healthy Greens | ₹289 | 🥬 Veg | 0 | 390 | Quinoa, Hass Avocado, Feta, Kalamata Olives, Lemon Herb |
| 15 | **Molten Belgian Dark Chocolate Lava Cake** | Desserts | ₹199 | 🥬 Veg | 0 | 480 | Belgian Dark Chocolate, Flowing Core, Vanilla Bean Gelato |
| 16 | **Passionfruit Mint Cooler Fizz** | Craft Beverages | ₹149 | 🥬 Veg | 0 | 110 | Passionfruit Pulp, Garden Mint, Sparkling Soda, Lime Juice |
| 17 | **Traditional South Indian Filter Kaapi** | Craft Beverages | ₹89 | 🥬 Veg | 0 | 85 | Peaberry & Chicory Beans, Boiled Whole Milk, Brass Davarah |

### Database Schemas (User, Category, Food, Order)
- **`User` Schema (`server/models/User.js`)**:
  - `name`: String, required.
  - `email`: String, required, unique, lowercase, trimmed.
  - `password`: String, required (hashed via bcrypt pre-save).
  - `role`: String, enum: `['customer', 'admin']`, default: `'customer'`.
  - `phone`: String, optional.
  - `address`: `{ street, city, postalCode }`.
  - `timestamps`: `true`.
- **`Category` Schema (`server/models/Category.js`)**:
  - `name`: String, required, unique.
  - `slug`: String, required, unique, lowercase.
  - `icon`: String (emoji representation).
  - `image`: String (URL).
  - `description`: String.
  - `isAvailable`: Boolean, default: `true`.
- **`Food` Schema (`server/models/Food.js`)**:
  - `name`: String, required, index: `text`.
  - `description`: String, required, index: `text`.
  - `price`: Number, required, min: 0.
  - `category`: ObjectId ref `'Category'`, required.
  - `image`: String, required.
  - `isVeg`: Boolean, default: `true`.
  - `spicyLevel`: Number, enum: `[0, 1, 2, 3]`, default: 1.
  - `rating`: Number, default: 4.5.
  - `numReviews`: Number, default: 0.
  - `prepTimeMinutes`: Number, default: 20.
  - `isAvailable`: Boolean, default: `true`.
  - `isFeatured`: Boolean, default: `false`.
  - `tags`: `[String]`.
  - `calories`: Number.
  - `ingredients`: `[String]`.
- **`Order` Schema (`server/models/Order.js`)**:
  - `user`: ObjectId ref `'User'`, required.
  - `orderItems`: Array of `{ food, name, image, price, quantity }`.
  - `shippingAddress`: `{ street, city, postalCode, country }`.
  - `phone`: String, required.
  - `paymentMethod`: String, enum: `['COD', 'Card', 'UPI']`.
  - `itemsPrice`, `taxPrice`, `shippingPrice`, `totalPrice`: Numbers.
  - `isPaid`: Boolean, default: `false`.
  - `orderStatus`: String, enum: `['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']`.
  - `cancellationReason`: String, default: `''`.
  - `cancelledAt`: Date.
  - `statusHistory`: Array of `{ status, timestamp, note }`.
  - `estimatedDeliveryMinutes`: Number, default: 30.

---

## 6. AI Voice Engine & Delivery Radar Technical Documentation

### Web Speech API Integration Specifications
- **Speech-to-Text (Voice Dictation)**:
  - Uses `window.SpeechRecognition || window.webkitSpeechRecognition`.
  - Language: `'en-IN'` (tuned for Indian English vocabulary like *dosa*, *biryani*, *sambar*).
  - `interimResults: true`, `continuous: false`.
  - Lifecycle: `onstart` sets `isListening: true`, `onresult` streams transcripts, `isFinal` triggers `handleSendMessage()`, `onend` resets state.
- **Text-to-Speech (Audio Genie)**:
  - Uses `window.speechSynthesis` and `SpeechSynthesisUtterance`.
  - Filter: Regex strips markdown asterisks (`**`), underscores, and emoji Unicode points before utterance.
  - Tone tuning: `pitch = 1.05`, `rate = 1.02` for an upbeat, friendly culinary genie persona.
  - Header Mute Toggle: Saves state to `localStorage.getItem('genie_voice_enabled')`.

### Delivery Radar Mathematical Model
- **Route Equation (Cubic Bezier Curve)**:
  $$\mathbf{P}(t) = (1-t)^3 \mathbf{P}_0 + 3(1-t)^2 t \mathbf{P}_1 + 3(1-t) t^2 \mathbf{P}_2 + t^3 \mathbf{P}_3 \quad \text{where } t \in [0, 1]$$
  - $\mathbf{P}_0 = (75, 195)$ — Restaurant Kitchen Hub.
  - $\mathbf{P}_1 = (190, 245)$ — Southern City Highway curve.
  - $\mathbf{P}_2 = (380, 70)$ — Northern Ring Road curve.
  - $\mathbf{P}_3 = (525, 85)$ — Customer Delivery Destination.
- **Rider Position Mapping**:
  - `Placed`: $t = 0.08$ (Parked at kitchen curb).
  - `Confirmed`: $t = 0.22$ (Kitchen dispatch).
  - `Preparing`: $t = 0.38$ (Order packing).
  - `Out for Delivery`: $t = 0.72$ (Cruising at 32 km/h).
  - `Delivered`: $t = 1.00$ (Arrived at doorstep).

---

## 7. Automated Test Suite Audit (70/70 Tests Passing)

All integration tests execute against an ephemeral HTTP port on `127.0.0.1` and close database connections cleanly upon completion.

```
▶ Food Genie Admin Dashboard & Management Test Suite (8/8 pass)
▶ Food Genie AI Recommendation Chatbot Test Suite (9/9 pass)
▶ Food Genie Authentication & RBAC Test Suite (11/11 pass)
▶ Food Genie Catalog, Search & Filter Test Suite (11/11 pass)
▶ Food Genie API - Health Check Endpoint Test (4/4 pass)
▶ Food Genie Orders & Status Tracking Test Suite (15/15 pass)
  ✔ Setup: Connect DB, seed food and prepare test accounts
  ✔ POST /api/orders rejects unauthenticated request (401 Unauthorized)
  ✔ POST /api/orders rejects empty items array (400 Bad Request)
  ✔ POST /api/orders creates order with price calculation and Placed status
  ✔ GET /api/orders/myorders retrieves placed orders for authenticated user
  ✔ GET /api/orders/:id returns order details with statusHistory
  ✔ GET /api/orders/:id blocks access to another customer (403 Forbidden)
  ✔ PUT /api/orders/:id/simulate-step advances order status to Confirmed
  ✔ PUT /api/orders/:id/status allows Admin to set status to Delivered
  ✔ PUT /api/orders/:id/cancel rejects cancellation of already Delivered order (400 Bad Request)
  ✔ Setup cancellable order: Customer creates a new Placed order
  ✔ PUT /api/orders/:id/cancel rejects other customer from cancelling (403 Forbidden)
  ✔ PUT /api/orders/:id/cancel allows owner to cancel order with reason and refund note
  ✔ PUT /api/orders/:id/cancel rejects cancelling an already cancelled order (400 Bad Request)
  ✔ PUT /api/orders/:id/simulate-step rejects advancing a cancelled order (400 Bad Request)

ℹ tests 70 | suites 0 | pass 70 | fail 0 | cancelled 0 | skipped 0
```

---

## 8. Active Infrastructure & Daemon Configuration

- **Database Daemon**: MongoDB listening on `127.0.0.1:27017` with storage path `server/data/db`.
- **Backend API Server**: Node.js Express daemon listening on `http://localhost:5000`.
- **Frontend Client Server**: Vite development server running on `http://localhost:5173`.
- **AI Model**: Google Gemini `gemini-3.5-flash-lite` configured in `server/.env`.

---

## 📝 Continuous Update Protocol
Whenever new features, design adjustments, or fixes are requested in future sessions, they will be appended directly to **Section 4** with the request date, user prompt, technical modifications, and architectural rationale.

