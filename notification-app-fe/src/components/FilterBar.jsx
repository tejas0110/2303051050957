/**
 * FilterBar.jsx
 *
 * Provides notification_type filter chips and a refresh button.
 */

import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import AllInboxIcon from '@mui/icons-material/AllInbox';

const FILTERS = [
  { value: '',          label: 'All',       Icon: AllInboxIcon, color: 'default'  },
  { value: 'Placement', label: 'Placement', Icon: WorkIcon,     color: 'success'  },
  { value: 'Result',    label: 'Result',    Icon: SchoolIcon,   color: 'primary'  },
  { value: 'Event',     label: 'Event',     Icon: EventIcon,    color: 'warning'  },
];

export default function FilterBar({ activeFilter, onFilterChange, onRefresh, loading }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      flexWrap="wrap"
      mb={2}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
        Filter:
      </Typography>

      {FILTERS.map(({ value, label, Icon, color }) => (
        <Chip
          key={value || 'all'}
          icon={<Icon sx={{ fontSize: 14 }} />}
          label={label}
          color={activeFilter === value ? color : 'default'}
          variant={activeFilter === value ? 'filled' : 'outlined'}
          size="small"
          onClick={() => onFilterChange(value)}
          clickable
        />
      ))}

      <Tooltip title="Refresh">
        <span>
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={loading}
            sx={{ ml: 'auto' }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
