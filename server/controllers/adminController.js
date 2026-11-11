import Order from '../models/Order.js';
import Food from '../models/Food.js';
import User from '../models/User.js';

/**
 * @desc    Get aggregated business analytics and dashboard metrics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const activeFoods = await Food.countDocuments({ isAvailable: true });
    const totalDishes = await Food.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // Aggregate total revenue from all non-cancelled orders
    const revenueAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Aggregate orders by status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = {
      Placed: 0,
      Confirmed: 0,
      Preparing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };
    statusCounts.forEach((item) => {
      if (statusBreakdown[item._id] !== undefined) {
        statusBreakdown[item._id] = item.count;
      }
    });

    // 5 most recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Aggregate top 5 popular dishes
    const topDishes = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.food',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          totalQuantitySold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        activeFoods,
        totalDishes,
        totalUsers,
        statusBreakdown,
        recentOrders,
        topDishes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with filtering and search for Admin order management
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      if (trimmed.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = trimmed;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / pageSize),
      currentPage: pageNum,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Update order status with custom notes
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

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
      note: note || `Admin updated order status to ${status}`,
    });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = new Date();
    }

    const updatedOrder = await order.save();
    const populated = await Order.findById(updatedOrder._id).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Order status successfully changed to ${status}`,
      order: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: 1-click toggle dish availability (in stock / out of stock)
 * @route   PUT /api/admin/foods/:id/toggle-stock
 * @access  Private/Admin
 */
export const toggleFoodStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    res.status(200).json({
      success: true,
      message: `Food item '${food.name}' is now ${food.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}`,
      isAvailable: food.isAvailable,
      food,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all foods with stock status for management
 * @route   GET /api/admin/foods
 * @access  Private/Admin
 */
export const getAllFoodsAdmin = async (req, res, next) => {
  try {
    const foods = await Food.find({}).populate('category', 'name slug icon').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

