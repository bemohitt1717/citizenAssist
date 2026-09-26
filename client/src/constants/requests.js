/**
 * Service requests, for the tracking page.
 *
 * ── THE WHOLE SCHEMA ────────────────────────────────────────────────────────
 *   requests {
 *     _id
 *     reference   string   // shown to the citizen
 *     serviceId   string   // -> constants/services.js
 *     status      string   // -> one of STATUS_FLOW ids
 *     agentName   string | null
 *     charge      string
 *     createdAt   date
 *     timeline    [{ status, at, note }]   // append-only
 *   }
 *
 * `timeline` is an append-only array on the same document rather than a separate
 * collection. A request has at most a handful of entries, they are only ever
 * read alongside the request itself, and nothing else joins to them — so a
 * subdocument array keeps it to one read and one write.
 *
 * The current status is stored as well as being derivable from the last timeline
 * entry. That duplication is on purpose: it means listing requests by status
 * never has to open the array.
 */

/**
 * The ordered pipeline. `position` drives the progress bar, so a status can be
 * reworded without touching the component.
 */
export const STATUS_FLOW = [
  { id: 'pending', label: 'Request received', position: 1 },
  { id: 'assigned', label: 'Agent assigned', position: 2 },
  { id: 'review', label: 'Documents being checked', position: 3 },
  { id: 'processing', label: 'At the office', position: 4 },
  { id: 'completed', label: 'Completed', position: 5 },
];

/**
 * Statuses that sit outside the pipeline. Each carries a `tone` so the UI never
 * has to infer meaning from the id.
 */
export const STATUS_ASIDE = {
  action: { id: 'action', label: 'Waiting for your reply', tone: 'warn' },
  rejected: { id: 'rejected', label: 'Not approved', tone: 'stop' },
  cancelled: { id: 'cancelled', label: 'Cancelled', tone: 'stop' },
};

export const TOTAL_STAGES = STATUS_FLOW.length;

/** @param {string} id */
export const getStatus = (id) =>
  STATUS_FLOW.find((status) => status.id === id) ??
  STATUS_ASIDE[id] ?? { id, label: id, position: 0 };

/**
 * DEMO DATA — replace with the API response.
 *
 * These are invented records for building against. They are not real citizens,
 * real agents or real applications, and the page labels them as sample data on
 * screen so nobody mistakes them for a live account.
 *
 * To see the empty state instead, set DEMO_REQUESTS to [].
 */
export const DEMO_REQUESTS = [
  {
    id: 'r1',
    reference: 'CA-4821',
    serviceId: 'income-certificate',
    status: 'review',
    agentName: 'R. Meena',
    charge: '₹650',
    createdAt: '12 Aug 2026',
    timeline: [
      { status: 'pending', at: '12 Aug, 10:20', note: 'Request received.' },
      { status: 'assigned', at: '12 Aug, 15:40', note: 'Agent R. Meena assigned. Fee confirmed: ₹650.' },
      { status: 'review', at: '13 Aug, 09:05', note: 'We could not read the salary slip. Please add a clearer copy.' },
    ],
  },
  {
    id: 'r2',
    reference: 'CA-4795',
    serviceId: 'birth-certificate',
    status: 'completed',
    agentName: 'S. Prakash',
    charge: '₹420',
    createdAt: '02 Aug 2026',
    timeline: [
      { status: 'pending', at: '02 Aug, 11:00', note: 'Request received.' },
      { status: 'assigned', at: '02 Aug, 13:20', note: 'S. Prakash assigned.' },
      { status: 'review', at: '03 Aug, 10:10', note: 'Documents checked.' },
      { status: 'processing', at: '04 Aug, 09:30', note: 'Sent to the Municipal Corporation.' },
      { status: 'completed', at: '08 Aug, 16:45', note: 'Certificate issued and sent to you.' },
    ],
  },
  {
    id: 'r3',
    reference: 'CA-4760',
    serviceId: 'pan-services',
    status: 'action',
    agentName: 'R. Meena',
    charge: '₹500',
    createdAt: '28 Jul 2026',
    timeline: [
      { status: 'pending', at: '28 Jul, 18:05', note: 'Request received.' },
      { status: 'assigned', at: '29 Jul, 10:00', note: 'R. Meena assigned.' },
      { status: 'action', at: '30 Jul, 12:15', note: 'The name on Aadhaar does not match your form. Check the spelling.' },
    ],
  },
];
