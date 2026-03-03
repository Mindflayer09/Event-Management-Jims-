const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

const requireClubMatch = (getClubId) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceClubId = await getClubId(req);
      if (!resourceClubId) {
        return res.status(404).json({ success: false, message: 'Resource not found' });
      }

      if (req.user.club.toString() !== resourceClubId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only access resources within your own club',
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireRole, requireClubMatch };
