import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Square } from 'lucide-react';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateLabel = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

const toKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthGrid = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current;
  });
};

const intensityClasses = (count) => {
  if (!count) return 'bg-slate-700/70 hover:bg-slate-600/80';
  if (count <= 3) return 'bg-sky-400/35 hover:bg-sky-400/45';
  if (count <= 7) return 'bg-sky-500/55 hover:bg-sky-500/65';
  return 'bg-blue-500/80 hover:bg-blue-400';
};

export default function ApplicationActivityCalendar({ historyItems = [], showTitle = true, showMonthBadge = true }) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);

  const activityMap = useMemo(() => {
    const map = new Map();
    historyItems.forEach((item) => {
      map.set(item.date, { totalApplications: item.totalApplications || 0, platforms: item.platforms || {} });
    });
    return map;
  }, [historyItems]);

  const grid = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visibleMonth),
    [visibleMonth]
  );
  const currentMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(today);
  const selectedInfo = selectedDate ? activityMap.get(toKey(selectedDate)) : null;
  const visibleMonthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`;
  const todayMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentVisibleItems = useMemo(
    () => historyItems.filter((item) => item.date.startsWith(visibleMonthKey)),
    [historyItems, visibleMonthKey]
  );
  const currentMonthItems = useMemo(
    () => historyItems.filter((item) => item.date.startsWith(todayMonthKey)),
    [historyItems, todayMonthKey]
  );
  const visibleMonthTotals = useMemo(() => {
    const totalApplications = currentVisibleItems.reduce((sum, item) => sum + (item.totalApplications || 0), 0);
    const activeDays = currentVisibleItems.filter((item) => (item.totalApplications || 0) > 0).length;
    const bestDay = currentVisibleItems.reduce(
      (best, item) => ((item.totalApplications || 0) > (best?.totalApplications || 0) ? item : best),
      null
    );
    const portalTotals = currentVisibleItems.reduce((acc, item) => {
      Object.entries(item.platforms || {}).forEach(([platform, count]) => {
        acc[platform] = (acc[platform] || 0) + Number(count || 0);
      });
      return acc;
    }, {});
    const mostUsedJobPortal = Object.entries(portalTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalApplications,
      activeDays,
      bestDay,
      mostUsedJobPortal,
      mostActiveDate: bestDay?.date || 'N/A'
    };
  }, [currentVisibleItems]);
  const currentMonthApplications = useMemo(
    () => currentMonthItems.reduce((sum, item) => sum + (item.totalApplications || 0), 0),
    [currentMonthItems]
  );
  const averageApplicationsPerActiveDay = visibleMonthTotals.activeDays
    ? (visibleMonthTotals.totalApplications / visibleMonthTotals.activeDays).toFixed(1)
    : '0.0';

  const hasAnyHistory = historyItems.length > 0;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
      {(showTitle || showMonthBadge) ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {showTitle ? (
              <>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <CalendarDays className="h-5 w-5 text-blue-200" />
                  <span>Application Activity</span>
                </div>
                <div className="text-sm text-white/60">GitHub-style consistency tracker powered by your daily application history.</div>
              </>
            ) : null}
          </div>
          {showMonthBadge ? (
            <div className={`rounded-full px-3 py-1 text-xs font-medium ${monthLabel === currentMonthLabel ? 'bg-blue-500/20 text-blue-100' : 'bg-white/5 text-white/60'}`}>
              {monthLabel === currentMonthLabel ? 'Current Month' : monthLabel}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <div className="text-base font-semibold text-white">{monthLabel}</div>
        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-sm text-white/60">Total Applications</div>
          <div className="mt-2 text-2xl font-semibold text-white">{visibleMonthTotals.totalApplications}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-sm text-white/60">Active Days</div>
          <div className="mt-2 text-2xl font-semibold text-white">{visibleMonthTotals.activeDays}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-sm text-white/60">Best Day</div>
          <div className="mt-2 text-2xl font-semibold text-white">{visibleMonthTotals.bestDay?.totalApplications || 0}</div>
          <div className="text-xs text-white/45">{visibleMonthTotals.mostActiveDate}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-sm text-white/60">Current Month Applications</div>
          <div className="mt-2 text-2xl font-semibold text-white">{currentMonthApplications}</div>
        </div>
      </div>

      {!hasAnyHistory ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-10 text-center text-white/60">
          Start applying to build your activity calendar.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.18em] text-white/45">
            {dayLabels.map((day) => <div key={day}>{day}</div>)}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {grid.map((date) => {
              const key = toKey(date);
              const info = activityMap.get(key);
              const count = info?.totalApplications || 0;
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isToday = key === toKey(today);
              const isSelected = selectedDate && key === toKey(selectedDate);

              const countBadgeClass = count === 0
                ? 'bg-white/10 text-white/70'
                : count <= 3
                  ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30'
                  : count <= 7
                    ? 'bg-orange-500/20 text-orange-100 ring-1 ring-orange-400/30'
                    : 'bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/30';

              return (
                <button
                  key={key}
                  type="button"
                  title={`${formatDateLabel(date)}\n${count} Applications`}
                  onClick={() => setSelectedDate(date)}
                  className={[
                    'group relative flex min-h-20 flex-col justify-between rounded-2xl border p-3 text-left transition duration-200 ease-out hover:scale-[1.03] hover:shadow-lg',
                    isCurrentMonth ? 'border-white/10 text-white' : 'border-white/5 text-white/30',
                    intensityClasses(count),
                    isToday ? 'ring-2 ring-cyan-300/80 ring-offset-2 ring-offset-slate-950' : '',
                    isSelected ? 'outline outline-2 outline-blue-300/70' : ''
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold text-white">{date.getDate()}</span>
                  <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${countBadgeClass}`}>
                    {count || ' '}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-white/60">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-700/70 px-3 py-1"><Square className="h-3 w-3" /> No Activity</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-400/35 px-3 py-1"><Square className="h-3 w-3" /> 1-3</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/55 px-3 py-1"><Square className="h-3 w-3" /> 4-7</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/80 px-3 py-1 text-white"><Square className="h-3 w-3" /> 8+</span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="mb-3 text-lg font-semibold text-white">Monthly Summary</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="text-sm text-white/60">Total Applications</div>
              <div className="mt-1 text-xl font-semibold text-white">{visibleMonthTotals.totalApplications}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="text-sm text-white/60">Average Applications per Active Day</div>
              <div className="mt-1 text-xl font-semibold text-white">{averageApplicationsPerActiveDay}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="text-sm text-white/60">Most Used Job Portal</div>
              <div className="mt-1 text-xl font-semibold text-white">{visibleMonthTotals.mostUsedJobPortal}</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="text-sm text-white/60">Most Active Date</div>
              <div className="mt-1 text-xl font-semibold text-white">{visibleMonthTotals.mostActiveDate}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
          <div className="mb-3 text-sm uppercase tracking-[0.18em] text-white/45">Selected Date</div>
          {selectedDate ? (
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="text-2xl font-semibold text-white">{formatDateLabel(selectedDate)}</div>
              <div className="mt-4 text-sm text-white/60">Total Applications</div>
              <div className="mt-1 text-3xl font-semibold text-white">{selectedInfo?.totalApplications ?? 0}</div>
              {!selectedInfo ? <div className="mt-3 text-sm text-white/60">No applications recorded for this date.</div> : null}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/60">Click any date to view application details.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedDate ? (
          <motion.div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDate(null)}>
            <motion.div
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/50"
              initial={{ y: 24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 text-sm uppercase tracking-[0.18em] text-white/45">Application Activity</div>
              <div className="text-2xl font-semibold text-white">{formatDateLabel(selectedDate)}</div>
              <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                {selectedInfo ? (
                  <>
                    <div className="text-white/60">Total Applications</div>
                    <div className="mt-1 text-3xl font-semibold text-white">{selectedInfo.totalApplications}</div>
                  </>
                ) : (
                  <div>No applications recorded for this date.</div>
                )}
              </div>
              <div className="mt-5 flex justify-end">
                <button type="button" onClick={() => setSelectedDate(null)} className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
