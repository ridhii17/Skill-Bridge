import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(ApiError.unauthorized('Authentication required. Please log in.'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Access token expired. Please refresh.'));
      }
      return next(ApiError.unauthorized('Invalid authentication token'));
    }

    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user) {
      return next(ApiError.unauthorized('User not found'));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized('Account has been deactivated'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(ApiError.unauthorized('Authentication failed'));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) return next();

    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Silently ignore invalid tokens for optional auth
    }

    next();
  } catch {
    next();
  }
};
