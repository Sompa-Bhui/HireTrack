import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, Cell } from 'recharts';
import { api } from '../../services/api';
import { SOURCE_OPTIONS } from '../../constants/sources';
import { useAuth } from '../../context/AuthContext';
import { useApplicationHistory } from '../../hooks/useApplicationHistory';

const statCards = [
  { key: 'todayApplications', label: "Today's Applications" },
  { key: 'weekCount', label: 'Applications This Week' },
  { key: 'monthCount', label: 'Applications This Month' },
  { key: 'currentStreak', label: 'Current Streak' },
  { key: 'bestStreak', label: 'Best Streak' },
  { key: 'totalMissionCompleted', label: 'Mission Completed' },
  { key: 'dailyGoal', label: 'Daily Goal' },
  { key: 'responseRate', label: 'Response Rate' }
];

const colors = ['#60a5fa', '#34d399', '#a78bfa', '#f59e0b', '#f97316', '#ef4444', '#14b8a6', '#22c55e', '#e879f9', '#38bdf8', '#facc15'];

export default function Dashboard() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/api/dashboard')).data
  });
  const { data: historyData } = useApplicationHistory();

  const sourceChart = useMemo(() => {
    const sourceMap = new Map((data?.sourceAnalytics || []).map((item) => [item._id, item.count || 0]));
    return SOURCE_OPTIONS.map((source) => ({ _id: source, count: sourceMap.get(source) || 0 }));
  }, [data?.sourceAnalytics]);
  const dailyTrend = useMemo(() => data?.dailyTrend || [], [data?.dailyTrend]);
  const missionCompleted = !!data?.goalCompleted;
  const progress = data?.goalProgress || 0;
  const userName = user?.name || user?.fullName || 'there';

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTotal = useMemo(
    () => (historyData?.items || [])
      .filter((item) => item.date.startsWith(currentMonthKey))
      .reduce((sum, item) => sum + (item.totalApplications || 0), 0),
    [historyData?.items, currentMonthKey]
  );

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="text-3xl font-semibold">Welcome back, {userName} 👋</div>
        <div className="mt-2 text-sm text-white/60">Track your daily job applications and stay consistent.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <motion.div key={card.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
            <div className="text-sm text-white/60">{card.label}</div>
            <div className="mt-2 text-3xl font-semibold">{data?.[card.key] ?? 0}{card.key === 'dailyGoal' ? '' : card.key.includes('Rate') ? '%' : ''}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Daily Goal Progress</div>
              <div className="text-sm text-white/60">{data?.todayApplications || 0} / {data?.dailyGoal || 100}</div>
            </div>
            <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200">{progress}%</div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
            {missionCompleted ? 'Mission Completed! Great Job! You reached today\'s goal.' : 'Keep going. You are building momentum.'}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="text-lg font-semibold">Streak</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-white/5 p-4 text-2xl font-semibold">{data?.currentStreak || 0} Days</div>
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">Best Streak: <span className="font-semibold text-white">{data?.bestStreak || 0} Days</span></div>
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">Mission Completed: <span className="font-semibold text-white">{data?.totalMissionCompleted || 0}</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.65fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold">Applications by Source</div>
            <div className="text-sm text-white/50">Daily Apply Tracker</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChart} margin={{ top: 10, right: 12, left: 0, bottom: 72 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="_id" stroke="rgba(255,255,255,0.6)" interval={0} angle={-35} textAnchor="end" height={88} tickMargin={14} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.6)" />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {sourceChart.map((entry, index) => <Cell key={entry._id} fill={colors[index % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <Link
            to="/activity"
            className="block rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <div className="text-sm text-white/60">Application Activity</div>
            <div className="mt-2 text-2xl font-semibold text-white">{currentMonthTotal}</div>
            <div className="mt-1 text-sm text-white/70">Current month total</div>
            <div className="mt-4 text-sm font-medium text-blue-200">View Full Activity →</div>
          </Link>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-4 text-lg font-semibold">Daily Application Trend</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.6)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 text-lg font-semibold">Response Tracker Rates</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">Response Rate: <span className="font-semibold">{data?.responseRate || 0}%</span></div>
            <div className="rounded-2xl bg-white/5 p-4">Interview Rate: <span className="font-semibold">{data?.interviewRate || 0}%</span></div>
            <div className="rounded-2xl bg-white/5 p-4">Offer Rate: <span className="font-semibold">{data?.offerRate || 0}%</span></div>
            <div className="rounded-2xl bg-white/5 p-4">Rejected Rate: <span className="font-semibold">{data?.rejectedRate || 0}%</span></div>
            <div className="rounded-2xl bg-white/5 p-4">Wishlist Count: <span className="font-semibold">{data?.wishlistCount || 0}</span></div>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 text-lg font-semibold">Mission State</div>
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/80">
            {missionCompleted ? 'Mission Completed! You hit the goal today.' : `You are ${Math.max((data?.dailyGoal || 100) - (data?.todayApplications || 0), 0)} applications away from today's goal.`}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="mb-4 text-lg font-semibold">Recent Response Tracker Activity</div>
        <div className="space-y-3">
          {(data?.recentResponses || []).map((item) => (
            <div key={item._id} className="rounded-2xl bg-white/5 p-4">
              <div className="font-medium">{item.companyName}</div>
              <div className="text-sm text-white/60">{item.jobTitle} · {item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
