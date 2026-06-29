import ApplicationActivityCalendar from '../../components/dashboard/ApplicationActivityCalendar';
import { useApplicationHistory } from '../../hooks/useApplicationHistory';

export default function Activity() {
  const { data } = useApplicationHistory();
  const historyItems = data?.items || [];

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="text-3xl font-semibold text-white">Application Activity</div>
        <div className="mt-2 text-sm text-white/60">Visualize your daily application consistency.</div>
      </div>

      <ApplicationActivityCalendar historyItems={historyItems} showTitle={false} showMonthBadge={true} />
    </div>
  );
}
