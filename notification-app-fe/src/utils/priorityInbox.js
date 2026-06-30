/**
 * priorityInbox.js  –  Min-Heap Priority Inbox (Stage 1 logic, JS port)
 *
 * Identical algorithm to priority_inbox.py:
 *   score = typeWeight × 1_000_000 + unixTimestampSeconds
 *
 * Exposed as a pure utility (no React dependency) so it can be used in
 * both the hook layer and any future server-side context.
 */

const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

/** Parse "YYYY-MM-DD HH:MM:SS" → Unix seconds (UTC) */
function parseTimestamp(ts) {
  // "2026-04-22 17:51:30" → replace space with T, append Z
  return Math.floor(new Date(ts.replace(' ', 'T') + 'Z').getTime() / 1000);
}

export function priorityScore(notification) {
  const w  = TYPE_WEIGHT[notification.Type] ?? 0;
  const ts = parseTimestamp(notification.Timestamp);
  return w * 1_000_000 + ts;
}

/* ─── Min-Heap helpers ─────────────────────────────────────────────────────── */

function heapParent(i) { return Math.floor((i - 1) / 2); }
function heapLeft(i)   { return 2 * i + 1; }
function heapRight(i)  { return 2 * i + 2; }

function heapSwap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function siftUp(arr, i) {
  while (i > 0) {
    const p = heapParent(i);
    if (arr[p].score <= arr[i].score) break;
    heapSwap(arr, p, i);
    i = p;
  }
}

function siftDown(arr, i, size) {
  while (true) {
    let smallest = i;
    const l = heapLeft(i);
    const r = heapRight(i);
    if (l < size && arr[l].score < arr[smallest].score) smallest = l;
    if (r < size && arr[r].score < arr[smallest].score) smallest = r;
    if (smallest === i) break;
    heapSwap(arr, i, smallest);
    i = smallest;
  }
}

/* ─── PriorityInbox class ──────────────────────────────────────────────────── */

export class PriorityInbox {
  constructor(n = 10) {
    this.n    = n;
    this._heap = [];     // [{score, notification}]
    this._seen = new Set();
  }

  add(notification) {
    const id = notification.ID;
    if (this._seen.has(id)) return;
    this._seen.add(id);

    const score = priorityScore(notification);
    const entry = { score, notification };

    if (this._heap.length < this.n) {
      this._heap.push(entry);
      siftUp(this._heap, this._heap.length - 1);
    } else if (score > this._heap[0].score) {
      this._heap[0] = entry;
      siftDown(this._heap, 0, this._heap.length);
    }
  }

  addBatch(notifications) {
    notifications.forEach(n => this.add(n));
  }

  /** Returns top-N sorted best-first (descending score). */
  top() {
    return [...this._heap]
      .sort((a, b) => b.score - a.score)
      .map(e => e.notification);
  }

  get size() { return this._heap.length; }
}
