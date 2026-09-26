const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register({ name, email, password });

      return ApiResponse.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      return ApiResponse.success(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user.userId, refreshToken);

      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.userId);

      return ApiResponse.success(res, { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
