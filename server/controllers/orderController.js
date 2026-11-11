import Order from '../models/Order.js';
import Food from '../models/Food.js';

const STATUS_PROGRESSION = [
  'Placed',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

const STATUS_NOTES = {
  Placed: 'Order received and waiting for restaurant confirmation.',
  Confirmed: 'Restaurant confirmed your order and started kitchen queue.',
  Preparing: 'Head chef is freshly cooking and packing your meal.',
  'Out for Delivery': 'Genie Delivery Partner has picked up and is en-route.',
  Delivered: 'Meal safely delivered to your doorstep. Bon appétit!',
  Cancelled: 'Order has been cancelled.',
};

/**
 * @desc    Create a new customer order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      phone,
      paymentMethod = 'COD',
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be placed without any food items',
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery street, city, and zip code',
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Contact phone number is required for delivery coordination',
      });
    }

    // Verify and compute prices server-side
    let calculatedItemsPrice = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const foodDoc = await Food.findById(item.food);
      if (!foodDoc) {
        return res.status(404).json({
          success: false,
          message: `Food item not found: ${item.name || item.food}`,
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10));
      calculatedItemsPrice += foodDoc.price * qty;

      validatedItems.push({
        food: foodDoc._id,
        name: foodDoc.name,
        image: foodDoc.image,
        price: foodDoc.price,
        quantity: qty,
        isVeg: foodDoc.isVeg,
      });
    }

    // Standard business logic: Free delivery over ₹500, else ₹40. Tax is 5%
    const deliveryPrice = calculatedItemsPrice >= 500 ? 0 : 40;
    const taxPrice = Math.round(calculatedItemsPrice * 0.05);
    const totalPrice = calculatedItemsPrice + deliveryPrice + taxPrice;

    // Simulate instant payment for digital methods (UPI / Card)
    const isDigital = paymentMethod === 'UPI' || paymentMethod === 'Card';

    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      phone: phone.trim(),
      paymentMethod,
      isPaid: isDigital,
      paidAt: isDigital ? new Date() : null,
      paymentResult: isDigital
        ? {
            id: `GENIE_TXN_${Date.now()}`,
            status: 'COMPLETED',
            updateTime: new Date().toISOString(),
          }
        : undefined,
      itemsPrice: calculatedItemsPrice,
      taxPrice,
      deliveryPrice,
      totalPrice,
      estimatedDeliveryMinutes: 30,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order identifier',
      });
    }

    const order = await Order.findById(id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Authorization check: User can only access their own order unless Admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have permission to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!STATUS_PROGRESSION.concat('Cancelled').includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${STATUS_PROGRESSION.join(', ')}, Cancelled`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || STATUS_NOTES[status] || `Order status updated to ${status}`,
    });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Simulate/Advance next order progress step (Demo utility for real-time tracking)
 * @route   PUT /api/orders/:id/simulate-step
 * @access  Private
 */
export const simulateOrderProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only owner or admin can simulate progress for this order
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden',
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot advance progress for a cancelled order',
        order,
      });
    }

    const currentIndex = STATUS_PROGRESSION.indexOf(order.orderStatus);

    if (currentIndex >= STATUS_PROGRESSION.length - 1) {
      return res.status(200).json({
        success: true,
        message: 'Order is already delivered!',
        order,
      });
    }

    const nextStatus = STATUS_PROGRESSION[currentIndex + 1];
    order.orderStatus = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note: STATUS_NOTES[nextStatus],
    });

    if (nextStatus === 'Delivered') {
      order.deliveredAt = new Date();
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order advanced to ${nextStatus}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by customer' } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order identifier',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership or admin permission
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You do not have permission to cancel this order',
      });
    }

    // Check if order is already cancelled
    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled',
      });
    }

    // Check if order is already delivered
    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled',
      });
    }

    // Non-admin customer cannot cancel when order is already out for delivery
    if (!isAdmin && order.orderStatus === 'Out for Delivery') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order once rider is out for delivery. Please contact customer support.',
      });
    }

    const trimmedReason = typeof reason === 'string' && reason.trim() ? reason.trim() : 'Cancelled by customer';
    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = trimmedReason;

    // Build timeline note with refund info if applicable
    let note = `Order cancelled. Reason: ${trimmedReason}`;
    if (order.isPaid) {
      note += ` (Refund of ₹${order.totalPrice} initiated to original payment method).`;
    } else {
      note += ' (Cash on delivery cancelled; no payment due).';
    }

    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note,
    });

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

