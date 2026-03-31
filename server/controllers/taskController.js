const Task = require('../models/Task');
const Event = require('../models/Event');
const Team = require('../models/Team'); 
const User = require('../models/User');
const mongoose = require('mongoose'); 
const { TASK_STATUSES } = require('../utils/constants');
const {
  notifyTaskAssigned,
  notifyTaskSubmitted,
  notifyTaskApproved,
  notifyTaskRejected,
} = require('../services/notificationService');

// ==========================================
//  HELPER: Verify Team Access & Self-Heal
// ==========================================
const verifyTeamAccess = async (teamId, userId) => {
  if (!teamId || !userId) return false;

  try {
    const user = await User.findById(userId);
    const team = await Team.findById(teamId);

    if (!user || !team) return false;

    const privilegedRoles = ['admin', 'super_admin', 'sub-admin'];
    
    if (privilegedRoles.includes(user.role)) {
      // 🔧 SELF-HEALING: Ensure Admin/Sub-Admin is in the Team members list
      const isAlreadyInList = team.members.some(m => m.user.toString() === userId.toString());
      
      if (!isAlreadyInList) {
        await Team.findByIdAndUpdate(teamId, {
          $push: { 
            members: { 
              user: userId, 
              accessLevel: user.role === 'admin' ? 'admin' : 'member', 
              position: user.role.toUpperCase().replace('-', ' '),
              joinedAt: new Date()
            } 
          }
        });
      }
      return true;
    }

    // Fallback: Check for explicit 'admin' accessLevel in the Team document
    const isMemberAdmin = team.members.find(
      (m) => m.user.toString() === userId.toString() && m.accessLevel === 'admin'
    );

    return !!isMemberAdmin;
  } catch (err) {
    console.error("Auth helper error:", err);
    return false;
  }
};

