/**
 * NotificationCard.jsx
 *
 * Renders a single notification with:
 *  • Type badge (colour-coded)
 *  • Unread indicator (blue dot)
 *  • Message & timestamp
 *  • Priority score (optional, shown in Priority Inbox)
 *  • Click to mark as viewed
 */

import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import { priorityScore } from '../utils/priorityInbox';

/* ── Type metadata ──────────────────────────────────────────────────────────── */
const TYPE_META = {
  Placement : { color: 'success', Icon: WorkIcon,   label: 'Placement' },
  Result    : { color: 'primary', Icon: SchoolIcon,  label: 'Result'    },
  Event     : { color: 'warning', Icon: EventIcon,   label: 'Event'     },
};

function formatTimestamp(ts) {
  // "2026-04-22 17:51:30" → readable local time
  try {
    const d = new Date(ts.replace(' ', 'T') + 'Z');
    return d.toLocaleString(undefined, {
      month  : 'short',
      day    : 'numeric',
      year   : 'numeric',
      hour   : '2-digit',
      minute : '2-digit',
    });
  } catch {
    return ts;
  }
}

export default function NotificationCard({
  notification,
  isViewed    = false,
  showScore   = false,
  rank        = null,
  onView,
}) {
  const { Type, Message, Timestamp } = notification;
  const meta  = TYPE_META[Type] ?? { color: 'default', Icon: EventIcon, label: Type };
  const score = showScore ? priorityScore(notification) : null;

  const handleClick = () => {
    if (!isViewed && onView) onView(notification.ID);
  };

  return (
    <Card
      elevation={isViewed ? 0 : 2}
      sx={{
        mb            : 1.5,
        border        : '1px solid',
        borderColor   : isViewed ? 'divider' : 'primary.light',
        borderLeft    : isViewed ? '4px solid transparent' : `4px solid`,
        borderLeftColor: isViewed ? 'transparent' : `${meta.color}.main`,
        transition    : 'all 0.2s ease',
        bgcolor       : isViewed ? 'background.paper' : 'action.hover',
        '&:hover'     : { elevation: 4, transform: 'translateY(-1px)' },
      }}
    >
      <CardActionArea onClick={handleClick} disabled={isViewed}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" alignItems="flex-start" gap={1.5}>

            {/* Rank badge (Priority Inbox only) */}
            {rank != null && (
              <Box
                sx={{
                  minWidth : 28,
                  height   : 28,
                  borderRadius: '50%',
                  bgcolor  : 'primary.main',
                  color    : 'primary.contrastText',
                  display  : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize : 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  mt        : 0.25,
                }}
              >
                {rank}
              </Box>
            )}

            {/* Main content */}
            <Box flex={1} minWidth={0}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Chip
                  icon={<meta.Icon sx={{ fontSize: 14 }} />}
                  label={meta.label}
                  color={meta.color}
                  size="small"
                  variant={isViewed ? 'outlined' : 'filled'}
                />
                {!isViewed && (
                  <Tooltip title="Unread">
                    <CircleIcon sx={{ fontSize: 8, color: 'info.main' }} />
                  </Tooltip>
                )}
                {showScore && (
                  <Tooltip title="Priority score">
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      score: {score?.toLocaleString()}
                    </Typography>
                  </Tooltip>
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  mt        : 0.75,
                  fontWeight: isViewed ? 400 : 600,
                  color     : isViewed ? 'text.secondary' : 'text.primary',
                  textTransform: 'capitalize',
                  overflow  : 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {Message}
              </Typography>

              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
                {formatTimestamp(Timestamp)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
