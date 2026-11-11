import React, { useRef } from 'react';

export const OrderInvoiceModal = ({ isOpen, order, onClose }) => {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-${order._id.substring(order._id.length - 8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const orderTime = new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="modal-backdrop invoice-modal-backdrop" onClick={onClose}>
      <div
        className="modal-content invoice-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Order Tax Invoice Receipt"
      >
        {/* Screen-only Action Toolbar */}
        <div className="invoice-screen-toolbar no-print">
          <div className="toolbar-left">
            <span className="toolbar-icon">🧾</span>
            <div>
              <h3 className="toolbar-title">Tax Invoice & Delivery Receipt</h3>
              <p className="toolbar-sub">Official invoice for Order #{invoiceNumber}</p>
            </div>
          </div>
          <div className="toolbar-actions">
            <button
              onClick={handlePrint}
              className="btn-primary btn-print-invoice"
              title="Print invoice or save as PDF"
            >
              <span>🖨️</span>
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary btn-close-invoice"
              aria-label="Close invoice"
            >
              &times; Close
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="invoice-printable-sheet" ref={invoiceRef} id="printable-invoice">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <div className="invoice-logo-badge">
                <span>🧞</span>
              </div>
              <div className="invoice-brand-text">
                <h1 className="invoice-brand-name">Food Genie</h1>
                <p className="invoice-brand-tagline">AI-Powered Gourmet Kitchens & Logistics</p>
                <p className="invoice-gstin">GSTIN: <strong>29AABCF1234F1Z8</strong> &bull; FSSAI Lic: <strong>11223344000123</strong></p>
              </div>
            </div>

            <div className="invoice-meta-block">
              <span className="invoice-type-tag">TAX INVOICE</span>
              <table className="invoice-meta-table">
                <tbody>
                  <tr>
                    <td>Invoice No:</td>
                    <td><strong>{invoiceNumber}</strong></td>
                  </tr>
                  <tr>
                    <td>Order Date:</td>
                    <td>{orderDate}</td>
                  </tr>
                  <tr>
                    <td>Order Time:</td>
                    <td>{orderTime}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>
                      <span className={`invoice-status-pill status-${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cancellation Notice Banner (If Cancelled) */}
          {isCancelled && (
            <div className="invoice-cancelled-banner">
              <strong>⚠️ ORDER CANCELLED</strong>
              <span>
                {order.cancellationReason ? `Reason: "${order.cancellationReason}"` : 'This order was cancelled.'}
                {order.isPaid
                  ? ' &bull; Refund initiated to original payment source.'
                  : ' &bull; Cash on delivery cancelled; no liability due.'}
              </span>
            </div>
          )}

          {/* Customer & Delivery Information Grid */}
          <div className="invoice-parties-grid">
            <div className="party-box bill-to">
              <h4 className="party-title">📍 DELIVERED TO:</h4>
              <p className="party-name">
                <strong>{order.user?.name || 'Customer'}</strong>
              </p>
              <p className="party-address">
                {order.shippingAddress?.street},<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state || 'Karnataka'} - {order.shippingAddress?.zipCode}
              </p>
              <p className="party-phone">📞 Contact: {order.phone}</p>
              {order.user?.email && <p className="party-email">✉️ {order.user.email}</p>}
            </div>

            <div className="party-box payment-info">
              <h4 className="party-title">💳 PAYMENT SUMMARY:</h4>
              <table className="party-table">
                <tbody>
                  <tr>
                    <td>Payment Mode:</td>
                    <td><strong>{order.paymentMethod}</strong></td>
                  </tr>
                  <tr>
                    <td>Payment Status:</td>
                    <td>
                      <span className={`payment-status-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                        {order.isPaid ? 'PAID IN FULL ✓' : 'CASH ON DELIVERY'}
                      </span>
                    </td>
                  </tr>
                  {order.paymentResult?.id && (
                    <tr>
                      <td>Transaction ID:</td>
                      <td><code>{order.paymentResult.id}</code></td>
                    </tr>
                  )}
                  <tr>
                    <td>Estimated Prep:</td>
                    <td>{order.estimatedDeliveryMinutes || 30} Mins Express</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Foods Table */}
          <div className="invoice-table-wrapper">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th className="col-idx">#</th>
                  <th className="col-desc">Culinary Dish / Description</th>
                  <th className="col-diet">Diet</th>
                  <th className="col-price">Unit Price</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-total">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, index) => (
                  <tr key={index}>
                    <td className="col-idx">{index + 1}</td>
                    <td className="col-desc">
                      <strong>{item.name}</strong>
                    </td>
                    <td className="col-diet">
                      <span className={`diet-pill ${item.isVeg ? 'veg' : 'non-veg'}`}>
                        {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </td>
                    <td className="col-price">₹{item.price}</td>
                    <td className="col-qty">{item.quantity}</td>
                    <td className="col-total">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & Summary Strip */}
          <div className="invoice-footer-grid">
            <div className="invoice-notes-block">
              <h5>Terms & Conditions:</h5>
              <ul>
                <li>All gourmet items prepared fresh under stringent hygiene protocols.</li>
                <li>Applicable taxes calculated at 5% GST on Restaurant Services.</li>
                <li>Goods once delivered cannot be returned. For grievances: support@foodgenie.com.</li>
              </ul>
              <div className="fssai-stamp">
                <span>🛡️ FSSAI Certified Kitchen &bull; 100% Quality Assurance</span>
              </div>
            </div>

            <div className="invoice-totals-block">
              <table className="totals-table">
                <tbody>
                  <tr>
                    <td>Items Subtotal:</td>
                    <td>₹{order.itemsPrice || 0}</td>
                  </tr>
                  <tr>
                    <td>GST (5% Restaurant Tax):</td>
                    <td>₹{order.taxPrice || 0}</td>
                  </tr>
                  <tr>
                    <td>Delivery & Packaging:</td>
                    <td>
                      {order.deliveryPrice === 0 ? (
                        <span className="free-delivery-tag">FREE (Orders &gt; ₹500)</span>
                      ) : (
                        `₹${order.deliveryPrice}`
                      )}
                    </td>
                  </tr>
                  <tr className="grand-total-row">
                    <td>
                      <strong>Grand Total:</strong>
                    </td>
                    <td>
                      <strong>₹{order.totalPrice}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Sign-off & Barcode */}
          <div className="invoice-signoff">
            <div className="barcode-box">
              <div className="simulated-barcode">
                ||| | |||| | ||| |||| | || ||| |||| | ||| | ||
              </div>
              <small className="barcode-code">{invoiceNumber}-AUTHENTIC-VERIFIED</small>
            </div>
            <div className="signature-box">
              <p className="auth-sign">Authorized Signatory</p>
              <p className="sign-company">For Food Genie Platform Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;

