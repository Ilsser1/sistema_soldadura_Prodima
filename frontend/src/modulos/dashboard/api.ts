import type { DashboardStats } from '../../../../shared/types';
import { fetchJson } from '../../services/http';

export const dashboardApi = {
  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard')
};
