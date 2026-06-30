"""
Stage 1 - Priority Inbox
========================
Fetches notifications from the campus API and maintains the top-N most
important unread notifications using a min-heap so that new arriving
notifications can be incorporated in O(log n) time.

Priority score = type_weight * 1_000_000 + unix_timestamp_seconds
  Placement → weight 3  (highest)
  Result    → weight 2
  Event     → weight 1  (lowest)

A higher score means the notification appears earlier in the Priority Inbox.
Automatically falls back to sample data when the API is unreachable.
"""

import heapq
import os
import time
import sys

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

from datetime import datetime, timezone

# ── Configuration ─────────────────────────────────────────────────────────────
API_URL  = "http://4.224.186.213/evaluation-service/notifications"
API_KEY  = os.environ.get("NOTIFICATION_API_KEY", "")
TOP_N    = 10

TYPE_WEIGHT = {"Placement": 3, "Result": 2, "Event": 1}

# ── ANSI colours ──────────────────────────────────────────────────────────────
COLORS = {
    "Placement": "\033[92m",
    "Result":    "\033[94m",
    "Event":     "\033[93m",
    "RESET":     "\033[0m",
    "BOLD":      "\033[1m",
    "DIM":       "\033[2m",
    "CYAN":      "\033[96m",
    "MAGENTA":   "\033[95m",
    "RED":       "\033[91m",
}

def c(text, key):
    return f"{COLORS.get(key,'')}{text}{COLORS['RESET']}"

# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_timestamp(ts_str: str) -> float:
    dt = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
    return dt.replace(tzinfo=timezone.utc).timestamp()

def priority_score(notification: dict) -> float:
    w  = TYPE_WEIGHT.get(notification["Type"], 0)
    ts = parse_timestamp(notification["Timestamp"])
    return w * 1_000_000 + ts

# ── Min-Heap Priority Inbox ───────────────────────────────────────────────────

class PriorityInbox:
    """
    Maintains top-N notifications using a min-heap of size N.
    Insert: O(log N)   Query: O(N log N)   Memory: O(N)
    """
    def __init__(self, n: int = TOP_N):
        self.n      = n
        self._heap  = []          # (score, id, notification)
        self._seen  = set()

    def add(self, notification: dict):
        nid = notification["ID"]
        if nid in self._seen:
            return
        self._seen.add(nid)
        score = priority_score(notification)
        entry = (score, nid, notification)
        if len(self._heap) < self.n:
            heapq.heappush(self._heap, entry)
        elif score > self._heap[0][0]:
            heapq.heapreplace(self._heap, entry)

    def add_batch(self, notifications):
        for n in notifications:
            self.add(n)

    def top(self):
        return [e[2] for e in sorted(self._heap, reverse=True)]

# ── Sample data (fallback) ────────────────────────────────────────────────────

def _sample_notifications():
    return [
        {"ID": "d146095a-0d86-4a34-9e69-3900a14576bc", "Type": "Result",    "Message": "Mid-Semester Results Published",        "Timestamp": "2026-04-22 17:51:30"},
        {"ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0", "Type": "Placement", "Message": "CSX Corporation – Campus Hiring Drive",  "Timestamp": "2026-04-22 17:51:18"},
        {"ID": "81589ada-0ad3-4f77-9554-f52fb558e09d", "Type": "Event",     "Message": "Annual Farewell Ceremony",               "Timestamp": "2026-04-22 17:51:06"},
        {"ID": "0005513a-142b-4bbc-8678-eefec65e1ede", "Type": "Result",    "Message": "Mid-Semester Supplementary Results",     "Timestamp": "2026-04-22 17:50:54"},
        {"ID": "ea836726-c25e-4f21-a72f-544a6af8a37f", "Type": "Result",    "Message": "Project Review – Phase 1 Marks",         "Timestamp": "2026-04-22 17:50:42"},
        {"ID": "003cb427-8fc6-47f7-bb00-be228f6b0d2c", "Type": "Result",    "Message": "External Viva Results Announced",        "Timestamp": "2026-04-22 17:50:30"},
        {"ID": "e5c4ff20-31bf-4d40-8f02-72fda59e8918", "Type": "Result",    "Message": "Project Review – Phase 2 Marks",         "Timestamp": "2026-04-22 17:50:18"},
        {"ID": "1cfce5ee-ad37-4894-8946-d707627176a5", "Type": "Event",     "Message": "TechFest 2026 – Register Now",           "Timestamp": "2026-04-22 17:50:06"},
        {"ID": "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", "Type": "Result",    "Message": "Project Review – Phase 3 Marks",         "Timestamp": "2026-04-22 17:49:54"},
        {"ID": "8a7412bd-6065-4d09-8501-a37f11cc848b", "Type": "Placement", "Message": "AMD – Advanced Micro Devices Hiring",    "Timestamp": "2026-04-22 17:49:42"},
        {"ID": "live-g001",                             "Type": "Placement", "Message": "Google – SWE Intern Hiring Drive",       "Timestamp": "2026-04-22 18:00:00"},
        {"ID": "live-g002",                             "Type": "Placement", "Message": "Microsoft – Full Time Roles Open",       "Timestamp": "2026-04-22 18:00:30"},
        {"ID": "live-g003",                             "Type": "Result",    "Message": "End-Semester Grades Released",           "Timestamp": "2026-04-22 18:01:00"},
        {"ID": "live-g004",                             "Type": "Event",     "Message": "Hackathon 2026 – Team Registration",     "Timestamp": "2026-04-22 18:01:30"},
        {"ID": "live-g005",                             "Type": "Placement", "Message": "Infosys – Off Campus Drive",             "Timestamp": "2026-04-22 18:02:00"},
    ]

