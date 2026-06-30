/**
 * mockData.js
 * Rich sample dataset matching the exact API response shape.
 * Used when REACT_APP_USE_MOCK=true or the real API is unreachable.
 */

const BASE_TS = new Date('2026-04-22T17:51:30Z').getTime();
const fmt = (offsetSec) => {
  const d = new Date(BASE_TS - offsetSec * 1000);
  return d.toISOString().replace('T', ' ').slice(0, 19);
};

export const MOCK_NOTIFICATIONS = [
  { ID: 'd146095a-0d86-4a34-9e69-3900a14576bc', Type: 'Result',    Message: 'Mid-Semester Results Published',          Timestamp: fmt(0)    },
  { ID: 'b283218f-ea5a-4b7c-93a9-1f2f240d64b0', Type: 'Placement', Message: 'CSX Corporation – Campus Hiring Drive',    Timestamp: fmt(12)   },
  { ID: '81589ada-0ad3-4f77-9554-f52fb558e09d', Type: 'Event',     Message: 'Annual Farewell Ceremony – Main Auditorium', Timestamp: fmt(24) },
  { ID: '0005513a-142b-4bbc-8678-eefec65e1ede', Type: 'Result',    Message: 'Mid-Semester Supplementary Results',       Timestamp: fmt(36)   },
  { ID: 'ea836726-c25e-4f21-a72f-544a6af8a37f', Type: 'Result',    Message: 'Project Review – Phase 1 Marks',           Timestamp: fmt(48)   },
  { ID: '003cb427-8fc6-47f7-bb00-be228f6b0d2c', Type: 'Result',    Message: 'External Viva Results Announced',          Timestamp: fmt(60)   },
  { ID: 'e5c4ff20-31bf-4d40-8f02-72fda59e8918', Type: 'Result',    Message: 'Project Review – Phase 2 Marks',           Timestamp: fmt(72)   },
  { ID: '1cfce5ee-ad37-4894-8946-d707627176a5', Type: 'Event',     Message: 'TechFest 2026 – Register Now',             Timestamp: fmt(84)   },
  { ID: 'cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8', Type: 'Result',    Message: 'Project Review – Phase 3 Marks',           Timestamp: fmt(96)   },
  { ID: '8a7412bd-6065-4d09-8501-a37f11cc848b', Type: 'Placement', Message: 'AMD – Advanced Micro Devices Hiring',      Timestamp: fmt(108)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000011', Type: 'Placement', Message: 'Google – SWE Intern Hiring Drive',         Timestamp: fmt(120)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000012', Type: 'Placement', Message: 'Microsoft – Full Time Roles Open',         Timestamp: fmt(132)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000013', Type: 'Event',     Message: 'Cultural Night – Registrations Open',      Timestamp: fmt(144)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000014', Type: 'Result',    Message: 'End-Semester Grades Released',             Timestamp: fmt(156)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000015', Type: 'Placement', Message: 'Infosys – Off Campus Drive',               Timestamp: fmt(168)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000016', Type: 'Event',     Message: 'Hackathon 2026 – Team Registration',       Timestamp: fmt(180)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000017', Type: 'Result',    Message: 'Internal Assessment Marks Updated',        Timestamp: fmt(192)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000018', Type: 'Placement', Message: 'Wipro – Hiring for 2026 Batch',            Timestamp: fmt(204)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000019', Type: 'Event',     Message: 'Sports Day – Event Schedule Released',     Timestamp: fmt(216)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000020', Type: 'Result',    Message: 'Practical Examination Marks Out',          Timestamp: fmt(228)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000021', Type: 'Placement', Message: 'TCS NQT – Registration Deadline Tomorrow', Timestamp: fmt(240)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000022', Type: 'Event',     Message: 'Alumni Meet – Save The Date',              Timestamp: fmt(252)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000023', Type: 'Result',    Message: 'Revaluation Results Published',            Timestamp: fmt(264)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000024', Type: 'Placement', Message: 'Accenture – Walk-in Drive This Friday',    Timestamp: fmt(276)  },
  { ID: 'f1a2b3c4-0001-4aaa-8abc-000000000025', Type: 'Event',     Message: 'Workshop on AI/ML – Limited Seats',        Timestamp: fmt(288)  },
];

/**
 * Simulate paginated API response from mock data.
 */
export function getMockResponse({ page = 1, limit = 10, notification_type } = {}) {
  let filtered = MOCK_NOTIFICATIONS;
  if (notification_type) {
    filtered = filtered.filter(n => n.Type === notification_type);
  }
  const total = filtered.length;
  const start = (page - 1) * limit;
  const notifications = filtered.slice(start, start + limit);
  return { notifications, total, page, limit };
}
