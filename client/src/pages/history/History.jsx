import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function History() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data } = useQuery({
    queryKey: ['daily-history', from, to],
    queryFn: async () => (await api.get('/daily-trackers/history', { params: { from, to } })).data
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Daily History</h1>
        <p className="text-sm text-white/60">Review your daily platform counts and apply trends.</p>
      </div>
      <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 md:grid-cols-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" />
        <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/70">{data?.items?.length || 0} days found</div>
      </div>
      <div className="space-y-4">
        {(data?.items || []).map((day) => (
          <div key={day._id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xl font-semibold">{day.date}</div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-sm">{day.totalApplications} Total</div>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(day.platforms || {}).map(([platform, count]) => (
                <div key={platform} className="rounded-2xl bg-white/5 px-4 py-3 text-sm">{platform} <span className="font-semibold">{count}</span></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
