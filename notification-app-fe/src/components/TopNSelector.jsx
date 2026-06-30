/**
 * TopNSelector.jsx
 *
 * Lets the user pick how many priority notifications to show (10, 15, 20).
 */

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const OPTIONS = [5, 10, 15, 20];

export default function TopNSelector({ value, onChange }) {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <EmojiEventsIcon color="warning" />
      <Typography variant="body2" color="text.secondary">
        Show top:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 80 }}>
        <InputLabel id="topn-label">N</InputLabel>
        <Select
          labelId="topn-label"
          value={value}
          label="N"
          onChange={e => onChange(Number(e.target.value))}
        >
          {OPTIONS.map(n => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary">
        priority notifications
      </Typography>
    </Box>
  );
}
