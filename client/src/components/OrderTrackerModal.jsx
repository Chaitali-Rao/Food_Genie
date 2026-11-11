import React, { useState, useEffect, useRef } from 'react';
import orderService from '../services/orderService';
import OrderInvoiceModal from './OrderInvoiceModal';

const STEPS = [
  { key: 'Placed', label: 'Order Placed', icon: '📝', desc: 'Order received by Food Genie kitchen' },
  { key: 'Confirmed', label: 'Confirmed', icon: '✅', desc: 'Kitchen acknowledged & ingredients gathered' },
  { key: 'Preparing', label: 'Preparing', icon: '🍳', desc: 'Chefs are freshly cooking your feast' },
  { key: 'Out for Delivery', label: 'On The Way', icon: '🛵', desc: 'Rider Arjun is on route with thermal bag' },
  { key: 'Delivered', label: 'Delivered', icon: '🏠', desc: 'Arrived safely at your doorstep' },
];

// Helper to calculate coordinate on cubic bezier curve: P(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
const getBezierPoint = (t, p0, p1, p2, p3) => {
  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
  const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

  return { x, y };
};

export const OrderTrackerModal = ({ orderId, initialOrder, onClose }) => {
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'timeline'
  const [callToast, setCallToast] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(new Set());

  // Cancellation State
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Tax Invoice Modal State
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Real-time ETA Countdown Timer in seconds
  const [countdownSeconds, setCountdownSeconds] = useState(14 * 60 + 35); // 14m 35s default

  useEffect(() => {
    if (!orderId && !initialOrder?._id) return;
    const targetId = orderId || initialOrder._id;

    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(targetId);
        if (res.success) {
          setOrder(res.order);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, initialOrder]);

  // ETA countdown tick
  useEffect(() => {
    if (order?.orderStatus === 'Delivered' || order?.orderStatus === 'Cancelled') return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.orderStatus]);

  const handleSimulateStep = async () => {
    if (!order) return;
    setAdvancing(true);
    try {
      const res = await orderService.simulateOrderStep(order._id);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setAdvancing(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    setError(null);
    try {
      const finalReason =
        cancelReason === 'Other'
          ? customReason.trim() || 'Other reason'
          : cancelReason;
      const res = await orderService.cancelOrder(order._id, finalReason);
      if (res.success) {
        setOrder(res.order);
        setIsCancelConfirmOpen(false);
        setCancelSuccessMsg('Order has been cancelled successfully.');
        setTimeout(() => setCancelSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCallRider = () => {
    setCallToast('Connecting to Delivery Partner Arjun Kumar (+91 98765-43210)... 📲');
    setTimeout(() => {
      setCallToast(null);
    }, 3800);
  };

  const toggleNote = (note) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(note)) next.delete(note);
      else next.add(note);
      return next;
    });
  };

  if (!order && loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">
            <span className="spinner"></span>
            <span>Fetching live order status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);
  const isDelivered = order.orderStatus === 'Delivered';
  const isCancelled = order.orderStatus === 'Cancelled';
  const isOutForDelivery = order.orderStatus === 'Out for Delivery';
  const canCancel = ['Placed', 'Confirmed', 'Preparing'].includes(order.orderStatus);

  // Path Bezier definition for the delivery route
  // Kitchen (P0) -> Control 1 (P1) -> Control 2 (P2) -> Home (P3)
  const P0 = { x: 75, y: 195 };
  const P1 = { x: 190, y: 245 };
  const P2 = { x: 380, y: 70 };
  const P3 = { x: 525, y: 85 };

  // Determine progress % along the route based on status
  let routeProgress = 0.08;
  let riderSpeed = '0 km/h (At Kitchen)';
  let distanceLeft = '3.2 km';

  if (isCancelled) {
    routeProgress = 0.08;
    riderSpeed = '0 km/h (Cancelled)';
    distanceLeft = 'Cancelled';
  } else if (order.orderStatus === 'Confirmed') {
    routeProgress = 0.22;
    riderSpeed = '0 km/h (Packing)';
    distanceLeft = '3.0 km';
  } else if (order.orderStatus === 'Preparing') {
    routeProgress = 0.38;
    riderSpeed = '0 km/h (Food on Grill)';
    distanceLeft = '2.8 km';
  } else if (order.orderStatus === 'Out for Delivery') {
    routeProgress = 0.72;
    riderSpeed = '32 km/h (Cruising)';
    distanceLeft = '0.9 km';
  } else if (order.orderStatus === 'Delivered') {
    routeProgress = 1.0;
    riderSpeed = '0 km/h (Arrived)';
    distanceLeft = '0.0 km';
  }

  const riderPoint = getBezierPoint(routeProgress, P0, P1, P2, P3);

  // Format countdown mm:ss
  const mins = Math.floor(countdownSeconds / 60);
  const secs = countdownSeconds % 60;
  const formattedCountdown = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content tracker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-brand">
            <span className="modal-icon">🧞‍♂️</span>
            <div>
              <h3>Live Animated Delivery Radar</h3>
              <p className="modal-subtitle">
                Order ID: <code>#{order._id.substring(order._id.length - 8).toUpperCase()}</code>
              </p>
            </div>
          </div>

          <div className="tracker-top-controls">
            {/* View Switcher Pills */}
            <div className="tracker-view-tabs">
              <button
                onClick={() => setActiveTab('radar')}
                className={`tracker-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
              >
                🗺️ Radar Map
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`tracker-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              >
                📜 Status Log
              </button>
            </div>

            <button className="modal-close-btn" onClick={onClose} aria-label="Close tracker">
              &times;
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {cancelSuccessMsg && (
          <div className="alert alert-success animate-slide-down">
            <span>{cancelSuccessMsg}</span>
          </div>
        )}

        {callToast && (
          <div className="tracker-call-toast animate-slide-down">
            <span>{callToast}</span>
          </div>
        )}

        {/* Cancel Order Confirmation Modal */}
        {isCancelConfirmOpen && (
          <div className="cancel-confirm-overlay" onClick={() => setIsCancelConfirmOpen(false)}>
            <div className="cancel-confirm-box" onClick={(e) => e.stopPropagation()}>
              <div className="cancel-confirm-header">
                <h3>Cancel Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h3>
                <button
                  type="button"
                  className="btn-close-sub"
                  onClick={() => setIsCancelConfirmOpen(false)}
                >
                  &times;
                </button>
              </div>

              <div className="cancel-confirm-body">
                <p className="cancel-warning-text">
                  ⚠️ Are you sure you want to cancel this order? Kitchen chefs will immediately stop preparation.
                </p>

                <div className="cancel-reason-group">
                  <label htmlFor="cancel-reason-select">Select Cancellation Reason:</label>
                  <select
                    id="cancel-reason-select"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="cancel-reason-select"
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Taking too long / delivery delay">Taking too long / delivery delay</option>
                    <option value="Incorrect items or delivery address">Incorrect items or delivery address</option>
                    <option value="Other">Other reason (specify below)</option>
                  </select>

                  {cancelReason === 'Other' && (
                    <input
                      type="text"
                      placeholder="Please specify your reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="cancel-custom-input"
                      maxLength={120}
                    />
                  )}
                </div>

                <div className="cancel-refund-notice">
                  {order.isPaid ? (
                    <div className="notice-refund">
                      💳 <strong>Digital Payment ({order.paymentMethod}):</strong> Full refund of ₹{order.totalPrice} will be processed back to your source account.
                    </div>
                  ) : (
                    <div className="notice-cod">
                      💵 <strong>Cash on Delivery:</strong> No cancellation charges. No amount due.
                    </div>
                  )}
                </div>
              </div>

              <div className="cancel-confirm-footer">
                <button
                  type="button"
                  onClick={() => setIsCancelConfirmOpen(false)}
                  disabled={isCancelling}
                  className="btn-cancel-abort"
                >
                  Keep My Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="btn-cancel-proceed"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Delivery Hero Bar */}
        <div
          className={`tracker-status-hero ${
            isDelivered ? 'delivered' : isCancelled ? 'cancelled' : 'in-progress'
          }`}
        >
          <div className="hero-status-content">
            <span className={`hero-status-pill ${isCancelled ? 'pill-cancelled' : ''}`}>
              <span className={isCancelled ? 'cancelled-indicator' : 'pulse-indicator'}>
                {isCancelled ? '✕' : ''}
              </span>
              {order.orderStatus.toUpperCase()}
            </span>
            <h2 className="hero-status-title">
              {isCancelled
                ? 'This order has been cancelled 🚫'
                : isDelivered
                ? 'Your feast has arrived! Enjoy your meal 😋'
                : STEPS[currentStepIndex]?.desc || 'Tracking delivery progress...'}
            </h2>
            <p className="hero-status-timer">
              {isCancelled
                ? `${order.cancellationReason ? `Reason: "${order.cancellationReason}" • ` : ''}Cancelled at ${new Date(order.cancelledAt || order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : isDelivered
                ? `Delivered at ${new Date(order.deliveredAt || order.updatedAt).toLocaleTimeString()}`
                : `⏱️ Estimated arrival: ~${formattedCountdown} • Rider moving towards you`}
            </p>
          </div>

          <div className="hero-actions-cluster">
            {!isDelivered && !isCancelled && (
              <button
                onClick={handleSimulateStep}
                disabled={advancing}
                className="btn-advance-status"
                title="Click to simulate next delivery step progression"
              >
                {advancing ? '⚡ Advancing...' : '⚡ Advance Next Step (Demo)'}
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(true)}
                className="btn-cancel-order-trigger"
                title="Cancel this order"
              >
                ✕ Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: Animated Interactive Delivery Radar Map */}
        {activeTab === 'radar' && (
          <div className="delivery-radar-wrapper">
            <div className="radar-canvas-container">
              {isCancelled && (
                <div className="radar-cancelled-badge-overlay">
                  <span className="radar-cancel-icon">🚫</span>
                  <div className="radar-cancel-meta">
                    <strong>ORDER CANCELLED</strong>
                    <span>{order.cancellationReason || 'Kitchen preparation stopped'}</span>
                  </div>
                </div>
              )}

              {/* Telemetry Overlay Badges */}
              <div className="radar-telemetry-overlay">
                <div className="telemetry-chip">
                  <span className="telemetry-label">SPEED</span>
                  <span className="telemetry-val">{riderSpeed}</span>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">REMAINING</span>
                  <span className="telemetry-val">{distanceLeft}</span>
                </div>
                <div className="telemetry-chip">
                  <span className="telemetry-label">BAG TEMP</span>
                  <span className="telemetry-val">♨️ 62°C Hot Seal</span>
                </div>
              </div>

              {/* Responsive SVG Map Viewport */}
              <svg
                viewBox="0 0 600 280"
                className="radar-map-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Grid Pattern */}
                  <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                  </pattern>

                  {/* Neon Road Glow Filter */}
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Gradient for Route */}
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>

                  {/* Radar Pulse Animation */}
                  <radialGradient id="radarSweepGradient">
                    <stop offset="0%" stopColor="rgba(56, 189, 248, 0.25)" />
                    <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
                  </radialGradient>
                </defs>

                {/* Map Base Background */}
                <rect width="600" height="280" rx="16" fill="#0f172a" />
                <rect width="600" height="280" rx="16" fill="url(#radarGrid)" />

                {/* Subtle City Streets / Blocks */}
                <path
                  d="M 0 110 L 600 110 M 0 210 L 600 210 M 200 0 L 200 280 M 420 0 L 420 280"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="8"
                  fill="none"
                />

                {/* Radar Concentric Rings */}
                <circle cx="300" cy="140" r="60" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="300" cy="140" r="110" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="300" cy="140" r="150" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />

                {/* Rotating Radar Sweep Cone */}
                <g className="radar-sweep-group">
                  <path
                    d="M 300 140 L 440 80 A 150 150 0 0 1 450 150 Z"
                    fill="url(#radarSweepGradient)"
                  />
                  <line x1="300" y1="140" x2="450" y2="150" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
                </g>

                {/* Delivery Road Background Underlay */}
                <path
                  d="M 75 195 C 190 245, 380 70, 525 85"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                  strokeLinecap="round"
                />

                {/* Animated Dashed Active Route */}
                <path
                  d="M 75 195 C 190 245, 380 70, 525 85"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="animated-road-dash"
                  filter="url(#neonGlow)"
                />

                {/* Restaurant Kitchen Hub Marker */}
                <g transform="translate(75, 195)">
                  <circle r="18" fill="rgba(245, 158, 11, 0.2)" className="pulse-ring-slow" />
                  <circle r="12" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                  <text textAnchor="middle" y="4" fontSize="11" fill="#ffffff">
                    🍳
                  </text>
                  <text textAnchor="middle" y="26" fontSize="9" fontWeight="700" fill="#fef3c7">
                    Kitchen
                  </text>
                </g>

                {/* Customer Home Destination Marker */}
                <g transform="translate(525, 85)">
                  <circle r="18" fill="rgba(16, 185, 129, 0.2)" className="pulse-ring-fast" />
                  <circle r="12" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                  <text textAnchor="middle" y="4" fontSize="11" fill="#ffffff">
                    🏠
                  </text>
                  <text textAnchor="middle" y="26" fontSize="9" fontWeight="700" fill="#d1fae5">
                    Your Doorstep
                  </text>
                </g>

                {/* Animated Rider Scooter Pin along Bezier Curve */}
                <g
                  transform={`translate(${riderPoint.x}, ${riderPoint.y})`}
                  className={`radar-rider-marker ${isOutForDelivery ? 'scooter-vibrate' : ''}`}
                >
                  {/* Rider Beacon Glow */}
                  <circle r="20" fill="rgba(56, 189, 248, 0.25)" className="pulse-ring-rider" />
                  <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />

                  {/* Rider Scooter Emoji / Icon */}
                  <text textAnchor="middle" y="5" fontSize="13">
                    🛵
                  </text>

                  {/* Floating Callout Pill */}
                  <g transform="translate(0, -26)">
                    <rect
                      x="-55"
                      y="-12"
                      width="110"
                      height="20"
                      rx="10"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      y="2"
                      fontSize="8.5"
                      fontWeight="800"
                      fill="#38bdf8"
                    >
                      {isDelivered ? 'Arrived!' : 'Arjun (Rider) 🛵'}
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            {/* Delivery Partner Telemetry Card */}
            <div className="rider-card-strip">
              <div className="rider-profile">
                <div className="rider-avatar">
                  <span>🛵</span>
                  <span className="rider-live-dot"></span>
                </div>
                <div className="rider-info">
                  <div className="rider-name-row">
                    <strong>Arjun Kumar</strong>
                    <span className="rider-rating">⭐ 4.9 (1,420 Deliveries)</span>
                  </div>
                  <p className="rider-vehicle">
                    Ather 450X EV &bull; <code>KA-04-EK-9821</code>
                  </p>
                </div>
              </div>

              <div className="rider-actions-wrap">
                <button onClick={handleCallRider} className="btn-call-rider" title="Call Arjun Kumar">
                  📞 Call Partner
                </button>
              </div>
            </div>

            {/* Quick Delivery Instructions */}
            <div className="delivery-quick-notes">
              <span className="notes-heading">💬 Delivery Instructions for Arjun:</span>
              <div className="notes-pills-row">
                {[
                  'Leave at Security Gate 🏢',
                  'Don’t Ring Bell 🔕',
                  'Call Upon Arrival 📲',
                  'Leave with Neighbor 🚪',
                ].map((note, nIdx) => (
                  <button
                    key={nIdx}
                    onClick={() => toggleNote(note)}
                    className={`btn-note-pill ${selectedNotes.has(note) ? 'selected' : ''}`}
                  >
                    {selectedNotes.has(note) ? `✓ ${note}` : note}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Stepper Progress & Timeline Section */}
        {activeTab === 'timeline' && (
          <div className="tracker-timeline-tab-content">
            {/* 5-Step Stepper Progress Bar */}
            <div className="stepper-container">
              <div className="stepper-line-track">
                <div
                  className="stepper-line-fill"
                  style={{
                    width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="stepper-nodes">
                {STEPS.map((step, idx) => {
                  const isPassed = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`stepper-node ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="node-circle">{isPassed ? '✓' : step.icon}</div>
                      <span className="node-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="timeline-section">
              <h4>📜 Real-Time Status Log</h4>
              <div className="status-timeline-list">
                {order.statusHistory?.map((h, i) => (
                  <div key={i} className="timeline-entry">
                    <span className="timeline-dot"></span>
                    <div className="timeline-content">
                      <div className="timeline-title-row">
                        <strong>{h.status}</strong>
                        <span className="timeline-time">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="timeline-note">{h.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Summary Card (Shared Bottom) */}
        <div className="order-details-strip">
          <div className="details-col">
            <span className="details-sublabel">Delivering To:</span>
            <strong>
              {order.shippingAddress?.street}, {order.shippingAddress?.city}
            </strong>
            <span className="phone-tag">📞 {order.phone}</span>
          </div>

          <div className="details-col">
            <span className="details-sublabel">Payment & Bill:</span>
            <strong>
              {order.paymentMethod} &bull; ₹{order.totalPrice}
            </strong>
            <span className={`paid-tag ${order.isPaid ? 'paid' : 'unpaid'}`}>
              {order.isPaid ? '✓ PAID' : 'PENDING ON DELIVERY'}
            </span>
          </div>

          <div className="details-col details-invoice-col">
            <span className="details-sublabel">Official Receipt:</span>
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="btn-open-invoice"
              title="View, print, or download PDF tax invoice"
            >
              📄 Tax Invoice
            </button>
          </div>
        </div>

        {/* Items Quick Summary */}
        <div className="order-items-minilist">
          <h4>Items in this order:</h4>
          <div className="items-row-tags">
            {order.orderItems?.map((item, idx) => (
              <span key={idx} className="item-pill-tag">
                {item.name} &times; {item.quantity} (₹{item.price * item.quantity})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Printable / Downloadable Invoice Modal */}
      {isInvoiceOpen && (
        <OrderInvoiceModal
          isOpen={isInvoiceOpen}
          order={order}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderTrackerModal;
