import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import User from '../models/User.js';
import { computeAchievementIds, getDayBounds, getMonthBounds, getProgressPercentage, getWeekBounds, isSameDateKey, toDateKey } from '../utils/tracker.js';

const SOURCE_OPTIONS = ['LinkedIn', 'Indeed', 'Naukri', 'Foundit', 'Wellfound', 'HR Email', 'Company Career Page', 'Referral', 'Internshala', 'Glassdoor', 'Other'];
const STATUS_OPTIONS = ['Wishlist', 'Applied', 'OA', 'Interview', 'HR Round', 'Offer', 'Rejected'];

const buildQuery = (req) => {
  const { search = '', status, source, company, role, location, from, to, includeArchived = 'false' } = req.query;
  const query = { user: req.user._id };
  if (includeArchived !== 'true') query.archived = { $ne: true };

  if (search) {
    query.$or = [
      { companyName: new RegExp(search, 'i') },
      { jobTitle: new RegExp(search, 'i') },
      { location: new RegExp(search, 'i') }
    ];
  }
  if (status) query.status = status;
  if (source) query.applicationSource = source;
  if (company) query.companyName = new RegExp(company, 'i');
  if (role) query.jobTitle = new RegExp(role, 'i');
  if (location) query.location = new RegExp(location, 'i');
  if (from || to) {
    query.appliedDate = {};
    if (from) query.appliedDate.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.appliedDate.$lte = end;
    }
  }
  return query;
};

