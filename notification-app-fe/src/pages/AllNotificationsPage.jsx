/**
 * AllNotificationsPage.jsx
 *
 * Displays all notifications with:
 *  • Type filter chips
 *  • Pagination
 *  • Unread (new) vs viewed distinction
 *  • Auto-polling every 30 s
 */

import React, { useEffect, useState } from 'react';
import { Box, Container, Divider, Typography } from '@mui/material';
import NotificationList from '../components/NotificationList';
import FilterBar from '../components/FilterBar';
import { useNotifications } from '../hooks/useNotifications';
import { useViewed } from '../context/ViewedContext';
import logger from '../utils/logger';

const PAGE_SIZE = 10;

export default function AllNotificationsPage() {
  const [filter, setFilter] = useState('');

  const { notifications, total, page, totalPages, loading, error, goToPage, refresh } =
    useNotifications({ limit: PAGE_SIZE, notification_type: filter, autoPoll: true });

  const { unviewedCount } = useViewed();
  const newCount = unviewedCount(notifications.map(n => n.ID));

  useEffect(() => {
    logger.info('AllNotificationsPage', 'Page mounted');
    return () => logger.debug('AllNotificationsPage', 'Page unmounted');
  }, []);

  const handleFilterChange = (value) => {
    logger.info('AllNotificationsPage', `Filter changed to: "${value || 'all'}"`);
    setFilter(value);
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          All Notifications
        </Typography>
        {newCount > 0 && (
          <Typography variant="body2" color="primary.main" fontWeight={500}>
            {newCount} new unread notification{newCount !== 1 ? 's' : ''}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Auto-refreshes every 30 seconds. Click a notification to mark it as read.
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Filter */}
      <FilterBar
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        onRefresh={refresh}
        loading={loading}
      />

      {/* List */}
      <NotificationList
        notifications={notifications}
        total={total}
        page={page}
        totalPages={totalPages}
        loading={loading}
        error={error}
        onPageChange={goToPage}
        showScore={false}
      />
    </Container>
  );
}