# ── API fetch ─────────────────────────────────────────────────────────────────

def fetch_notifications(page=1, limit=50):
    if not HAS_REQUESTS:
        print(c("  [INFO] 'requests' not installed – using sample data.", "DIM"))
        return _sample_notifications()

    headers = {"Authorization": f"Bearer {API_KEY}"} if API_KEY else {}
    try:
        resp = requests.get(API_URL, headers=headers,
                            params={"page": page, "limit": limit}, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        return data.get("notifications", [])
    except Exception as exc:
        print(c(f"  [WARN] API unreachable ({exc.__class__.__name__}: {exc})", "RED"))
        print(c("  [INFO] Using built-in sample data for demonstration.\n", "DIM"))
        return _sample_notifications()

# ── Display helpers ───────────────────────────────────────────────────────────

def _sep(char="─", width=76):
    print(c("  " + char * width, "DIM"))

def _print_table(notifications):
    if not notifications:
        print(c("  (no notifications)", "DIM"))
        return

    header = f"  {'#':<4} {'TYPE':<12} {'MESSAGE':<42} {'TIMESTAMP':<22} {'SCORE':>14}"
    print(c(header, "BOLD"))
    _sep()

    for rank, n in enumerate(notifications, 1):
        score = priority_score(n)
        t     = n["Type"]
        tag   = {
            "Placement": c("● PLACEMENT", "Placement"),
            "Result":    c("● RESULT   ", "Result"),
            "Event":     c("● EVENT    ", "Event"),
        }.get(t, t)
        msg   = n["Message"][:40]
        line  = f"  {rank:<4} {tag}  {msg:<42} {n['Timestamp']:<22} {c(str(int(score)), 'CYAN'):>14}"
        print(line)

# ── Live feed simulation ──────────────────────────────────────────────────────

LIVE_FEED = [
    {"ID": "stream-001", "Type": "Placement", "Message": "Amazon – SDE Roles Open Now",    "Timestamp": "2026-04-22 18:03:00"},
    {"ID": "stream-002", "Type": "Event",     "Message": "Cultural Night – Last Few Seats", "Timestamp": "2026-04-22 18:03:30"},
    {"ID": "stream-003", "Type": "Result",    "Message": "Backlog Results Announced",       "Timestamp": "2026-04-22 18:04:00"},
]

def simulate_live_feed(inbox: PriorityInbox):
    for notif in LIVE_FEED:
        time.sleep(0.4)
        t = notif["Type"]
        badge = c(f"[{t}]", t)
        print(f"\n  🔔  {c('New notification →', 'BOLD')} {badge} {notif['Message']}")
        inbox.add(notif)
        print(f"  Updated Priority Inbox (top {inbox.n}):")
        _print_table(inbox.top())

# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    W = 80
    print()
    print(c("═" * W, "CYAN"))
    print(c("  📬   CAMPUS NOTIFICATIONS — PRIORITY INBOX   (Stage 1)", "BOLD"))
    print(c("═" * W, "CYAN"))

    inbox = PriorityInbox(n=TOP_N)

    # Step 1 — fetch
    print(c("\n  [1/3]  Fetching notifications from API …", "BOLD"))
    notifications = fetch_notifications(page=1, limit=50)
    print(c(f"         Retrieved {len(notifications)} notification(s).\n", "DIM"))
    inbox.add_batch(notifications)

    # Step 2 — initial top-N
    print(c(f"  [2/3]  Top {TOP_N} Priority Notifications (initial load):\n", "BOLD"))
    _print_table(inbox.top())

    # Step 3 — live stream simulation
    print(c(f"\n  [3/3]  Simulating live incoming notifications …", "BOLD"))
    simulate_live_feed(inbox)

    # Final
    print()
    print(c("═" * W, "CYAN"))
    print(c(f"  ✅   FINAL PRIORITY INBOX — TOP {TOP_N}", "BOLD"))
    print(c("═" * W, "CYAN"))
    _print_table(inbox.top())
    print()
    print(c("  Algorithm : Min-Heap of size N  |  Insert O(log N)  |  Memory O(N)", "DIM"))
    print(c("  Weights   : Placement=3  Result=2  Event=1  (× 1,000,000 + timestamp)", "DIM"))
    print()

if __name__ == "__main__":
    # Enable ANSI colours on Windows
    if sys.platform == "win32":
        os.system("color")
    main()
