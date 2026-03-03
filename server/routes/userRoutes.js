const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { updateRoleSchema } = require('../utils/validators');

router.use(authenticate);

// Only admin should manage users
router.get('/', requireRole('admin'), userController.getAllUsers);

router.get('/:id', requireRole('admin'), userController.getUserById);

router.put('/:id', requireRole('admin'), userController.updateUser);

router.delete('/:id', requireRole('admin'), userController.deleteUser);

router.patch('/:id/approve', requireRole('admin'), userController.approveUser);

router.patch('/:id/role', requireRole('admin'), validate(updateRoleSchema), userController.updateRole);

module.exports = router;