const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, NOTIFICATION_STATUSES } = require('../utils/constants');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    relatedEntity: {
      entityType: { type: String },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUSES),
      default: NOTIFICATION_STATUSES.PENDING,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ status: 1 });
notificationSchema.index({ status: 1, retryCount: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
