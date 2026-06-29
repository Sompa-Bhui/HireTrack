const dayMs = 24 * 60 * 60 * 1000;

export const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const getWeekBounds = (date = new Date()) => {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
};

export const getMonthBounds = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

export const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

export const formatGoalMessage = (streak) => {
  if (streak >= 30) return 'Job Hunter Mode Activated!';
  if (streak >= 7) return 'You are on fire!';
  if (streak >= 1) return 'Keep Going!';
  return 'Start your momentum today!';
};

export const computeAchievementIds = (stats) => {
  const achievements = [];
  if (stats.totalApplications >= 1) achievements.push('First Application');
  if (stats.totalApplications >= 50) achievements.push('50 Applications');
  if (stats.totalApplications >= 100) achievements.push('100 Applications');
  if (stats.totalApplications >= 500) achievements.push('500 Applications');
  if (stats.streak >= 7) achievements.push('7 Day Streak');
  if (stats.streak >= 30) achievements.push('30 Day Streak');
  if (stats.totalApplications >= 100 || stats.streak >= 30) achievements.push('Job Hunter');
  return achievements;
};

export const getProgressPercentage = (value, goal) => {
  if (!goal) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
};

export const isSameDateKey = (left, right) => left && right && left === right;

export const subtractDays = (date, days) => new Date(date.getTime() - days * dayMs);
