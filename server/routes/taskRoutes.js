const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { 
  createTaskSchema, 
  updateTaskSchema, 
  submissionSchema, 
  rejectTaskSchema 
} = require('../utils/validators');

// ==========================================
// GLOBAL PROTECTION
// ==========================================
router.use(authenticate);

// ==========================================
// GENERAL TASK ROUTES
// ==========================================
// Everyone can see tasks (Controller filters by role/team)
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);

// ==========================================
// TASK MANAGEMENT (Admins & Sub-Admins)
// ==========================================

// ✅ Updated: Sub-Admins can now create and manage tasks for their volunteers
router.post(
  '/', 
  authorizeRoles('super_admin', 'admin', 'sub-admin'), 
  validate(createTaskSchema), 
  taskController.createTask
);

router.put(
  '/:id', 
  authorizeRoles('super_admin', 'admin', 'sub-admin'), 
  validate(updateTaskSchema), 
  taskController.updateTask
);

router.delete(
  '/:id', 
  authorizeRoles('super_admin', 'admin', 'sub-admin'), 
  taskController.deleteTask
);

// ==========================================
// 🚀 NEW: TASK DELEGATION
// ==========================================
// Allows Sub-Admins to re-assign tasks they own to their subordinates
router.post(
  '/:id/delegate', 
  authorizeRoles('admin', 'sub-admin'), 
  taskController.delegateTask
);

// ==========================================
// SUBMISSION & REVIEW
// ==========================================

// Any authenticated user can submit (Controller checks if they are the assignee)
router.post(
  '/:id/submit', 
  validate(submissionSchema), 
  taskController.submitTask
);

// ✅ Updated: Sub-Admins can now approve/reject work from volunteers
router.patch(
  '/:id/approve', 
  authorizeRoles('super_admin', 'admin', 'sub-admin'), 
  taskController.approveTask
);

router.patch(
  '/:id/reject', 
  authorizeRoles('super_admin', 'admin', 'sub-admin'), 
  validate(rejectTaskSchema), 
  taskController.rejectTask
);

module.exports = router;