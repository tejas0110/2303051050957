/**
 * ViewedContext.js
 *
 * Tracks which notification IDs the user has already viewed.
 * Persisted to localStorage so the read/unread state survives page refresh.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import logger from '../utils/logger';

const ViewedContext = createContext(null);

const STORAGE_KEY = 'campus_viewed_notifications';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveToStorage(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    logger.warn('ViewedContext', 'Failed to persist viewed set to localStorage');
  }
}

export function ViewedProvider({ children }) {
  const [viewed, setViewed] = useState(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(viewed);
  }, [viewed]);

  const markViewed = useCallback((id) => {
    setViewed(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      logger.debug('ViewedContext', `Marked as viewed: ${id}`);
      return next;
    });
  }, []);

  const markAllViewed = useCallback((ids) => {
    setViewed(prev => {
      const next = new Set(prev);
      let changed = false;
      ids.forEach(id => { if (!next.has(id)) { next.add(id); changed = true; } });
      if (changed) logger.info('ViewedContext', `Bulk-marked ${ids.length} notifications as viewed`);
      return changed ? next : prev;
    });
  }, []);

  const isViewed = useCallback((id) => viewed.has(id), [viewed]);

  const unviewedCount = (ids) => ids.filter(id => !viewed.has(id)).length;

  return (
    <ViewedContext.Provider value={{ viewed, markViewed, markAllViewed, isViewed, unviewedCount }}>
      {children}
    </ViewedContext.Provider>
  );
}

export function useViewed() {
  const ctx = useContext(ViewedContext);
  if (!ctx) throw new Error('useViewed must be used inside <ViewedProvider>');
  return ctx;
}
