/**
 * PriorityInboxPage.jsx
 *
 * Displays the top-N most important notifications using the min-heap
 * PriorityInbox algorithm from Stage 1.
 *
 * Features:
 *  • Configurable N (5 / 10 / 15 / 20)
 *  • Type filter
 *  • Priority score displayed on each card
 *  • Rank badges (#1, #2 …)
 *  • Auto-refresh incorporates new notifications into the heap
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationCard from '../components/NotificationCard';
import FilterBar from '../components/FilterBar';
import TopNSelector from '../components/TopNSelector';
import { useViewed } from '../context/ViewedContext';
import { fetchNotifications } from '../api/notificationsApi';
import { PriorityInbox } from '../utils/priorityInbox';
import logger from '../utils/logger';

const POLL_INTERVAL_MS = 30_000;

export default function PriorityInboxPage() {
  const [topN,    setTopN]    = useState(10);
  const [filter,  setFilter]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [top,     setTop]     = useState([]);

  const inboxRef = useRef(new PriorityInbox(topN));

  const { isViewed, markViewed } = useViewed();

  /* Rebuild inbox when N changes */
  useEffect(() => {
    inboxRef.current = new PriorityInbox(topN);
    // Re-add existing top entries into new heap
    top.forEach(n => inboxRef.current.add(n));
    setTop(inboxRef.current.top());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topN]);

  /* Fetch all pages and feed into heap */
  const loadAll = async (type) => {
    setLoading(true);
    setError(null);
    logger.info('PriorityInboxPage', `Loading all notifications for heap (filter="${type || 'all'}")`);

    try {
      let pageNum   = 1;
      const perPage = 50;
      let fetched   = 0;
      let totalRows = Infinity;

      while (fetched < totalRows) {
        const { notifications, total } = await fetchNotifications({
          page              : pageNum,
          limit             : perPage,
          notification_type : type || undefined,
        });

        totalRows = total ?? notifications.length;
        notifications.forEach(n => inboxRef.current.add(n));
        fetched += notifications.length;

        if (notifications.length < perPage) break;
        pageNum++;
      }

      setTop(inboxRef.current.top());
      logger.info('PriorityInboxPage', `Heap updated – top ${inboxRef.current.n} computed from ${fetched} notifications`);
    } catch (err) {
      const msg = err.response?.status === 401
        ? 'Unauthorized – please check your API key.'
        : err.message || 'Failed to load notifications.';
      setError(msg);
      logger.error('PriorityInboxPage', 'Load failed', { msg });
    } finally {
      setLoading(false);
    }
  };

  /* Initial load */
  useEffect(() => {
    inboxRef.current = new PriorityInbox(topN);
    loadAll(filter);
    logger.info('PriorityInboxPage', 'Page mounted');
    return () => logger.debug('PriorityInboxPage', 'Page unmounted');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  /* Polling – only fetches newest page and merges into heap */
  useEffect(() => {
    const id = setInterval(async () => {
      logger.debug('PriorityInboxPage', 'Poll tick');
      try {
        const { notifications } = await fetchNotifications({
          page: 1, limit: 20, notification_type: filter || undefined,
        });
        notifications.forEach(n => inboxRef.current.add(n));
        setTop(inboxRef.current.top());
      } catch (e) {
        logger.warn('PriorityInboxPage', 'Poll failed silently', { error: e.message });
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [filter]);

  const handleFilterChange = (value) => {
    logger.info('PriorityInboxPage', `Filter changed to "${value || 'all'}"`);
    inboxRef.current = new PriorityInbox(topN);
    setFilter(value);
  };

  const handleRefresh = () => {
    inboxRef.current = new PriorityInbox(topN);
    loadAll(filter);
  };

  const newCount = useMemo(() => top.filter(n => !isViewed(n.ID)).length, [top, isViewed]);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <EmojiEventsIcon color="warning" fontSize="large" />
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
        <Tooltip title="Notifications are ranked by type (Placement > Result > Event) then recency. Uses a min-heap for O(log N) updates.">
          <InfoOutlinedIcon fontSize="small" color="action" sx={{ cursor: 'help' }} />
        </Tooltip>
      </Box>

      {newCount > 0 && (
        <Typography variant="body2" color="primary.main" fontWeight={500} mb={1}>
          {newCount} new unread notification{newCount !== 1 ? 's' : ''} in top {topN}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" mb={2}>
        Click a notification to mark it as read. Auto-refreshes every 30 s.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Controls */}
      <TopNSelector value={topN} onChange={setTopN} />

      <FilterBar
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : top.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="body1" color="text.secondary">
            No notifications found.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Showing top {top.length} of all fetched notifications
          </Typography>
          {top.map((n, idx) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isViewed={isViewed(n.ID)}
              showScore
              rank={idx + 1}
              onView={markViewed}
            />
          ))}
        </>
      )}
    </Container>
  );
}
