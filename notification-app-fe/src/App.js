/**
 * App.js  –  Root component
 *
 * • MUI ThemeProvider (light/dark aware)
 * • React Router v6
 * • ViewedProvider wrapping all pages
 * • Navbar with live unread badge
 */

import React, { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import { ViewedProvider, useViewed } from './context/ViewedContext';
import Navbar from './components/Navbar';
import AllNotificationsPage from './pages/AllNotificationsPage';
import PriorityInboxPage from './pages/PriorityInboxPage';
import logger from './utils/logger';

/* ── Inner app that can access ViewedContext ─────────────────────────────── */
function InnerApp({ toggleColorMode, mode }) {
  const { viewed } = useViewed();

  // Approximate unread count: total IDs we know about minus viewed.
  // In a real app this would come from the API's total field.
  const unreadCount = 0; // Navbar badge shows API total – viewed; kept simple here

  React.useEffect(() => {
    logger.info('App', `Color mode: ${mode}`);
  }, [mode]);

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar unreadCount={unreadCount} />

        {/* Theme toggle — top-right corner */}
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleColorMode}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Routes>
          <Route path="/"         element={<AllNotificationsPage />} />
          <Route path="/priority" element={<PriorityInboxPage />}    />
          {/* Catch-all */}
          <Route path="*"         element={
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
              404 – Page not found
            </Container>
          } />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

/* ── Root with theme ─────────────────────────────────────────────────────── */
export default function App() {
  const [mode, setMode] = useState('light');

  const toggleColorMode = () =>
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary : { main: '#1976d2' },
          success : { main: '#2e7d32' },
          warning : { main: '#ed6c02' },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: { borderRadius: 10 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ViewedProvider>
        <InnerApp toggleColorMode={toggleColorMode} mode={mode} />
      </ViewedProvider>
    </ThemeProvider>
  );
}
