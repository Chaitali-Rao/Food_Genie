import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PromoBanner from './components/PromoBanner';
import FoodCatalog from './components/FoodCatalog';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import UserProfileModal from './components/UserProfileModal';
import AuthModal from './components/AuthModal';
import AdminUsersList from './components/AdminUsersList';
import AdminDashboardModal from './components/AdminDashboardModal';
import FoodDetailModal from './components/FoodDetailModal';
import GenieChatbot from './components/GenieChatbot';
import Footer from './components/Footer';
import './App.css';

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const { totalCount, grandTotal, setIsCartOpen } = useCart();

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [chatDetailFood, setChatDetailFood] = useState(null);

  const handleOrderPlaced = (newOrder) => {
    setActiveTrackingOrder(newOrder);
  };

  return (
    <div className="app-container">
      <Header
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenOrders={() => setIsOrdersHistoryOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <main className="main-content">
        {/* Engaging Culinary Hero Section */}
        <HeroSection />

        {/* Promotional Deals & Discounts Ribbon */}
        <PromoBanner />

        {/* Food Catalog with Search, Filters & Checkout */}
        <FoodCatalog />
      </main>

      {/* Floating Bottom Cart Bar (Appears when cart has items) */}
      {totalCount > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-info">
            <span className="floating-items-count">
              🛍️ {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </span>
            <span className="floating-bar-divider">•</span>
            <span className="floating-total-price">₹{grandTotal}</span>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="btn-floating-view-cart"
          >
            <span>Checkout Now</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Real-time Order Tracker Modal */}
      {activeTrackingOrder && (
        <OrderTrackerModal
          initialOrder={activeTrackingOrder}
          orderId={activeTrackingOrder._id}
          onClose={() => setActiveTrackingOrder(null)}
        />
      )}

      {/* Customer Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersHistoryOpen}
        onClose={() => setIsOrdersHistoryOpen(false)}
        onTrackOrder={(order) => setActiveTrackingOrder(order)}
      />

      <Footer />

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenOrders={() => setIsOrdersHistoryOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenAdminView={() => setIsAdminUsersOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {isAdminUsersOpen && (
        <AdminUsersList
          onClose={() => setIsAdminUsersOpen(false)}
        />
      )}

      {isAdminDashboardOpen && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}

      {/* Phase 6: Interactive Genie AI Food Recommendation Chatbot */}
      <GenieChatbot
        onOpenFoodDetail={(dish) => setChatDetailFood(dish)}
      />

      {chatDetailFood && (
        <FoodDetailModal
          food={chatDetailFood}
          onClose={() => setChatDetailFood(null)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
