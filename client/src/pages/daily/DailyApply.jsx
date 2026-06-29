import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

const platforms = ['LinkedIn', 'Indeed', 'Naukri', 'Foundit', 'Wellfound', 'HR Email', 'Company Career Page', 'Referral', 'Internshala', 'Glassdoor', 'Other'];

export default function DailyApply() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState(Object.fromEntries(platforms.map((p) => [p, ''])));
  const [dailyGoal, setDailyGoal] = useState(100);

  const { data } = useQuery({
    queryKey: ['daily-tracker', date],
    queryFn: async () => (await api.get('/api/daily-trackers/today', { params: { date } })).data
  });

  useEffect(() => {
    if (!data) return;
    const next = {};
    platforms.forEach((p) => (next[p] = data.platforms?.[p] ?? ''));
    setValues(next);
    setDailyGoal(data.dailyGoal || 100);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/api/daily-trackers/today', payload)).data,
    onSuccess: (res) => {
      toast.success(res.goalCompleted ? 'Mission Completed! Great Job!' : 'Daily tracker saved');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['daily-tracker'] });
    }
  });

  const total = useMemo(() => platforms.reduce((sum, p) => sum + (Number(values[p]) || 0), 0), [values]);
  const progress = dailyGoal ? Math.min(100, Math.round((total / dailyGoal) * 100)) : 0;

  const onSave = () => saveMutation.mutate({ date, dailyGoal, ...Object.fromEntries(platforms.map((p) => [p, Number(values[p]) || 0])) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Daily Apply Tracker</h1>
        <p className="text-sm text-white/60">Quickly log how many jobs you applied from each platform today.</p>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" />
          <input type="number" min="1" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" placeholder="Daily Goal" />
          <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/70">Today's Total Applications: <span className="font-semibold text-white">{total}</span></div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {platforms.map((platform) => (
            <div key={platform} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="mb-2 text-sm text-white/70">{platform}</div>
              <input
                type="number"
                min="0"
                value={values[platform]}
                onChange={(e) => setValues((prev) => ({ ...prev, [platform]: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between text-sm text-white/60">
              <span>{total} / {dailyGoal}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400" animate={{ width: `${progress}%` }} initial={{ width: 0 }} />
            </div>
          </div>
          <button onClick={onSave} disabled={saveMutation.isPending} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
            {saveMutation.isPending ? 'Saving...' : 'Save Today'}
          </button>
        </div>
      </div>
    </div>
  );
}
