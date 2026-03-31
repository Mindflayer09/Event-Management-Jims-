const User = require('../models/User');
const Team = require('../models/Team');
const OTP = require('../models/Otp');
const { generateToken } = require('../utils/tokenUtils');
const { sendEmail, templates } = require('../services/emailService');

// ==========================================
// REGISTRATION STEP 1: Request OTP
// ==========================================
exports.requestRegistrationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use. Please log in.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email }); 
    await OTP.create({ email, otp: otpCode });
  
    const template = templates.verificationCode(otpCode);
    await sendEmail(email, template.subject, template.body);

    res.status(200).json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REGISTRATION STEP 2: Verify OTP & Create User
// ==========================================
exports.verifyRegistrationAndCreateUser = async (req, res, next) => {
  try {
    const { email, otp, name, password, role, teamId, team, club } = req.body;

    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    await OTP.deleteOne({ _id: validOTP._id });

    // Organization Validation
    const finalTeamId = teamId || team || club || null;
    let teamName = "the platform";
    
    if (finalTeamId) {
      const foundTeam = await Team.findById(finalTeamId);
      if (!foundTeam) return res.status(404).json({ success: false, message: 'Organization not found' });
      teamName = foundTeam.name;
    }

    // 🚀 ROLE LOGIC: Handle 'sub-admin' correctly
    const userRole = role || 'user';
    
    // Super Admins are auto-approved. 
    // In a production app, Admins/Sub-Admins usually wait for Super Admin approval.
    const user = await User.create({
      name,
      email,
      password, 
      team: finalTeamId, 
      role: userRole,
      isApproved: userRole === 'super_admin' ? true : false 
    });

    // ✅ TWO-WAY LINKING: Update the Team's member array
    if (finalTeamId) {
      // Determine Team-level access based on App-level role
      let accessLevel = 'member';
      let position = 'Member';

      if (userRole === 'admin') {
        accessLevel = 'admin';
        position = 'Organization Admin';
      } else if (userRole === 'sub-admin') {
        accessLevel = 'member'; // They are members in the Team schema, but have 'sub-admin' App Role
        position = 'Sub-Admin';
      }

      await Team.findByIdAndUpdate(finalTeamId, {
        $push: { 
          members: { 
            user: user._id, 
            accessLevel,
            position,
            joinedAt: new Date()
          } 
        }
      });
    }

    const populatedUser = await User.findById(user._id).populate('team', 'name');
    const token = generateToken(populatedUser);

    res.status(201).json({
      success: true,
      message: userRole === 'super_admin' 
        ? "Registration successful! Welcome to the Command Center."
        : `Registration successful! You have applied to join ${teamName}. Please wait for approval.`,
      data: {
        token,
        user: {
          _id: populatedUser._id,
          name: populatedUser.name,
          email: populatedUser.email,
          role: populatedUser.role,
          team: populatedUser.team,
          isApproved: populatedUser.isApproved,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// ==========================================
// LOGIN: Password-based
// ==========================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('team', 'name');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 🚀 UPDATED: isPlatformAdmin now includes 'sub-admin' 
    // This allows them to bypass the "isApproved" lock if they are internal staff,
    // or you can keep them locked until a Super Admin approves them.
    const privilegedRoles = ['super_admin', 'admin', 'sub-admin'];
    const isStaff = privilegedRoles.includes(user.role);

    if (!user.isApproved && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval by your team administrator.',
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
          team: user.team,
          isApproved: user.isApproved,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET ME: Get Current User Profile
// ==========================================
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('team', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};