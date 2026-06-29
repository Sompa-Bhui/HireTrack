import asyncHandler from 'express-async-handler';
import DailyTracker from '../models/DailyTracker.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { dayBounds, dateKey, monthBounds, weekBounds } from '../utils/date.js';
import { computeAchievementIds } from '../utils/tracker.js';

const PLATFORMS = ['LinkedIn', 'Indeed', 'Naukri', 'Foundit', 'Wellfound', 'HR Email', 'Company Career Page', 'Referral', 'Internshala', 'Glassdoor', 'Other'];

const getDailyGoal = async (userId) => (await User.findById(userId)).dailyGoal || 100;

const refreshStreak = async (user, totalApplications, trackerDate, completed) => {
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - 86400000));
  if (completed && user.goalCompletedDate !== today) {
    user.streak = user.goalCompletedDate === yesterday ? user.streak + 1 : 1;
    user.longestStreak = Math.max(user.longestStreak || 0, user.streak);
    user.totalMissionCompleted = (user.totalMissionCompleted || 0) + 1;
    user.goalCompleted = true;
    user.goalCompletedDate = today;
  } else if (!completed && user.goalCompletedDate !== today && trackerDate === today) {
    user.goalCompleted = false;
  }
  user.achievements = computeAchievementIds({ totalApplications, streak: user.streak });
  await user.save();
};

export const upsertToday = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const date = req.body.date || dateKey();
  const platforms = {};
  let totalApplications = 0;
  for (const platform of PLATFORMS) {
    const value = Number(req.body[platform]) || 0;
    platforms[platform] = value;
    totalApplications += value;
  }

  const dailyGoal = await getDailyGoal(userId);
  const goalCompleted = totalApplications >= dailyGoal;
  const tracker = await DailyTracker.findOneAndUpdate(
    { user: userId, date },
    { user: userId, date, platforms, totalApplications, dailyGoal, goalCompleted },
    { new: true, upsert: true }
  );

  const user = await User.findById(userId);
  user.dailyGoal = req.body.dailyGoal ? Number(req.body.dailyGoal) : user.dailyGoal;
  await refreshStreak(user, totalApplications, date, goalCompleted);
  res.status(201).json(tracker);
});

export const getToday = asyncHandler(async (req, res) => {
  const date = req.query.date || dateKey();
  let tracker = await DailyTracker.findOne({ user: req.user._id, date });
  if (!tracker) {
    tracker = await DailyTracker.create({ user: req.user._id, date, platforms: {}, totalApplications: 0, dailyGoal: await getDailyGoal(req.user._id) });
  }
  res.json(tracker);
});

export const listHistory = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const query = { user: req.user._id };
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = from;
    if (to) query.date.$lte = to;
  }
  const items = await DailyTracker.find(query).sort({ date: -1 });
  res.json({ items });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { start: dayStart, end: dayEnd } = dayBounds();
  const { start: weekStart, end: weekEnd } = weekBounds();
  const { start: monthStart, end: monthEnd } = monthBounds();

  const [today, week, month, all] = await Promise.all([
    DailyTracker.aggregate([{ $match: { user: userId, date: dateKey() } }, { $group: { _id: null, total: { $sum: '$totalApplications' } } }]),
    DailyTracker.aggregate([{ $match: { user: userId, date: { $gte: dateKey(weekStart), $lte: dateKey(weekEnd) } } }, { $group: { _id: null, total: { $sum: '$totalApplications' } } }]),
    DailyTracker.aggregate([{ $match: { user: userId, date: { $gte: dateKey(monthStart), $lte: dateKey(monthEnd) } } }, { $group: { _id: null, total: { $sum: '$totalApplications' } } }]),
    DailyTracker.find({ user: userId }).sort('date')
  ]);

  const sourceAgg = await DailyTracker.aggregate([
    { $match: { user: userId } },
    { $project: { sourcePairs: { $objectToArray: '$platforms' } } },
    { $unwind: '$sourcePairs' },
    { $group: { _id: '$sourcePairs.k', count: { $sum: '$sourcePairs.v' } } }
  ]);
  const sourceAnalytics = PLATFORMS.map((platform) => ({ _id: platform, count: sourceAgg.find((x) => x._id === platform)?.count || 0 }));
  const trend = all.map((item) => ({ date: item.date, count: item.totalApplications }));

  const responseCounts = await Application.aggregate([
    { $match: { user: userId, archived: { $ne: true } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const totalResponses = responseCounts.reduce((sum, x) => sum + x.count, 0);
  const count = (status) => responseCounts.find((x) => x._id === status)?.count || 0;

  res.json({
    todayApplications: today[0]?.total || 0,
    weekCount: week[0]?.total || 0,
    monthCount: month[0]?.total || 0,
    sourceAnalytics,
    dailyTrend: trend,
    responseRate: totalResponses ? Math.round((totalResponses / Math.max(trend.reduce((a, b) => a + b.count, 0), 1)) * 100) : 0,
    interviewRate: totalResponses ? Math.round((count('Interview') / totalResponses) * 100) : 0,
    offerRate: totalResponses ? Math.round((count('Offer') / totalResponses) * 100) : 0,
    rejectedRate: totalResponses ? Math.round((count('Rejected') / totalResponses) * 100) : 0,
    wishlistCount: count('Wishlist')
  });
});
