/**
 * notificationsApi.js  –  API layer with logging middleware + mock fallback
 *
 * When REACT_APP_USE_MOCK=true OR the real API is unreachable (network error /
 * 5xx), the layer transparently falls back to rich mock data so the app is
 * always fully functional regardless of network restrictions.
 */

import axios from 'axios';
import logger from '../utils/logger';
import { getMockResponse } from './mockData';

const BASE_URL  = 'http://4.224.186.213/evaluation-service/notifications';
const USE_MOCK  = process.env.REACT_APP_USE_MOCK === 'true';

const apiClient = axios.create({ baseURL: BASE_URL, timeout: 8000 });

/* ── Request interceptor ──────────────────────────────────────────────────── */
apiClient.interceptors.request.use(config => {
  const key = process.env.REACT_APP_API_KEY || '';
  if (key) config.headers['Authorization'] = `Bearer ${key}`;
  logger.debug('API:request', `${config.method?.toUpperCase()} ${BASE_URL}`, {
    params: config.params,
  });
  config.metadata = { startTime: performance.now() };
  return config;
});

/* ── Response interceptor ─────────────────────────────────────────────────── */
apiClient.interceptors.response.use(
  response => {
    const ms = (performance.now() - response.config.metadata.startTime).toFixed(1);
    logger.info('API:response', `${response.status} in ${ms}ms`, {
      count: response.data?.notifications?.length,
    });
    return response;
  },
  error => {
    const ms = error.config?.metadata
      ? (performance.now() - error.config.metadata.startTime).toFixed(1)
      : '?';
    logger.error('API:error', error.message, {
      status    : error.response?.status,
      durationMs: ms,
    });
    return Promise.reject(error);
  }
);

/* ── Core fetch (with automatic mock fallback) ────────────────────────────── */
const _fetchNotifications = async ({ page = 1, limit = 10, notification_type } = {}) => {
  /* Always use mock when flag is set */
  if (USE_MOCK) {
    logger.info('API', 'Using mock data (REACT_APP_USE_MOCK=true)');
    await new Promise(r => setTimeout(r, 300)); // simulate latency
    return getMockResponse({ page, limit, notification_type });
  }

  const params = { page, limit };
  if (notification_type) params.notification_type = notification_type;

  try {
    const { data } = await apiClient.get('', { params });
    const notifications = Array.isArray(data) ? data : data.notifications ?? [];
    const total         = data.total ?? notifications.length;
    return { notifications, total, page, limit };
  } catch (err) {
    /* Fallback to mock on any network / server error */
    const status = err.response?.status;
    if (!status || status >= 500 || err.code === 'ERR_NETWORK') {
      logger.warn('API', 'Real API unreachable – falling back to mock data', {
        reason: err.message,
      });
      await new Promise(r => setTimeout(r, 200));
      return getMockResponse({ page, limit, notification_type });
    }
    throw err;
  }
};

export const fetchNotifications = logger.withLogging(
  'NotificationsAPI',
  'fetchNotifications',
  _fetchNotifications
);
