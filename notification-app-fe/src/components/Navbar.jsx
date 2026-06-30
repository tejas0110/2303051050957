/**
 * Navbar.jsx  –  App-wide navigation bar
 */

import React from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ unreadCount = 0 }) {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'All Notifications', path: '/',        Icon: NotificationsIcon },
    { label: 'Priority Inbox',    path: '/priority', Icon: EmojiEventsIcon   },
  ];

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          {/* Brand */}
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error" max={99}>
              <NotificationsIcon color="primary" />
            </Badge>
            <Typography variant="h6" fontWeight={700} noWrap>
              Campus Notifications
            </Typography>
          </Box>

          {/* Nav links */}
          {navItems.map(({ label, path, Icon }) => (
            <Tooltip key={path} title={label}>
              <Button
                component={Link}
                to={path}
                startIcon={<Icon fontSize="small" />}
                color={pathname === path ? 'primary' : 'inherit'}
                variant={pathname === path ? 'contained' : 'text'}
                size="small"
                sx={{ textTransform: 'none', display: { xs: 'none', sm: 'flex' } }}
              >
                {label}
              </Button>
            </Tooltip>
          ))}

          {/* Mobile icon-only buttons */}
          {navItems.map(({ label, path, Icon }) => (
            <Tooltip key={`m-${path}`} title={label}>
              <Box
                component={Link}
                to={path}
                sx={{
                  display : { xs: 'flex', sm: 'none' },
                  color   : pathname === path ? 'primary.main' : 'text.secondary',
                }}
              >
                <Icon />
              </Box>
            </Tooltip>
          ))}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
