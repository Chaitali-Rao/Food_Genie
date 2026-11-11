import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect private routes by validating JWT in Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authorization token provided',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'food_genie_dev_jwt_secret_fallback_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User belonging to this token no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authorization token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware generator.
 * @param  {...string} roles - Permitted roles (e.g. 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || 'guest'}' does not have permission to perform this action`,
      });
    }
    next();
  };
};

/**
 * Shortcut middleware for admin-only routes.
 */
export const adminOnly = authorize('admin');

