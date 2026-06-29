import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

export default function History() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['daily-history', from, to],
    queryFn: async () => (await api.get('/api/daily-trackers/history', { params: { from, to } })).data
  });

  const deleteMutation = useMutation({
    mutationFn: async (date) => (await api.delete(`/api/daily-trackers/history/${date}`)).data,
    onSuccess: () => {
      toast.success('History day deleted');
      queryClient.invalidateQueries({ queryKey: ['daily-history', from, to] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Delete failed')
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
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="text-xl font-semibold">{day.date}</div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/10 px-3 py-1 text-sm">{day.totalApplications} Total</div>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    const confirmed = window.confirm("Are you sure you want to permanently delete this day's history?");
                    if (!confirmed) return;
                    deleteMutation.mutate(day.date);
                  }}
                  className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-200 hover:bg-rose-500/25 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
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
