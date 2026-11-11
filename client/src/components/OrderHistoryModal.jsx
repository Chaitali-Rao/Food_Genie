import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import OrderInvoiceModal from './OrderInvoiceModal';

export const OrderHistoryModal = ({ isOpen, onClose, onTrackOrder }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invoice State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Cancellation State
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getMyOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReorder = (order) => {
    order.orderItems.forEach((item) => {
      addToCart(
        {
          _id: item.food,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
        },
        item.quantity
      );
    });
    onClose();
    setIsCartOpen(true);
  };

  const handleCancelOrder = async (orderId) => {
    setIsCancelling(true);
    try {
      const finalReason =
        cancelReason === 'Other'
          ? customReason.trim() || 'Other reason'
          : cancelReason;
      const res = await orderService.cancelOrder(orderId, finalReason);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? res.order : ord))
        );
        setCancellingOrderId(null);
        setActionFeedback({
          type: 'success',
          message: `Order #${orderId.substring(orderId.length - 8).toUpperCase()} has been cancelled.`,
        });
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to cancel order',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Out for Delivery':
        return 'status-delivering';
      case 'Preparing':
        return 'status-preparing';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-placed';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content orders-history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-brand">
            <span className="modal-icon">📦</span>
            <div>
              <h3>Your Order History</h3>
              <p className="modal-subtitle">Live Tracking, Re-orders & Order Management</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {actionFeedback && (
          <div className={`alert alert-${actionFeedback.type === 'error' ? 'danger' : 'success'} animate-slide-down`}>
            <span>{actionFeedback.message}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <span className="spinner"></span>
            <span>Loading your Genie orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-view">
            <span className="empty-emoji">📜</span>
            <h4>No Orders Yet</h4>
            <p>You haven't summoned any food yet. Browse the menu to place your first order!</p>
            <button className="btn-primary" onClick={onClose}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list-scroll">
            {orders.map((order) => {
              const canCancel = ['Placed', 'Confirmed', 'Preparing'].includes(order.orderStatus);
              const isCancelled = order.orderStatus === 'Cancelled';
              const isCancellingThis = cancellingOrderId === order._id;

              return (
                <div key={order._id} className={`order-history-card ${isCancelled ? 'card-cancelled' : ''}`}>
                  <div className="order-history-card-header">
                    <div>
                      <span className="order-code">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span className={`order-status-badge ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Cancelled Reason Alert */}
                  {isCancelled && (
                    <div className="history-cancelled-bar">
                      <span>🚫 Cancelled: "{order.cancellationReason || 'Cancelled by customer'}"</span>
                      {order.cancelledAt && (
                        <small>
                          {new Date(order.cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      )}
                    </div>
                  )}

                  {/* Items in this order */}
                  <div className="order-history-items">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="history-item-mini">
                        <img src={item.image} alt={item.name} className="history-thumb" />
                        <span className="history-item-name">
                          {item.name} &times; {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Inline Cancel Dialog */}
                  {isCancellingThis && (
                    <div className="history-cancel-box animate-fade-in">
                      <div className="history-cancel-prompt">
                        <strong>⚠️ Reason for cancelling order #{order._id.substring(order._id.length - 8).toUpperCase()}:</strong>
                        <select
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
                            placeholder="Specify reason..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="cancel-custom-input"
                            maxLength={100}
                          />
                        )}

                        <small className="cancel-history-refund-note">
                          {order.isPaid
                            ? `💳 Refund of ₹${order.totalPrice} will be credited to your ${order.paymentMethod} account.`
                            : '💵 Cash on delivery order. No payment will be collected.'}
                        </small>
                      </div>

                      <div className="history-cancel-btn-row">
                        <button
                          type="button"
                          onClick={() => setCancellingOrderId(null)}
                          disabled={isCancelling}
                          className="btn-secondary btn-sm"
                        >
                          Keep Order
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={isCancelling}
                          className="btn-danger btn-sm"
                        >
                          {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="order-history-footer">
                    <div className="history-bill-info">
                      <span>
                        Paid via <strong>{order.paymentMethod}</strong>
                      </span>
                      <strong className="history-total-price">₹{order.totalPrice}</strong>
                    </div>

                    <div className="history-actions">
                      {canCancel && !isCancellingThis && (
                        <button
                          type="button"
                          className="btn-danger-outline btn-sm"
                          onClick={() => setCancellingOrderId(order._id)}
                          title="Cancel this order"
                        >
                          ✕ Cancel Order
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-invoice-history btn-sm"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        title="Download or Print Official Tax Invoice"
                      >
                        📄 Invoice
                      </button>

                      <button
                        className="btn-primary btn-sm"
                        onClick={() => {
                          onClose();
                          onTrackOrder(order);
                        }}
                      >
                        🚀 Track Live
                      </button>

                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleReorder(order)}
                        title="Add these items to your cart"
                      >
                        🔁 Re-order
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tax Invoice Modal */}
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

export default OrderHistoryModal;
