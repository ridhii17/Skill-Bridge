import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import authService, { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.created(
    res,
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    'Account created successfully'
  );
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.success(
    res,
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    'Logged in successfully'
  );
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(req.user?._id, refreshToken);

  clearAuthCookies(res);

  return ApiResponse.success(res, null, 'Logged out successfully');
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

  setAuthCookies(res, accessToken, newRefreshToken);

  return ApiResponse.success(
    res,
    { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    'Token refreshed successfully'
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  return ApiResponse.success(res, user, 'User profile loaded');
});
