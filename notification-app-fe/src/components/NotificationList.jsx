/**
 * NotificationList.jsx
 *
 * Renders a paginated list of NotificationCards with loading/error/empty states.
 */

import React from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Typography,
} from '@mui/material';
import NotificationCard from './NotificationCard';
import { useViewed } from '../context/ViewedContext';

export default function NotificationList({
  notifications,
  total,
  page,
  totalPages,
  loading,
  error,
  onPageChange,
  showScore = false,
}) {
  const { isViewed, markViewed } = useViewed();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="body1" color="text.secondary">
          No notifications found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Showing {notifications.length} of {total} notifications
      </Typography>

      {notifications.map((n, idx) => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isViewed={isViewed(n.ID)}
          showScore={showScore}
          rank={showScore ? idx + 1 : null}
          onView={markViewed}
        />
      ))}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
