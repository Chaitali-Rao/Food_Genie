import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import foodService from '../services/foodService';
import OrderInvoiceModal from './OrderInvoiceModal';

export const AdminDashboardModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'orders' | 'menu'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Invoice State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Analytics state
  const [stats, setStats] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersFilterStatus, setOrdersFilterStatus] = useState('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusNotes, setStatusNotes] = useState({}); // orderId -> custom note string
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Menu state
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [togglingStockId, setTogglingStockId] = useState(null);
  const [deletingFoodId, setDeletingFoodId] = useState(null);

  // Dish Form State
  const initialDishForm = {
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isVeg: true,
    spicyLevel: 1,
    prepTimeMinutes: 20,
    calories: 350,
    ingredients: '',
  };
  const [dishForm, setDishForm] = useState(initialDishForm);
  const [savingDish, setSavingDish] = useState(false);

  // Auto-dismiss feedback message after 4s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, ordersRes, foodsRes, catRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllOrders({ limit: 50 }),
        adminService.getAllFoods(),
        foodService.getCategories(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (foodsRes.success) setFoods(foodsRes.data || []);
      if (catRes.success) setCategories(catRes.categories || []);

      if (isRefresh) {
        setFeedback({ type: 'success', message: 'Dashboard metrics and inventory refreshed!' });
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load administration data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen, loadDashboardData]);

  if (!isOpen) return null;

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const customNote = statusNotes[orderId] || '';
    setUpdatingOrderId(orderId);
    try {
      const res = await adminService.updateOrderStatus(orderId, newStatus, customNote);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.data : ord))
        );
        // Clear note
        setStatusNotes((prev) => ({ ...prev, [orderId]: '' }));
        setFeedback({
          type: 'success',
          message: `Order #${orderId.slice(-6).toUpperCase()} transitioned to "${newStatus}"`,
        });
        // Refresh analytics stats quietly
        const statsRes = await adminService.getStats();
        if (statsRes.success) setStats(statsRes.stats);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update order status',
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle 1-Click Stock Toggle
  const handleToggleStock = async (foodId) => {
    setTogglingStockId(foodId);
    try {
      const res = await adminService.toggleFoodStock(foodId);
      if (res.success) {
        setFoods((prev) =>
          prev.map((f) => (f._id === foodId ? res.data : f))
        );
        setFeedback({
          type: 'success',
          message: res.message || 'Dish stock availability updated!',
        });
        // Update stats
        if (stats) {
          setStats((prev) => ({
            ...prev,
            activeFoods: res.data.isAvailable ? prev.activeFoods + 1 : prev.activeFoods - 1,
          }));
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle dish availability',
      });
    } finally {
      setTogglingStockId(null);
    }
  };

  // Open Dish Form for Creation
  const handleOpenCreateDish = () => {
    setEditingFoodId(null);
    setDishForm({
      ...initialDishForm,
      category: categories.length > 0 ? categories[0]._id : '',
    });
    setIsDishFormOpen(true);
  };

  // Open Dish Form for Editing
  const handleOpenEditDish = (food) => {
    setEditingFoodId(food._id);
    setDishForm({
      name: food.name || '',
      description: food.description || '',
      price: food.price || '',
      category: food.category?._id || food.category || '',
      image: food.image || '',
      isVeg: food.isVeg ?? true,
      spicyLevel: food.spicyLevel ?? 1,
      prepTimeMinutes: food.prepTimeMinutes || 20,
      calories: food.calories || 350,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : '',
    });
    setIsDishFormOpen(true);
  };

  // Submit Dish Form (Create or Update)
  const handleSubmitDish = async (e) => {
    e.preventDefault();
    setSavingDish(true);

    const payload = {
      name: dishForm.name.trim(),
      description: dishForm.description.trim(),
      price: Number(dishForm.price),
      category: dishForm.category,
      image: dishForm.image.trim(),
      isVeg: Boolean(dishForm.isVeg),
      spicyLevel: Number(dishForm.spicyLevel),
      prepTimeMinutes: Number(dishForm.prepTimeMinutes),
      calories: Number(dishForm.calories),
      ingredients: dishForm.ingredients
        ? dishForm.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingFoodId) {
        // Update existing food
        const res = await adminService.updateFood(editingFoodId, payload);
        if (res.success) {
          setFoods((prev) =>
            prev.map((f) => (f._id === editingFoodId ? res.food : f))
          );
          setFeedback({ type: 'success', message: `Dish "${res.food.name}" updated successfully!` });
          setIsDishFormOpen(false);
        }
      } else {
        // Create new food
        const res = await adminService.createFood(payload);
        if (res.success) {
          setFoods((prev) => [res.food, ...prev]);
          setFeedback({ type: 'success', message: `Dish "${res.food.name}" added to menu!` });
          setIsDishFormOpen(false);
          if (stats) {
            setStats((prev) => ({
              ...prev,
              totalDishes: prev.totalDishes + 1,
              activeFoods: prev.activeFoods + 1,
            }));
          }
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save food dish',
      });
    } finally {
      setSavingDish(false);
    }
  };

  // Delete Dish
  const handleDeleteDish = async (foodId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" from the menu?`)) {
      return;
    }

    setDeletingFoodId(foodId);
    try {
      const res = await adminService.deleteFood(foodId);
      if (res.success) {
        setFoods((prev) => prev.filter((f) => f._id !== foodId));
        setFeedback({ type: 'success', message: `"${dishName}" removed from menu` });
        if (stats) {
          setStats((prev) => ({
            ...prev,
            totalDishes: Math.max(0, prev.totalDishes - 1),
          }));
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete dish',
      });
    } finally {
      setDeletingFoodId(null);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      ordersFilterStatus === 'All' || ord.orderStatus === ordersFilterStatus;
    const matchesQuery =
      !orderSearchQuery ||
      ord._id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.user?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.deliveryAddress?.city?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.deliveryAddress?.phoneNumber?.includes(orderSearchQuery);
    return matchesStatus && matchesQuery;
  });

  // Filtered Foods
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      !foodSearchQuery ||
      food.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(foodSearchQuery.toLowerCase());

    const matchesCategory =
      foodCategoryFilter === 'All' ||
      food.category?._id === foodCategoryFilter ||
      food.category?.name === foodCategoryFilter ||
      food.category === foodCategoryFilter;

    const matchesStock =
      stockFilter === 'All'
        ? true
        : stockFilter === 'In Stock'
        ? food.isAvailable
        : !food.isAvailable;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Helper for Order Status styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Placed':
        return 'badge-status-placed';
      case 'Confirmed':
        return 'badge-status-confirmed';
      case 'Preparing':
        return 'badge-status-preparing';
      case 'Out for Delivery':
        return 'badge-status-out';
      case 'Delivered':
        return 'badge-status-delivered';
      case 'Cancelled':
        return 'badge-status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="modal-backdrop admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
      >
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-title-box">
            <div className="admin-badge-icon">🛡️</div>
            <div>
              <h2 id="admin-dialog-title" className="admin-modal-title">
                Food Genie Management Center
              </h2>
              <p className="admin-modal-subtitle">
                Business Intelligence, Live Order Pipeline & Menu Inventory Control
              </p>
            </div>
          </div>
          <div className="admin-header-actions">
            <button
              onClick={() => loadDashboardData(true)}
              className={`btn-admin-refresh ${refreshing ? 'rotating' : ''}`}
              title="Refresh all metrics and live orders"
              disabled={refreshing}
            >
              🔄 {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={onClose}
              className="admin-close-btn"
              aria-label="Close Admin Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`admin-feedback-banner ${feedback.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
            <span>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="feedback-dismiss">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <span>📊 Analytics & KPIs</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <span>📦 Order Pipeline</span>
            {orders.length > 0 && (
              <span className="admin-tab-count-badge">{orders.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`admin-tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          >
            <span>🍽️ Menu & Stock Inventory</span>
            {foods.length > 0 && (
              <span className="admin-tab-count-badge">{foods.length}</span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="admin-content-body">
          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner"></div>
              <p>Aggregating business metrics, inventory & active orders...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: ANALYTICS OVERVIEW */}
              {activeTab === 'analytics' && stats && (
                <div className="admin-analytics-view">
                  {/* KPI Stat Cards Grid */}
                  <div className="admin-kpi-grid">
                    <div className="admin-kpi-card kpi-revenue">
                      <div className="kpi-icon-wrap">💰</div>
                      <div className="kpi-meta">
                        <span className="kpi-label">Total Gross Revenue</span>
                        <h3 className="kpi-value">₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</h3>
                        <span className="kpi-subtext">From confirmed non-cancelled orders</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card kpi-orders">
                      <div className="kpi-icon-wrap">📑</div>
                      <div className="kpi-meta">
                        <span className="kpi-label">Lifetime Orders</span>
                        <h3 className="kpi-value">{stats.totalOrders || 0}</h3>
                        <span className="kpi-subtext">Across all service channels</span>
                      </div>
                    </div>

                    <div className="admin-kpi-card kpi-inventory">
                      <div className="kpi-icon-wrap">🥗</div>
                      <div className="kpi-meta">
                        <span className="kpi-label">Active Dishes In Stock</span>
                        <h3 className="kpi-value">
                          {stats.activeFoods || 0}{' '}
                          <span className="kpi-sub-total">/ {stats.totalDishes || 0} total</span>
                        </h3>
                        <span className="kpi-subtext">
                          {stats.totalDishes - stats.activeFoods > 0
                            ? `${stats.totalDishes - stats.activeFoods} items out of stock`
                            : '100% catalog availability'}
                        </span>
                      </div>
                    </div>

                    <div className="admin-kpi-card kpi-users">
                      <div className="kpi-icon-wrap">👥</div>
                      <div className="kpi-meta">
                        <span className="kpi-label">Customer Accounts</span>
                        <h3 className="kpi-value">{stats.totalUsers || 0}</h3>
                        <span className="kpi-subtext">Registered customer base</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown Pipeline */}
                  <div className="admin-section-card">
                    <h3 className="admin-section-title">
                      <span>🚦 Live Order Pipeline Distribution</span>
                    </h3>
                    <div className="pipeline-bars-grid">
                      {Object.entries(stats.statusBreakdown || {}).map(([statusKey, count]) => (
                        <div
                          key={statusKey}
                          className={`pipeline-pill-card ${getStatusBadgeClass(statusKey)}`}
                          onClick={() => {
                            setOrdersFilterStatus(statusKey);
                            setActiveTab('orders');
                          }}
                          role="button"
                          tabIndex={0}
                          title={`Click to view all ${statusKey} orders`}
                        >
                          <span className="pipeline-status-name">{statusKey}</span>
                          <span className="pipeline-status-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2-Column Split: Top Dishes & Recent Orders */}
                  <div className="admin-two-col-grid">
                    {/* Top Selling Dishes */}
                    <div className="admin-section-card">
                      <h3 className="admin-section-title">
                        <span>🏆 Top-Selling Gourmet Dishes</span>
                      </h3>
                      {stats.topDishes && stats.topDishes.length > 0 ? (
                        <div className="top-dishes-list">
                          {stats.topDishes.map((dish, idx) => (
                            <div key={dish._id || idx} className="top-dish-item">
                              <span className="top-dish-rank">#{idx + 1}</span>
                              {dish.image && (
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="top-dish-img"
                                />
                              )}
                              <div className="top-dish-info">
                                <h4 className="top-dish-name">{dish.name}</h4>
                                <span className="top-dish-meta">
                                  {dish.totalQuantitySold} orders • ₹{dish.totalRevenue} revenue
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-section-hint">
                          Order sales data will populate here as customers complete orders.
                        </p>
                      )}
                    </div>

                    {/* Recent Order Activity */}
                    <div className="admin-section-card">
                      <h3 className="admin-section-title">
                        <span>⏱️ Recent Order Submissions</span>
                      </h3>
                      {stats.recentOrders && stats.recentOrders.length > 0 ? (
                        <div className="recent-orders-list">
                          {stats.recentOrders.map((ord) => (
                            <div key={ord._id} className="recent-order-item">
                              <div className="recent-order-main">
                                <span className="recent-order-id">
                                  #{ord._id.slice(-6).toUpperCase()}
                                </span>
                                <span className="recent-order-customer">
                                  {ord.user?.name || 'Guest'}
                                </span>
                                <span className="recent-order-price">₹{ord.totalPrice}</span>
                              </div>
                              <div className="recent-order-sub">
                                <span className={`order-status-badge ${getStatusBadgeClass(ord.orderStatus)}`}>
                                  {ord.orderStatus}
                                </span>
                                <button
                                  onClick={() => {
                                    setOrderSearchQuery(ord._id);
                                    setActiveTab('orders');
                                  }}
                                  className="btn-tiny-link"
                                >
                                  Inspect ➔
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-section-hint">No orders registered yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDER MANAGEMENT PIPELINE */}
              {activeTab === 'orders' && (
                <div className="admin-orders-view">
                  {/* Filter Toolbar */}
                  <div className="admin-toolbar">
                    <div className="admin-search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search by Order ID, customer name, phone, city..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="admin-search-input"
                      />
                      {orderSearchQuery && (
                        <button
                          onClick={() => setOrderSearchQuery('')}
                          className="search-clear-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="admin-status-filters">
                      {['All', 'Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(
                        (st) => {
                          const count =
                            st === 'All'
                              ? orders.length
                              : orders.filter((o) => o.orderStatus === st).length;
                          return (
                            <button
                              key={st}
                              onClick={() => setOrdersFilterStatus(st)}
                              className={`status-filter-pill ${ordersFilterStatus === st ? 'active' : ''}`}
                            >
                              {st} ({count})
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="admin-empty-state">
                      <span className="empty-state-icon">📦</span>
                      <h3>No Orders Found</h3>
                      <p>
                        {orderSearchQuery || ordersFilterStatus !== 'All'
                          ? 'Try clearing the search query or status filter.'
                          : 'Orders placed by customers will appear here in real-time.'}
                      </p>
                    </div>
                  ) : (
                    <div className="admin-orders-list">
                      {filteredOrders.map((ord) => (
                        <div key={ord._id} className="admin-order-card">
                          {/* Card Top Row */}
                          <div className="order-card-header">
                            <div className="order-card-id-block">
                              <span className="order-id-label">ORDER</span>
                              <strong className="order-id-val">
                                #{ord._id.slice(-6).toUpperCase()}
                              </strong>
                              <span className="order-full-id">({ord._id})</span>
                              <span className="order-created-time">
                                {new Date(ord.createdAt).toLocaleString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div className="order-card-badges">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceOrder(ord)}
                                className="btn-admin-print-slip"
                                title="Print kitchen slip & tax invoice"
                              >
                                📄 Invoice
                              </button>
                              <span
                                className={`payment-badge ${ord.isPaid ? 'payment-paid' : 'payment-pending'}`}
                              >
                                {ord.isPaid ? 'PAID' : 'PENDING'} ({ord.paymentMethod})
                              </span>
                              <span className={`order-status-badge ${getStatusBadgeClass(ord.orderStatus)}`}>
                                {ord.orderStatus}
                              </span>
                            </div>
                          </div>

                          {/* Card Details Grid */}
                          <div className="order-card-details-grid">
                            {/* Customer & Delivery */}
                            <div className="order-meta-box">
                              <h5 className="meta-box-heading">👤 Customer Details</h5>
                              <p className="customer-info-line">
                                <strong>{ord.user?.name || 'Customer'}</strong> ({ord.user?.email || 'N/A'})
                              </p>
                              <p className="customer-info-line">
                                📞 {ord.deliveryAddress?.phoneNumber || ord.user?.phone || 'N/A'}
                              </p>
                              <p className="customer-address-line">
                                📍 {ord.deliveryAddress?.street}, {ord.deliveryAddress?.city} -{' '}
                                {ord.deliveryAddress?.postalCode}
                              </p>
                            </div>

                            {/* Items Purchased */}
                            <div className="order-items-box">
                              <h5 className="meta-box-heading">
                                🍽️ Ordered Items ({ord.orderItems?.length || 0})
                              </h5>
                              <ul className="admin-order-items-list">
                                {ord.orderItems?.map((item, idx) => (
                                  <li key={idx} className="admin-order-item-row">
                                    <span className="item-qty-name">
                                      <span className="qty-tag">{item.quantity}x</span>{' '}
                                      {item.name}
                                    </span>
                                    <span className="item-price-sum">
                                      ₹{item.price * item.quantity}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <div className="admin-order-total-summary">
                                <span>Grand Total:</span>
                                <strong className="grand-total-val">₹{ord.totalPrice}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Order Status History Note */}
                          {ord.statusHistory && ord.statusHistory.length > 0 && (
                            <div className="order-latest-note">
                              <span className="note-label">Latest Log:</span>{' '}
                              <em>
                                {ord.statusHistory[ord.statusHistory.length - 1].note ||
                                  `Transitioned to ${ord.statusHistory[ord.statusHistory.length - 1].status}`}
                              </em>
                            </div>
                          )}

                          {ord.orderStatus === 'Cancelled' && ord.cancellationReason && (
                            <div className="order-cancellation-admin-note">
                              <span className="note-label">🚫 Cancellation Reason:</span>{' '}
                              <strong>{ord.cancellationReason}</strong>
                            </div>
                          )}

                          {/* Interactive Status Transition Bar */}
                          <div className="order-status-actions-bar">
                            <div className="quick-actions-group">
                              <span className="actions-label">Next Action:</span>
                              {ord.orderStatus === 'Placed' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord._id, 'Confirmed')}
                                    disabled={updatingOrderId === ord._id}
                                    className="btn-action-status btn-status-confirm"
                                  >
                                    ✅ Confirm Order
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord._id, 'Cancelled')}
                                    disabled={updatingOrderId === ord._id}
                                    className="btn-action-status btn-status-cancel"
                                  >
                                    ❌ Cancel
                                  </button>
                                </>
                              )}

                              {ord.orderStatus === 'Confirmed' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord._id, 'Preparing')}
                                    disabled={updatingOrderId === ord._id}
                                    className="btn-action-status btn-status-prepare"
                                  >
                                    🍳 Send to Kitchen
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord._id, 'Cancelled')}
                                    disabled={updatingOrderId === ord._id}
                                    className="btn-action-status btn-status-cancel"
                                  >
                                    ❌ Cancel
                                  </button>
                                </>
                              )}

                              {ord.orderStatus === 'Preparing' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord._id, 'Out for Delivery')}
                                    disabled={updatingOrderId === ord._id}
                                    className="btn-action-status btn-status-dispatch"
                                  >
                                    🚀 Dispatch for Delivery
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord._id, 'Cancelled')}
                                    disabled={updatingOrderId === ord._id}
                                    className="btn-action-status btn-status-cancel"
                                  >
                                    ❌ Cancel
                                  </button>
                                </>
                              )}

                              {ord.orderStatus === 'Out for Delivery' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord._id, 'Delivered')}
                                  disabled={updatingOrderId === ord._id}
                                  className="btn-action-status btn-status-deliver"
                                >
                                  🎉 Mark Delivered
                                </button>
                              )}

                              {ord.orderStatus === 'Delivered' && (
                                <span className="status-complete-pill">
                                  ✔️ Order Fulfilled & Delivered
                                </span>
                              )}

                              {ord.orderStatus === 'Cancelled' && (
                                <span className="status-cancelled-pill">
                                  ✖️ Order Cancelled
                                </span>
                              )}
                            </div>

                            {/* Custom Note & Direct Override */}
                            {ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled' && (
                              <div className="status-note-row">
                                <input
                                  type="text"
                                  placeholder="Optional note (e.g. Assigned driver Ravi)"
                                  value={statusNotes[ord._id] || ''}
                                  onChange={(e) =>
                                    setStatusNotes((prev) => ({
                                      ...prev,
                                      [ord._id]: e.target.value,
                                    }))
                                  }
                                  className="status-note-input"
                                />
                                <select
                                  value={ord.orderStatus}
                                  onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                                  disabled={updatingOrderId === ord._id}
                                  className="direct-status-select"
                                >
                                  <option value="Placed">Placed</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Preparing">Preparing</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MENU & STOCK INVENTORY */}
              {activeTab === 'menu' && (
                <div className="admin-menu-view">
                  {/* Top Bar with Add Dish Trigger */}
                  <div className="admin-toolbar menu-toolbar">
                    <div className="admin-search-box">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search menu dishes by name, ingredients..."
                        value={foodSearchQuery}
                        onChange={(e) => setFoodSearchQuery(e.target.value)}
                        className="admin-search-input"
                      />
                    </div>

                    <div className="menu-filter-selects">
                      <select
                        value={foodCategoryFilter}
                        onChange={(e) => setFoodCategoryFilter(e.target.value)}
                        className="admin-filter-select"
                      >
                        <option value="All">All Categories</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                      </select>

                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="admin-filter-select"
                      >
                        <option value="All">All Stock Status</option>
                        <option value="In Stock">In Stock Only</option>
                        <option value="Out of Stock">Out of Stock Only</option>
                      </select>
                    </div>

                    <button
                      onClick={handleOpenCreateDish}
                      className="btn-primary btn-add-dish"
                    >
                      <span>➕ Add New Dish</span>
                    </button>
                  </div>

                  {/* Add / Edit Dish Form Drawer */}
                  {isDishFormOpen && (
                    <div className="dish-editor-card">
                      <div className="dish-editor-header">
                        <h4>{editingFoodId ? '✏️ Edit Dish' : '➕ Create New Menu Dish'}</h4>
                        <button
                          onClick={() => setIsDishFormOpen(false)}
                          className="btn-tiny-close"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSubmitDish} className="dish-form-grid">
                        <div className="form-group">
                          <label>Dish Name *</label>
                          <input
                            type="text"
                            required
                            value={dishForm.name}
                            onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                            placeholder="e.g. Truffle Mushroom Risotto"
                          />
                        </div>

                        <div className="form-group">
                          <label>Category *</label>
                          <select
                            required
                            value={dishForm.category}
                            onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                          >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.icon} {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Price (₹) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={dishForm.price}
                            onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                            placeholder="e.g. 399"
                          />
                        </div>

                        <div className="form-group">
                          <label>Image URL *</label>
                          <input
                            type="url"
                            required
                            value={dishForm.image}
                            onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div className="form-group form-group-span-2">
                          <label>Description *</label>
                          <textarea
                            required
                            rows="2"
                            value={dishForm.description}
                            onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                            placeholder="Rich, creamy arborio rice infused with black winter truffle and wild mushrooms..."
                          />
                        </div>

                        <div className="form-group">
                          <label>Spicy Level</label>
                          <select
                            value={dishForm.spicyLevel}
                            onChange={(e) => setDishForm({ ...dishForm, spicyLevel: e.target.value })}
                          >
                            <option value="0">0 - Mild 🍃</option>
                            <option value="1">1 - Medium 🌶️</option>
                            <option value="2">2 - Hot 🌶️🌶️</option>
                            <option value="3">3 - Extra Hot 🔥</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Prep Time (Minutes)</label>
                          <input
                            type="number"
                            min="5"
                            value={dishForm.prepTimeMinutes}
                            onChange={(e) => setDishForm({ ...dishForm, prepTimeMinutes: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Calories (kcal)</label>
                          <input
                            type="number"
                            min="50"
                            value={dishForm.calories}
                            onChange={(e) => setDishForm({ ...dishForm, calories: e.target.value })}
                          />
                        </div>

                        <div className="form-group form-checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={dishForm.isVeg}
                              onChange={(e) => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                            />
                            <span>🥬 Vegetarian Dish</span>
                          </label>
                        </div>

                        <div className="form-group form-group-span-2">
                          <label>Ingredients (comma separated)</label>
                          <input
                            type="text"
                            value={dishForm.ingredients}
                            onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                            placeholder="Arborio rice, Wild mushrooms, Truffle oil, Parmesan, Garlic"
                          />
                        </div>

                        <div className="form-actions form-group-span-2">
                          <button
                            type="button"
                            onClick={() => setIsDishFormOpen(false)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingDish}
                            className="btn-primary"
                          >
                            {savingDish ? 'Saving Dish...' : editingFoodId ? 'Update Dish' : 'Create Dish'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Foods Table / Grid */}
                  <div className="admin-foods-table-wrapper">
                    <table className="admin-foods-table">
                      <thead>
                        <tr>
                          <th>Dish</th>
                          <th>Category</th>
                          <th>Diet & Spice</th>
                          <th>Price</th>
                          <th>Availability Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFoods.map((food) => (
                          <tr key={food._id} className={!food.isAvailable ? 'row-out-of-stock' : ''}>
                            {/* Dish Info */}
                            <td>
                              <div className="table-dish-meta">
                                <img
                                  src={food.image}
                                  alt={food.name}
                                  className="table-dish-thumb"
                                />
                                <div>
                                  <strong className="table-dish-name">{food.name}</strong>
                                  <p className="table-dish-desc">{food.description}</p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td>
                              <span className="category-pill-tag">
                                {food.category?.icon} {food.category?.name || 'General'}
                              </span>
                            </td>

                            {/* Diet & Spice */}
                            <td>
                              <div className="diet-spice-tags">
                                <span className={`diet-badge ${food.isVeg ? 'diet-veg' : 'diet-nonveg'}`}>
                                  {food.isVeg ? '🥬 Veg' : '🍗 Non-Veg'}
                                </span>
                                <span className="table-spice-tag">
                                  {food.spicyLevel === 0 && 'Mild'}
                                  {food.spicyLevel === 1 && '🌶️ Med'}
                                  {food.spicyLevel === 2 && '🌶️🌶️ Hot'}
                                  {food.spicyLevel === 3 && '🔥 Extra'}
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td>
                              <strong className="table-price">₹{food.price}</strong>
                            </td>

                            {/* 1-CLICK STOCK TOGGLE SWITCH */}
                            <td>
                              <button
                                onClick={() => handleToggleStock(food._id)}
                                disabled={togglingStockId === food._id}
                                className={`btn-stock-toggle ${food.isAvailable ? 'stock-active' : 'stock-inactive'}`}
                                title="Click to toggle availability in catalog"
                              >
                                <span className="toggle-indicator-dot"></span>
                                <span className="toggle-label">
                                  {togglingStockId === food._id
                                    ? 'Updating...'
                                    : food.isAvailable
                                    ? 'In Stock 🟢'
                                    : 'Out of Stock 🔴'}
                                </span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td>
                              <div className="table-actions">
                                <button
                                  onClick={() => handleOpenEditDish(food)}
                                  className="btn-table-edit"
                                  title="Edit dish details"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteDish(food._id, food.name)}
                                  disabled={deletingFoodId === food._id}
                                  className="btn-table-delete"
                                  title="Remove dish from menu"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tax Invoice Modal for Kitchen Packing & Customer Delivery */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboardModal;

