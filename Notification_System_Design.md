# Stage 1 — Notification System Design

## Overview

The Priority Inbox ensures users always see the **top *n*** most important
unread notifications first, even as new ones stream in continuously.

---

## Priority Score Formula

```
priority_score = type_weight × 1,000,000 + unix_timestamp_seconds
```

| Type      | Weight | Rationale                                   |
|-----------|--------|---------------------------------------------|
| Placement | 3      | Career-critical; demands immediate attention |
| Result    | 2      | Academic impact; time-sensitive              |
| Event     | 1      | Informational; lower urgency                 |

Multiplying the weight by 1 000 000 ensures **type always dominates**
recency, while the Unix timestamp (seconds) breaks ties within the same
type — a more recent notification of the same type ranks higher.

---

## Data Structure — Min-Heap of Size N

### Why a min-heap?

| Approach | Insert | Query top-N | Notes |
|---|---|---|---|
| Sort full list every time | O(M log M) | O(N) | Expensive as M grows |
| Max-heap over all M items | O(log M) | O(N log N) | Heap grows unboundedly |
| **Min-heap capped at N** | **O(log N)** | **O(N log N)** | Constant memory |

A **min-heap of exactly N entries** is the most efficient choice:

1. The heap root is always the *least important* notification currently in
   the top-N.
2. When a new notification arrives:
   - If `score > root.score` → `heapreplace(root, new)` — O(log N)
   - Otherwise → discard — O(1)
3. To display, sort the N entries descending — O(N log N), where N is tiny
   (10–20).

Memory is bounded at O(N) regardless of how many notifications arrive.

---

## Handling Continuous Incoming Notifications

```
New notification
      │
      ▼
Compute priority_score
      │
      ├─ Already seen? (ID in set) ──► discard
      │
      ▼
heap size < N?
      │
      ├── YES ──► heappush           O(log N)
      │
      └── NO  ──► score > heap[0]?
                      │
                      ├── YES ──► heapreplace   O(log N)
                      └── NO  ──► discard       O(1)
```

A `seen` set (hash set) provides O(1) duplicate detection, preventing
the same notification ID from being counted twice.

In a production system the "new notification" input would come from one of:
- **WebSocket / SSE** — server pushes events; client calls `inbox.add()`
- **Polling loop** — client periodically calls the API with a
  `since_timestamp` query parameter and feeds the delta into the inbox

---

## Complexity Summary

| Operation | Time | Space |
|---|---|---|
| Add one notification | O(log N) | O(1) amortised |
| Batch-load M notifications | O(M log N) | O(N) |
| Query top-N | O(N log N) | O(N) |
| Duplicate check | O(1) average | O(M) for seen-set |

---

## Configuration

`TOP_N` is a simple integer constant (default **10**) that can be changed
to 15, 20, etc. without touching any other logic — the heap automatically
caps itself at the new value.

---

## Files

| File | Purpose |
|---|---|
| `priority_inbox.py` | Stage 1 implementation — min-heap Priority Inbox |
| `Notification_System_Design.md` | This document |
| `notification-app-fe/` | Stage 2 — React + Material UI frontend |
