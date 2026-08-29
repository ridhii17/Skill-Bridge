import ApiError from '../utils/ApiError.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export const authorizeOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Admin can access everything
    if (req.user.role === 'admin') return next();

    const ownerId = await getResourceOwnerId(req);
    if (!ownerId) {
      return next(ApiError.notFound('Resource not found'));
    }

    if (ownerId.toString() !== req.user._id.toString()) {
      return next(ApiError.forbidden('You can only access your own resources'));
    }

    next();
  };
};
