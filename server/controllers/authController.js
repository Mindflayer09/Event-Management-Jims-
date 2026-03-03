const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');
const { ROLES } = require('../utils/constants');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, club, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Auto approve if admin, else pending
    const isApproved = role === ROLES.ADMIN;

    const user = await User.create({
      name,
      email,
      password,
      club,
      role,
      isApproved: role === ROLES.ADMIN ? true : false,
    });

    res.status(201).json({
      success: true,
      message:
        role === ROLES.ADMIN
          ? 'Admin registered successfully'
          : 'Registration successful. Please wait for admin approval.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, club } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email',
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      club,
      isApproved: true, // admins are auto-approved
    });

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: { user: admin },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('club', 'name');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isApproved && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please contact admin.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          club: user.club,
          isApproved: user.isApproved,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('club', 'name description logo');

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
