/**
 * logger.js  –  Logging Middleware
 *
 * A lightweight, structured logger that wraps every significant call-stack
 * transition in the app:
 *   • API requests / responses / errors
 *   • Page-level navigation events
 *   • State mutations that cross component boundaries
 *
 * Usage
 *   import logger from '../utils/logger';
 *   logger.info('component', 'something happened', { extra: 'data' });
 *
 * Log levels: DEBUG < INFO < WARN < ERROR
 * In production (NODE_ENV=production) only WARN and ERROR are emitted.
 */

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const IS_PROD = process.env.NODE_ENV === 'production';
const MIN_LEVEL = IS_PROD ? LEVELS.WARN : LEVELS.DEBUG;

const COLORS = {
  DEBUG: '#9E9E9E',
  INFO:  '#2196F3',
  WARN:  '#FF9800',
  ERROR: '#F44336',
};

function _emit(level, source, message, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const ts    = new Date().toISOString();
  const color = COLORS[level] || '#000';
  const entry = { timestamp: ts, level, source, message, ...meta };

  /* Browser console output */
  const style = `color:${color};font-weight:bold`;
  console.groupCollapsed(`%c[${level}] ${ts} | ${source}`, style);
  console.log('Message :', message);
  if (Object.keys(meta).length) console.log('Meta    :', meta);
  console.groupEnd();

  /* In a real app you might POST to a logging endpoint here:
   *   if (level === 'ERROR') sendToRemote(entry);
   */
  return entry;
}

const logger = {
  debug : (src, msg, meta) => _emit('DEBUG', src, msg, meta),
  info  : (src, msg, meta) => _emit('INFO',  src, msg, meta),
  warn  : (src, msg, meta) => _emit('WARN',  src, msg, meta),
  error : (src, msg, meta) => _emit('ERROR', src, msg, meta),

  /**
   * Wraps an async function with before/after/error logging.
   * @param {string}   source   – label for the log (e.g. 'NotificationsAPI')
   * @param {string}   opName   – name of the operation
   * @param {Function} fn       – async function to wrap
   */
  withLogging: (source, opName, fn) => async (...args) => {
    _emit('DEBUG', source, `→ ${opName} called`, { args });
    const t0 = performance.now();
    try {
      const result = await fn(...args);
      const ms = (performance.now() - t0).toFixed(1);
      _emit('INFO', source, `← ${opName} succeeded`, { durationMs: ms });
      return result;
    } catch (err) {
      const ms = (performance.now() - t0).toFixed(1);
      _emit('ERROR', source, `✖ ${opName} failed`, {
        durationMs : ms,
        error      : err?.message,
        status     : err?.response?.status,
      });
      throw err;
    }
  },
};

export default logger;