// ==========================================
// GET /api/tasks
// ==========================================
exports.getAllTasks = async (req, res, next) => {
  try {
    const { event, status, assignedTo, page = 1, limit = 20 } = req.query;
    const teamId = req.headers['x-team-id'] || req.user.team;
    const filter = { team: teamId };

    if (status) filter.status = status;
    if (event) filter.event = event;

    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    if (!hasPrivileges) {
      // Volunteers: Only see tasks assigned TO them
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(filter)
      .populate('event', 'title phase')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('delegatedBy', 'name email') 
      .sort({ deadline: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          totalPages: Math.ceil(total / parseInt(limit)), 
          totalItems: total 
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET /api/tasks/:id
// ==========================================
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('event', 'title phase team')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('delegatedBy', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const teamId = req.headers['x-team-id'] || req.user.team;
    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    // Authorization: Only Managers or the specific Assignee can view
    if (!hasPrivileges && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// POST /api/tasks (Create Task)
// ==========================================
exports.createTask = async (req, res, next) => {
  try {
    const teamId = req.headers['x-team-id'] || req.user.team;
    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    if (!hasPrivileges) {
      return res.status(403).json({ success: false, message: 'Only team admins can assign tasks' });
    }

    const { title, description, event: eventId, assignedTo, deadline, priority, phase } = req.body;

    const task = await Task.create({
      title,
      description,
      event: eventId,
      assignedTo, 
      assignedBy: req.user._id,
      deadline,
      priority: priority || 'medium',
      phase,
      team: teamId 
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('event', 'title phase');

    notifyTaskAssigned(populatedTask).catch(console.error);
    res.status(201).json({ success: true, data: { task: populatedTask } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUT /api/tasks/:id (Update Task)
// ==========================================
exports.updateTask = async (req, res, next) => {
  try {
    const teamId = req.headers['x-team-id'] || req.user.team;
    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    if (!hasPrivileges) {
      return res.status(403).json({ success: false, message: 'Only team admins can edit tasks' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Block editing if task is already finalized
    if (task.status === TASK_STATUSES.APPROVED) {
      return res.status(400).json({ success: false, message: 'Cannot edit an approved task' });
    }

    const updates = req.body;
    const allowedUpdates = ['title', 'description', 'assignedTo', 'deadline', 'priority', 'phase'];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) task[field] = updates[field];
    });

    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('event', 'title phase');

    res.json({ success: true, data: { task: updatedTask } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🚀 NEW: POST /api/tasks/:id/delegate
// ==========================================
exports.delegateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { volunteerId } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // 🛡️ Logic: Only a sub-admin/admin CURRENTLY assigned to the task can delegate it
    const isCurrentAssignee = task.assignedTo.toString() === req.user._id.toString();
    const canDelegate = isCurrentAssignee && ['sub-admin', 'admin'].includes(req.user.role);

    if (!canDelegate) {
      return res.status(403).json({ success: false, message: "You can only delegate tasks assigned to you" });
    }

    task.delegatedBy = req.user._id; 
    task.assignedTo = volunteerId;   
    task.status = TASK_STATUSES.PENDING; 

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('delegatedBy', 'name email')
      .populate('event', 'title phase');

    notifyTaskAssigned(updatedTask).catch(console.error);
    res.json({ success: true, message: "Task successfully delegated!", data: { task: updatedTask } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 🚀 UPDATED: POST /api/tasks/:id/submit
// ==========================================
exports.submitTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { media, notes } = req.body;
    const safeMedia = Array.isArray(media) ? media : (media ? [media] : []);

    // 1. Populate the event to check its current phase
    const task = await Task.findById(id).populate('event', 'title phase isFinalized');
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    
    // 2. Authorization Check
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the assigned member can submit work" });
    }

    // 3. 🛑 STRICT PHASE VALIDATION LOGIC
    if (task.event.isFinalized) {
      return res.status(400).json({ success: false, message: "Event is finalized. No further submissions allowed." });
    }

    const PHASE_ORDER = ['pre-event', 'during-event', 'post-event'];
    const currentEventPhase = PHASE_ORDER.indexOf(task.event.phase);
    const requiredTaskPhase = PHASE_ORDER.indexOf(task.phase);

    // If the event hasn't reached the task's phase yet, block submission.
    // (e.g., Event is 'pre-event' (0), Task is 'during-event' (1) -> Blocked)
    if (currentEventPhase < requiredTaskPhase) {
      return res.status(400).json({ 
        success: false, 
        message: `Task is scheduled for the '${task.phase}' phase, but the event is currently in '${task.event.phase}'. Please wait until the phase begins.` 
      });
    }

    const mongoId = new mongoose.Types.ObjectId(id);
    
    await Task.collection.updateOne(
      { _id: mongoId },
      {
        $push: {
          submissions: {
            media: safeMedia, 
            notes: notes || "",
            uploadedAt: new Date()
          }
        },
        $set: {
          status: TASK_STATUSES.SUBMITTED, // Make sure TASK_STATUSES is imported at the top!
          rejectionReason: ""
        }
      }
    );

    const updatedTask = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("event", "title phase");

    notifyTaskSubmitted(updatedTask).catch(console.error);
    res.json({ success: true, message: "Work submitted successfully!", data: { task: updatedTask } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PATCH /api/tasks/:id/approve
// ==========================================
exports.approveTask = async (req, res, next) => {
  try {
    const teamId = req.headers['x-team-id'] || req.user.team;
    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    if (!hasPrivileges) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    task.status = TASK_STATUSES.APPROVED;
    await task.save();

    await task.populate('assignedTo', 'name email');
    await task.populate('event', 'title phase');

    notifyTaskApproved(task).catch(console.error);
    res.json({ success: true, message: 'Task approved', data: { task } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PATCH /api/tasks/:id/reject
// ==========================================
exports.rejectTask = async (req, res, next) => {
  try {
    const teamId = req.headers['x-team-id'] || req.user.team;
    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    if (!hasPrivileges) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { rejectionReason } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = TASK_STATUSES.REJECTED;
    task.rejectionReason = rejectionReason || "No reason provided.";
    await task.save();

    await task.populate('assignedTo', 'name email');
    await task.populate('event', 'title phase');

    notifyTaskRejected(task).catch(console.error);
    res.json({ success: true, message: 'Task rejected', data: { task } });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE /api/tasks/:id
// ==========================================
exports.deleteTask = async (req, res, next) => {
  try {
    const teamId = req.headers['x-team-id'] || req.user.team;
    const hasPrivileges = await verifyTeamAccess(teamId, req.user._id);

    if (!hasPrivileges) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};