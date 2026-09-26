const { verifyAccessToken } = require('../utils/jwt');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access token is required');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return ApiResponse.unauthorized(res, 'User no longer exists');
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid access token');
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Access token has expired');
    }
    return ApiResponse.error(res, 'Authentication failed', 500);
  }
};

module.exports = { authenticate };
