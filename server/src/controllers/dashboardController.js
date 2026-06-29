import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import DailyTracker from '../models/DailyTracker.js';
import User from '../models/User.js';
import { computeAchievementIds } from '../utils/tracker.js';
import { dateKey, dayBounds, monthBounds, weekBounds } from '../utils/date.js';

const PLATFORM_ORDER = ['LinkedIn', 'Indeed', 'Naukri', 'Foundit', 'Wellfound', 'HR Email', 'Company Career Page', 'Referral', 'Internshala', 'Glassdoor', 'Other'];

export const getDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { start: dayStart, end: dayEnd } = dayBounds();
  const { start: weekStart, end: weekEnd } = weekBounds();
  const { start: monthStart, end: monthEnd } = monthBounds();

  const [todayTracker, weekTrackers, monthTrackers, history, responses] = await Promise.all([
    DailyTracker.findOne({ user: req.user._id, date: dateKey() }),
    DailyTracker.find({ user: req.user._id, date: { $gte: dateKey(weekStart), $lt: dateKey(weekEnd) } }),
    DailyTracker.find({ user: req.user._id, date: { $gte: dateKey(monthStart), $lt: dateKey(monthEnd) } }),
    DailyTracker.find({ user: req.user._id }).sort({ date: -1 }).limit(45),
    Application.aggregate([{ $match: { user: req.user._id, archived: { $ne: true } } }, { $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);

  const sumTrackers = (items) => items.reduce((sum, item) => sum + (item.totalApplications || 0), 0);
  const totalApplications = sumTrackers(history);
  const todayApplications = todayTracker?.totalApplications || 0;
  const weekCount = sumTrackers(weekTrackers);
  const monthCount = sumTrackers(monthTrackers);
  const sourceAnalyticsRaw = {};
  history.forEach((record) => {
    Object.entries(record.platforms || {}).forEach(([platform, count]) => {
      sourceAnalyticsRaw[platform] = (sourceAnalyticsRaw[platform] || 0) + Number(count || 0);
    });
  });
  const sourceAnalytics = PLATFORM_ORDER.map((platform) => ({ _id: platform, count: sourceAnalyticsRaw[platform] || 0 }));
  const dailyTrend = history.map((record) => ({ date: record.date, count: record.totalApplications }));
  const responseCount = (status) => responses.find((item) => item._id === status)?.count || 0;
  const responseTotal = responses.reduce((sum, item) => sum + item.count, 0);
  const responseRate = totalApplications ? Math.round((responseTotal / totalApplications) * 100) : 0;
  const interviewRate = totalApplications ? Math.round((responseCount('Interview') / totalApplications) * 100) : 0;
  const offerRate = totalApplications ? Math.round((responseCount('Offer') / totalApplications) * 100) : 0;
  const rejectedRate = totalApplications ? Math.round((responseCount('Rejected') / totalApplications) * 100) : 0;
  const wishlistCount = responseCount('Wishlist');
  const achievements = user.achievements?.length ? user.achievements : computeAchievementIds({ totalApplications, streak: user.streak });
  const recentResponses = await Application.find({ user: req.user._id, archived: { $ne: true } }).sort('-updatedAt').limit(8);

  res.json({
    totalApplications,
    todayApplications,
    weekCount,
    monthCount,
    currentStreak: user.streak,
    bestStreak: user.longestStreak || user.streak,
    totalMissionCompleted: user.totalMissionCompleted || 0,
    dailyGoal: user.dailyGoal,
    goalProgress: todayTracker ? Math.min(100, Math.round((todayTracker.totalApplications / user.dailyGoal) * 100)) : 0,
    goalCompleted: !!todayTracker?.goalCompleted,
    goalMessage: todayTracker?.goalCompleted ? 'Mission Completed' : 'Keep Going!',
    sourceAnalytics,
    dailyTrend,
    responseRate,
    interviewRate,
    offerRate,
    rejectedRate,
    wishlistCount,
    achievements,
    recentResponses
  });
});
