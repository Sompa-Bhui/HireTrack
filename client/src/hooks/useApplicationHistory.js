import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const applicationHistoryQueryKey = ['daily-history-calendar'];

export function useApplicationHistory() {
  return useQuery({
    queryKey: applicationHistoryQueryKey,
    queryFn: async () => (await api.get('/api/daily-trackers/history')).data
  });
}
