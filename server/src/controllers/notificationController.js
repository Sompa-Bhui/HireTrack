import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

export const listNotifications = asyncHandler(async (req, res) => {
  res.json(await Notification.find({ user: req.user._id }).sort('-createdAt'));
});
