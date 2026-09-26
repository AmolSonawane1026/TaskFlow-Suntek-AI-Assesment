const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: refreshToken },
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user with email and password
   */
  async login({ email, password }) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token (limit to 5 active sessions)
    await User.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          $each: [refreshToken],
          $slice: -5, // Keep only last 5 refresh tokens
        },
      },
    });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if refresh token exists in user's stored tokens
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      // Token reuse detected - invalidate all tokens
      await User.findByIdAndUpdate(decoded.userId, {
        $set: { refreshTokens: [] },
      });
      throw new AppError('Token reuse detected. All sessions invalidated.', 401);
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Remove old refresh token and add new one
    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: refreshToken },
    });
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user - invalidate refresh token
   */
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }
    return true;
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.toJSON();
  }
}

module.exports = new AuthService();
