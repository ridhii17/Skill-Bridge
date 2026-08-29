import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  path: '/',
};

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

function parseExpiry(expiry) {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;
  const val = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return val * 1000;
    case 'm': return val * 60 * 1000;
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseExpiry(config.jwt.expiry),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: parseExpiry(config.jwt.refreshExpiry),
  });
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...COOKIE_OPTIONS });
  res.clearCookie(REFRESH_COOKIE, { ...COOKIE_OPTIONS });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}

class AuthService {
  async register({ name, email, password, role }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await User.create({ name, email, password, role });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.addRefreshToken(refreshToken);

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password +refreshTokens'
    );

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated. Contact support.');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    user.lastLogin = new Date();
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.addRefreshToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshTokenValue) {
    if (!refreshTokenValue) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshTokenValue, config.jwt.refreshSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Refresh token expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Account has been deactivated');
    }

    // Check if this refresh token is in the user's stored tokens
    const tokenExists = user.refreshTokens.includes(refreshTokenValue);
    if (!tokenExists) {
      // Possible token reuse attack — clear all tokens
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      throw ApiError.unauthorized('Refresh token reuse detected. Please log in again.');
    }

    // Rotate: remove old, issue new pair
    await user.removeRefreshToken(refreshTokenValue);

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    await user.addRefreshToken(newRefreshToken);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId, refreshToken) {
    if (userId) {
      const user = await User.findById(userId).select('+refreshTokens');
      if (user && refreshToken) {
        await user.removeRefreshToken(refreshToken);
      }
    }
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return sanitizeUser(user);
  }
}

export default new AuthService();
export { setAuthCookies, clearAuthCookies, COOKIE_OPTIONS, ACCESS_COOKIE, REFRESH_COOKIE };
