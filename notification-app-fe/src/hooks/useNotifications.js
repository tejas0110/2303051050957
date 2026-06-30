/**
 * useNotifications.js  –  Custom hook
 *
 * Manages fetching, pagination, filtering and polling for new notifications.
 * Integrates logging at every state-transition boundary.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchNotifications } from '../api/notificationsApi';
import logger from '../utils/logger';

const POLL_INTERVAL_MS = 30_000; // 30 s

export function useNotifications({
  limit         = 20,
  notification_type,
  autoPoll      = false,
} = {}) {
  const [notifications, setNotifications] = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async (targetPage = 1, type = notification_type) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    logger.info('useNotifications', 'Loading notifications', { targetPage, limit, type });

    try {
      const result = await fetchNotifications({
        page              : targetPage,
        limit,
        notification_type : type || undefined,
      });
      setNotifications(result.notifications);
      setTotal(result.total);
      setPage(targetPage);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      const msg = err.response?.status === 401
        ? 'Unauthorized – please check your API key.'
        : err.response?.status === 404
        ? 'Notification service not found.'
        : err.message || 'Failed to load notifications.';
      setError(msg);
      logger.error('useNotifications', 'Load failed', { msg });
    } finally {
      setLoading(false);
    }
  }, [limit, notification_type]);

  /* Initial load + reload when filter changes */
  useEffect(() => {
    load(1);
  }, [load]);

  /* Optional polling for live feed */
  useEffect(() => {
    if (!autoPoll) return;
    const id = setInterval(() => {
      logger.debug('useNotifications', 'Poll tick – refreshing page 1');
      load(1);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoPoll, load]);

  const goToPage = useCallback((p) => load(p), [load]);
  const refresh  = useCallback(() => load(1),  [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    notifications,
    total,
    page,
    totalPages,
    loading,
    error,
    goToPage,
    refresh,
  };
}