const getCountMap = async (userId) => {
  const counts = await Application.aggregate([
    { $match: { user: userId, archived: { $ne: true } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  return counts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

const getApplicationsBySource = async (userId) => {
  const counts = await Application.aggregate([
    { $match: { user: userId, archived: { $ne: true } } },
    { $group: { _id: '$applicationSource', count: { $sum: 1 } } }
  ]);
  return SOURCE_OPTIONS.map((source) => ({
    _id: source,
    count: counts.find((entry) => entry._id === source)?.count || 0
  }));
};

const getHeatmapData = async (userId) => {
  const { start } = getMonthBounds(new Date(new Date().setMonth(new Date().getMonth() - 5)));
  const end = new Date();
  end.setDate(end.getDate() + 1);
  const items = await Application.find({
    user: userId,
    archived: { $ne: true },
    appliedDate: { $gte: start, $lt: end }
  }).select('appliedDate status').lean();

  const map = new Map();
  items.forEach((item) => {
    const key = toDateKey(new Date(item.appliedDate));
    const existing = map.get(key) || { date: key, count: 0 };
    existing.count += 1;
    map.set(key, existing);
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const refreshGoalAndStreak = async (user) => {
  const today = new Date();
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(new Date(today.getTime() - 24 * 60 * 60 * 1000));
  const { start, end } = getDayBounds(today);
  const todayCount = await Application.countDocuments({
    user: user._id,
    archived: { $ne: true },
    appliedDate: { $gte: start, $lt: end }
  });

  const goalCompletedToday = todayCount >= user.dailyGoal;
  const alreadyCompletedToday = isSameDateKey(user.goalCompletedDate, todayKey);

  if (goalCompletedToday && !alreadyCompletedToday) {
    user.streak = isSameDateKey(user.goalCompletedDate, yesterdayKey) ? user.streak + 1 : 1;
    user.goalCompleted = true;
    user.goalCompletedAt = today;
    user.goalCompletedDate = todayKey;
  } else if (!goalCompletedToday && !alreadyCompletedToday) {
    user.goalCompleted = false;
  }

  const totalApplications = await Application.countDocuments({ user: user._id, archived: { $ne: true } });
  user.achievements = computeAchievementIds({ totalApplications, streak: user.streak });
  await user.save();
  return { todayCount, goalCompletedToday };
};

const buildAnalytics = async (userId) => {
  const [totalApplications, interviews, offers, rejections, wishlist, todayCount, weekCount, monthCount, archived] = await Promise.all([
    Application.countDocuments({ user: userId, archived: { $ne: true } }),
    Application.countDocuments({ user: userId, status: 'Interview', archived: { $ne: true } }),
    Application.countDocuments({ user: userId, status: 'Offer', archived: { $ne: true } }),
    Application.countDocuments({ user: userId, status: 'Rejected', archived: { $ne: true } }),
    Application.countDocuments({ user: userId, status: 'Wishlist', archived: { $ne: true } }),
    Application.countDocuments({ user: userId, appliedDate: { $gte: getDayBounds().start, $lt: getDayBounds().end }, archived: { $ne: true } }),
    Application.countDocuments({ user: userId, appliedDate: { $gte: getWeekBounds().start, $lt: getWeekBounds().end }, archived: { $ne: true } }),
    Application.countDocuments({ user: userId, appliedDate: { $gte: getMonthBounds().start, $lt: getMonthBounds().end }, archived: { $ne: true } }),
    Application.countDocuments({ user: userId, archived: true })
  ]);

  const user = await User.findById(userId);
  const sourceAnalytics = await getApplicationsBySource(userId);
  const heatmap = await getHeatmapData(userId);
  const successRate = totalApplications ? Math.round(((offers + interviews) / totalApplications) * 100) : 0;
  const responseRate = totalApplications ? Math.round(((interviews + offers + rejections) / totalApplications) * 100) : 0;
  const interviewRate = totalApplications ? Math.round((interviews / totalApplications) * 100) : 0;
  const offerRate = totalApplications ? Math.round((offers / totalApplications) * 100) : 0;
  const rejectedRate = totalApplications ? Math.round((rejections / totalApplications) * 100) : 0;
  const goalProgress = getProgressPercentage(todayCount, user.dailyGoal);
  const achievements = user.achievements?.length ? user.achievements : computeAchievementIds({ totalApplications, streak: user.streak });

  return {
    totalApplications,
    interviews,
    offers,
    rejections,
    wishlist,
    archived,
    todayCount,
    weekCount,
    monthCount,
    responseRate,
    interviewRate,
    offerRate,
    rejectedRate,
    successRate,
    dailyGoal: user.dailyGoal,
    streak: user.streak,
    goalCompleted: user.goalCompleted,
    goalMessage: user.goalCompleted ? 'Mission Success!' : user.streak ? 'Keep Going!' : 'Start your momentum today!',
    goalProgress,
    sourceAnalytics,
    heatmap,
    achievements,
    recentActivity: await Application.find({ user: userId, archived: { $ne: true } }).sort('-updatedAt').limit(5)
  };
};

export const listApplications = asyncHandler(async (req, res) => {
  const { sort = '-createdAt', page = 1, limit = 50 } = req.query;
  const query = buildQuery(req);
  const items = await Application.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit));
  const total = await Application.countDocuments(query);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

export const createApplication = asyncHandler(async (req, res) => {
  const payload = {
    user: req.user._id,
    companyName: req.body.companyName,
    jobTitle: req.body.jobTitle,
    location: req.body.location || '',
    applicationSource: SOURCE_OPTIONS.includes(req.body.applicationSource) ? req.body.applicationSource : 'Other',
    status: STATUS_OPTIONS.includes(req.body.status) ? req.body.status : 'Wishlist',
    appliedDate: req.body.appliedDate || Date.now(),
    jobUrl: req.body.jobUrl || '',
    notes: req.body.notes || '',
    archived: !!req.body.archived
  };
  const item = await Application.create(payload);
  await refreshGoalAndStreak(req.user);
  res.status(201).json(item);
});

export const updateApplication = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.applicationSource && !SOURCE_OPTIONS.includes(payload.applicationSource)) payload.applicationSource = 'Other';
  if (payload.status && !STATUS_OPTIONS.includes(payload.status)) payload.status = 'Wishlist';
  const item = await Application.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, payload, { new: true });
  if (!item) return res.status(404).json({ message: 'Application not found' });
  await refreshGoalAndStreak(req.user);
  res.json(item);
});

export const duplicateApplication = asyncHandler(async (req, res) => {
  const existing = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!existing) return res.status(404).json({ message: 'Application not found' });
  const copy = await Application.create({
    user: req.user._id,
    companyName: existing.companyName,
    jobTitle: existing.jobTitle,
    location: existing.location,
    applicationSource: existing.applicationSource,
    status: existing.status,
    appliedDate: new Date(),
    jobUrl: existing.jobUrl,
    notes: existing.notes,
    archived: false,
    favorite: existing.favorite
  });
  await refreshGoalAndStreak(req.user);
  res.status(201).json(copy);
});

export const archiveApplication = asyncHandler(async (req, res) => {
  const item = await Application.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { archived: true }, { new: true });
  if (!item) return res.status(404).json({ message: 'Application not found' });
  await refreshGoalAndStreak(req.user);
  res.json(item);
});

export const deleteApplication = asyncHandler(async (req, res) => {
  const result = await Application.deleteOne({ _id: req.params.id, user: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Application not found' });
  await refreshGoalAndStreak(req.user);
  res.json({ message: 'Deleted' });
});

export const analytics = asyncHandler(async (req, res) => {
  res.json(await buildAnalytics(req.user._id));
});

export const updateGoal = asyncHandler(async (req, res) => {
  const dailyGoal = Number(req.body.dailyGoal);
  if (!Number.isInteger(dailyGoal) || dailyGoal < 1) {
    return res.status(400).json({ message: 'Daily goal must be a positive integer' });
  }
  const user = await User.findById(req.user._id);
  user.dailyGoal = dailyGoal;
  await user.save();
  const { todayCount, goalCompletedToday } = await refreshGoalAndStreak(user);
  res.json({ dailyGoal: user.dailyGoal, streak: user.streak, goalCompleted: goalCompletedToday, todayCount });
});

export const getSourceAnalytics = asyncHandler(async (req, res) => {
  res.json({ sourceAnalytics: await getApplicationsBySource(req.user._id) });
});

export const getAchievements = asyncHandler(async (req, res) => {
  const totalApplications = await Application.countDocuments({ user: req.user._id, archived: { $ne: true } });
  const user = await User.findById(req.user._id);
  res.json({ achievements: computeAchievementIds({ totalApplications, streak: user.streak }) });
});

export const getStats = asyncHandler(async (req, res) => {
  res.json(await buildAnalytics(req.user._id));
});
