'use strict';

const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
  {
    opportunityId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, trim: true, default: '' },
    reward: { type: String, trim: true, default: 'TBD' },
    rewardToken: { type: String, trim: true, default: 'STX' },
    status: { type: String, default: 'open' },
    // User-set tracking status
    userStatus: {
      type: String,
      enum: ['active', 'applied', 'won', 'expired'],
      default: 'active',
    },
    category: { type: String, trim: true, default: 'General' },
    type: {
      type: String,
      enum: ['bounty', 'quest', 'gig', 'event', 'grant', 'job'],
      default: 'bounty',
    },
    poster: { type: String, trim: true, default: 'Zero Authority DAO' },
    url: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '', maxlength: 1000 },
    postedAt: { type: Date, default: null },
    deadline: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookmarkSchema.index({ opportunityId: 1 }, { unique: true });
BookmarkSchema.index({ createdAt: -1 });
BookmarkSchema.index({ userStatus: 1 });

BookmarkSchema.virtual('deadlineFormatted').get(function () {
  if (!this.deadline) return 'No deadline';
  return this.deadline.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);