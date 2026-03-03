const mongoose = require('mongoose');
const { TASK_STATUSES, TASK_PRIORITIES, EVENT_PHASES } = require('../utils/constants');

const submissionSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    publicId: { type: String },
    notes: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUSES),
      default: TASK_STATUSES.PENDING,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    submissions: [submissionSchema],
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
    },
    phase: {
      type: String,
      enum: Object.values(EVENT_PHASES),
      required: [true, 'Task phase is required'],
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

taskSchema.index({ event: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ event: 1, phase: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
