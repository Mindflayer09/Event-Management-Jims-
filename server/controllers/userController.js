const User = require('../models/User');
// ✅ Ensure these are imported correctly
const { notifyUserApproved, notifyUserDeleted } = require('../services/notificationService');

const isSuperAdmin = (req) => req.user.role === 'super_admin';

exports.getAllUsers = async (req, res, next) => {
  try {
    let query = {};
    if (!isSuperAdmin(req)) {
      if (!req.user.team) return res.status(403).json({ success: false, message: "No organization associated" });
      query.team = req.user.team;
    }

    const users = await User.find(query)
      .populate('team', 'name') 
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) { next(error); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('team', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!isSuperAdmin(req) && user.team?.toString() !== req.user.team?.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, team } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!isSuperAdmin(req) && user.team?.toString() !== req.user.team?.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (team && isSuperAdmin(req)) user.team = team; 
    
    await user.save();
    res.json({ success: true, message: 'User updated successfully', data: { user } });
  } catch (error) { next(error); }
};

// 🟢 FIX 1: Awaiting the notification and handling the response
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('team');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const canApprove = isSuperAdmin(req) || (user.team?._id.toString() === req.user.team?.toString());
    if (!canApprove) return res.status(403).json({ success: false, message: 'Permission denied' });

    user.isApproved = true;
    await user.save();

    // ✅ FIX: Await the notification so the server doesn't "kill" the task early
    try {
      await notifyUserApproved(user);
      console.log(`📧 Approval email triggered for: ${user.email}`);
    } catch (err) {
      console.error('❌ Email Notification Failed:', err.message);
      // We don't return an error to the user because the DB update was successful
    }

    res.json({ success: true, message: 'User approved successfully' });
  } catch (error) { next(error); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!isSuperAdmin(req)) return res.status(403).json({ success: false, message: 'Only Super Admin can change roles' });

    user.role = role;
    await user.save();
    res.json({ success: true, message: 'Role updated', data: { user } });
  } catch (error) { next(error); }
};

// 🔴 FIX 2: Added notifyUserDeleted and proper sequencing
exports.deleteUser = async (req, res, next) => {
  try {
    // 1. Find and populate user first (to get their email and team name for the template)
    const user = await User.findById(req.params.id).populate('team');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Permission check
    const canDelete = isSuperAdmin(req) || (user.team?._id.toString() === req.user.team?.toString());
    if (!canDelete || user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    // 3. Send notification BEFORE deleting from database
    try {
      await notifyUserDeleted(user);
      console.log(`📧 Deletion email triggered for: ${user.email}`);
    } catch (err) {
      console.error('❌ Deletion Notification Failed:', err.message);
    }

    // 4. Finally, remove the record
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) { next(error); }
};