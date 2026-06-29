import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { SOURCE_OPTIONS } from '../../constants/sources';

const statusOptions = ['Wishlist', 'Applied', 'OA', 'Interview', 'Technical Round', 'Manager Round', 'HR Round', 'Offer', 'Rejected'];
const sourceOptions = SOURCE_OPTIONS;

const sourceColor = {
  LinkedIn: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
  Indeed: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  Naukri: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
  Foundit: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  Wellfound: 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30',
  'HR Email': 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  'Company Career Page': 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  Referral: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
  Internshala: 'bg-teal-500/20 text-teal-200 border-teal-500/30',
  Glassdoor: 'bg-lime-500/20 text-lime-200 border-lime-500/30',
  Other: 'bg-white/10 text-white/70 border-white/20'
};

function Badge({ children, className = '' }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function ApplicationModal({ open, onClose, onSaved, editing }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: editing || {
      status: 'Wishlist',
      applicationSource: 'Other',
      appliedDate: new Date().toISOString().slice(0, 10)
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) return (await api.put(`/api/applications/${editing._id}`, payload)).data;
      return (await api.post('/api/applications', payload)).data;
    },
    onSuccess: () => {
      toast.success(editing?._id ? 'Application updated' : 'Application added');
      onSaved();
      onClose();
      reset();
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Save failed')
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{editing?._id ? 'Edit Response' : 'Add Response'}</h2>
                <p className="text-sm text-white/60">Track only companies that responded after applying.</p>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0" placeholder="Company Name" {...register('companyName', { required: true })} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0" placeholder="Job Title" {...register('jobTitle', { required: true })} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0" placeholder="Location" {...register('location')} />
              <select
                className="appearance-none rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0 [color-scheme:dark]"
                {...register('applicationSource')}
              >
                {sourceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select
                className="appearance-none rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0 [color-scheme:dark]"
                {...register('status')}
              >
                {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0" {...register('appliedDate')} />
              <input type="date" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0" {...register('interviewDate')} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0 md:col-span-2" placeholder="Job URL" {...register('jobUrl')} />
              <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0 md:col-span-2" placeholder="Links" {...register('links')} />
              <textarea className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0 md:col-span-2" placeholder="Notes" {...register('notes')} />
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-3 text-white/70">
                  Cancel
                </button>
                <button disabled={mutation.isPending} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-60">
                  {mutation.isPending ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Applications() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', source: '', company: '', role: '', location: '', from: '', to: '' });
  const [showArchived, setShowArchived] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applications', filters],
    queryFn: async () => (await api.get('/api/applications', { params: { ...filters, limit: 200, includeArchived: 'true' } })).data
  });

  const items = data?.items || [];
  const activeItems = items.filter((item) => !item.archived);
  const archivedItems = items.filter((item) => item.archived);

  const onSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['kanban'] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/api/applications/${id}`)).data,
    onSuccess: () => {
      toast.success('Application deleted');
      onSaved();
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id) => (await api.post(`/api/applications/${id}/duplicate`)).data,
    onSuccess: () => {
      toast.success('Application duplicated');
      onSaved();
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id) => (await api.patch(`/api/applications/${id}/archive`)).data,
    onSuccess: () => {
      toast.success('Application archived');
      onSaved();
    }
  });

  const filteredCount = useMemo(() => activeItems.length, [activeItems.length]);

  return (
    <div className="relative space-y-5 pb-28">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Applications</h1>
          <p className="text-sm text-white/60">Track jobs, sources, and next steps in one clean workspace.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20">
          + Add Application
        </button>
      </div>

      <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur md:grid-cols-3 xl:grid-cols-4">
        <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" placeholder="Search company, role, or location" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
        <select className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" value={filters.source} onChange={(e) => setFilters((p) => ({ ...p, source: e.target.value }))}>
          <option value="">All Sources</option>
          {sourceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" placeholder="Company" value={filters.company} onChange={(e) => setFilters((p) => ({ ...p, company: e.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" placeholder="Role" value={filters.role} onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" placeholder="Location" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} />
        <input type="date" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
        <input type="date" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
      </div>

      <div className="flex items-center justify-between text-sm text-white/60">
        <span>{filteredCount} applications found</span>
        <button
          onClick={() => setFilters({ search: '', status: '', source: '', company: '', role: '', location: '', from: '', to: '' })}
          className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:bg-white/5"
        >
          Clear filters
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading && <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/60">Loading applications...</div>}
        {!isLoading && activeItems.map((item) => (
          <motion.article
            key={item._id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">{item.companyName}</h3>
                  <Badge className={sourceColor[item.applicationSource] || sourceColor.Other}>{item.applicationSource}</Badge>
                  <Badge className="border-white/20 bg-white/5 text-white/75">{item.status}</Badge>
                </div>
                <div className="text-sm text-white/65">
                  <span className="font-medium text-white/85">{item.jobTitle}</span>
                  {item.location ? <span className="mx-2">•</span> : null}
                  {item.location ? <span>{item.location}</span> : null}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-white/65">
                  <span className="rounded-full bg-white/5 px-3 py-1">Applied {item.appliedDate ? new Date(item.appliedDate).toLocaleDateString() : 'N/A'}</span>
                  {item.jobUrl ? <a href={item.jobUrl} target="_blank" rel="noreferrer" className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-200">Open Job URL</a> : null}
                </div>
                {item.notes ? <p className="max-w-4xl text-sm leading-6 text-white/70">{item.notes}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button className="rounded-xl bg-white/5 px-3 py-2 text-sm" onClick={() => { setEditing(item); setOpen(true); }}>Edit</button>
                <button className="rounded-xl bg-white/5 px-3 py-2 text-sm" onClick={() => duplicateMutation.mutate(item._id)}>Duplicate</button>
                <button className="rounded-xl bg-white/5 px-3 py-2 text-sm" onClick={() => archiveMutation.mutate(item._id)}>Archive</button>
                <button className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200" onClick={() => deleteMutation.mutate(item._id)}>Delete</button>
              </div>
            </div>
          </motion.article>
        ))}
        {!isLoading && !activeItems.length && <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/60">No applications yet.</div>}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur">
        <button
          type="button"
          onClick={() => setShowArchived((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold" aria-hidden="true">{showArchived ? '▼' : '▶'}</span>
            <span className="text-lg font-semibold">Archived Applications</span>
            <Badge className="border-white/20 bg-white/5 text-white/75">{archivedItems.length}</Badge>
          </div>
          <span className="text-sm text-white/50">{showArchived ? 'Collapse archived items' : 'Expand archived items'}</span>
        </button>

        <AnimatePresence initial={false}>
          {showArchived ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 px-4 pb-4">
                {archivedItems.length ? archivedItems.map((item) => (
                  <motion.article
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur opacity-80"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold line-through decoration-white/40 decoration-1">{item.companyName}</h3>
                          <Badge className={sourceColor[item.applicationSource] || sourceColor.Other}>{item.applicationSource}</Badge>
                          <Badge className="border-white/20 bg-white/5 text-white/75">{item.status}</Badge>
                          <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-200">Archived</Badge>
                        </div>
                        <div className="text-sm text-white/65">
                          <span className="font-medium text-white/85">{item.jobTitle}</span>
                          {item.location ? <span className="mx-2">•</span> : null}
                          {item.location ? <span>{item.location}</span> : null}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-white/65">
                          <span className="rounded-full bg-white/5 px-3 py-1">Applied {item.appliedDate ? new Date(item.appliedDate).toLocaleDateString() : 'N/A'}</span>
                          {item.jobUrl ? <a href={item.jobUrl} target="_blank" rel="noreferrer" className="rounded-full bg-blue-500/15 px-3 py-1 text-blue-200">Open Job URL</a> : null}
                        </div>
                        {item.notes ? <p className="max-w-4xl text-sm leading-6 text-white/70">{item.notes}</p> : null}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button className="rounded-xl bg-white/5 px-3 py-2 text-sm" onClick={() => { setEditing(item); setOpen(true); }}>Edit</button>
                        <button className="rounded-xl bg-white/5 px-3 py-2 text-sm" onClick={() => duplicateMutation.mutate(item._id)}>Duplicate</button>
                        <button className="rounded-xl bg-white/5 px-3 py-2 text-sm" onClick={() => archiveMutation.mutate(item._id)}>Archive</button>
                        <button className="rounded-xl bg-rose-500/15 px-3 py-2 text-sm text-rose-200" onClick={() => deleteMutation.mutate(item._id)}>Delete</button>
                      </div>
                    </div>
                  </motion.article>
                )) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/60">
                    No archived applications.
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <ApplicationModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={onSaved}
        editing={editing}
      />
    </div>
  );
}

