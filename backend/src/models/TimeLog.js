const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // stored in seconds
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
timeLogSchema.index({ user: 1, isActive: 1 });
timeLogSchema.index({ user: 1, startTime: -1 });
timeLogSchema.index({ task: 1, user: 1 });

// Calculate duration before saving when stopping
timeLogSchema.pre('save', function () {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
    this.isActive = false;
  }
});

module.exports = mongoose.model('TimeLog', timeLogSchema);
