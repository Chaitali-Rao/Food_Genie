import jwt from 'jsonwebtoken';

/**
 * Generate signed JSON Web Token
 * @param {string} id - User ObjectId string
 * @param {string} role - User role (customer / admin)
 * @returns {string} Signed JWT
 */
export const generateToken = (id, role = 'customer') => {
  const secret = process.env.JWT_SECRET || 'food_genie_dev_jwt_secret_fallback_2026';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign({ id, role }, secret, {
    expiresIn,
  });
};

export default generateToken;

