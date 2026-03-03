export const ROLES = {
  ADMIN: 'admin',
  SUB_ADMIN: 'sub-admin',
  VOLUNTEER: 'volunteer',
};

export const EVENT_PHASES = {
  PRE: 'pre-event',
  DURING: 'during-event',
  POST: 'post-event',
};

export const TASK_STATUSES = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const PHASE_LABELS = {
  'pre-event': 'Pre-Event',
  'during-event': 'During Event',
  'post-event': 'Post-Event',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const PHASE_COLORS = {
  'pre-event': 'bg-blue-100 text-blue-800',
  'during-event': 'bg-yellow-100 text-yellow-800',
  'post-event': 'bg-green-100 text-green-800',
};

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
