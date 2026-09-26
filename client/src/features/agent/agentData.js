/**
 * AGENT DASHBOARD — sections and demo data.
 *
 * Lives inside the agent feature, not in a shared dashboard module, so the admin
 * dashboard can change without touching anything here.
 *
 * All records below are invented for building against. No real agents, citizens
 * or requests exist. There is no marker for this on the dashboard itself — the
 * disclosure lives here, in PRODUCT.md and in the README — so do not read any
 * figure in this file as live, and do not carry one into real copy.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 * Four sections. Your spec listed pending / active / completed / history as
 * separate items; they are one Requests section with a status filter, because
 * four screens of the same rows means four endpoints and four places for a bug.
 * "History" is Completed, sorted by date.
 */

export const AGENT_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'track', blurb: 'See what needs your attention.' },
  {
    id: 'requests',
    label: 'Requests',
    icon: 'document',
    blurb: 'View and update your requests.',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: 'income',
    blurb: 'See amounts from completed requests.',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'shieldCheck',
    blurb: 'Change your details and see your status.',
  },
];

/* GET /api/agent/profile */
export const AGENT_PROFILE = {
  name: 'R. Meena',
  mobile: '9876543210',
  email: 'r.meena@gmail.com',
  district: 'Karimnagar',
  experience: '3-7',
  services: ['income-certificate', 'caste-certificate', 'birth-certificate', 'aadhaar-services'],
  verified: true,
  verifiedOn: '14 Mar 2026',
  joinedOn: '02 Mar 2026',
};

/* GET /api/agent/dashboard — counts are the requests collection filtered by
   agentId; earnings are summed over completed requests, so there is no separate
   ledger collection to keep in step. */
export const AGENT_COUNTS = {
  pending: 3,
  active: 5,
  action: 1,
  completed: 34,
};

export const AGENT_EARNINGS = {
  thisMonth: '₹8,450',
  allTime: '₹1,42,300',
  unsettled: '₹1,950',
  completedThisMonth: 11,
};

/**
 * GET /api/agent/requests?status=
 *
 * `status` values match STATUS_FLOW in constants/requests.js, plus 'offered' for
 * a request assigned but not yet accepted — the only agent-specific state.
 */
export const AGENT_REQUESTS = [
  {
    id: 'ar1',
    reference: 'CA-4903',
    serviceId: 'caste-certificate',
    status: 'offered',
    citizen: 'A. Kumar',
    citizenMobile: '9876511001',
    district: 'Karimnagar',
    charge: '₹800',
    documentsAttached: 6,
    documentsRequired: 6,
    updatedAt: '2 hours ago',
    lastNote: null,
  },
  {
    id: 'ar2',
    reference: 'CA-4901',
    serviceId: 'income-certificate',
    status: 'offered',
    citizen: 'S. Devi',
    citizenMobile: '9876511042',
    district: 'Karimnagar',
    charge: '₹650',
    documentsAttached: 3,
    documentsRequired: 5,
    updatedAt: '5 hours ago',
    lastNote: null,
  },
  {
    id: 'ar3',
    reference: 'CA-4898',
    serviceId: 'aadhaar-services',
    status: 'offered',
    citizen: 'M. Rao',
    citizenMobile: '9876511077',
    district: 'Karimnagar',
    charge: '₹300',
    documentsAttached: 2,
    documentsRequired: 2,
    updatedAt: 'Yesterday',
    lastNote: null,
  },
  {
    id: 'ar4',
    reference: 'CA-4821',
    serviceId: 'income-certificate',
    status: 'review',
    citizen: 'G. Shankar',
    citizenMobile: '9876511120',
    district: 'Karimnagar',
    charge: '₹650',
    documentsAttached: 4,
    documentsRequired: 5,
    updatedAt: 'Today, 09:05',
    lastNote: 'Salary slip is unreadable. Asked for a clearer copy.',
  },
  {
    id: 'ar5',
    reference: 'CA-4810',
    serviceId: 'birth-certificate',
    status: 'processing',
    citizen: 'N. Lakshmi',
    citizenMobile: '9876511155',
    district: 'Karimnagar',
    charge: '₹420',
    documentsAttached: 3,
    documentsRequired: 3,
    updatedAt: 'Yesterday, 14:20',
    lastNote: 'Submitted at the Municipal Corporation counter.',
  },
  {
    id: 'ar6',
    reference: 'CA-4802',
    serviceId: 'domicile-certificate',
    status: 'processing',
    citizen: 'V. Reddy',
    citizenMobile: '9876511190',
    district: 'Karimnagar',
    charge: '₹700',
    documentsAttached: 4,
    documentsRequired: 4,
    updatedAt: '2 days ago',
    lastNote: 'With the Tahsildar office for signature.',
  },
  {
    id: 'ar7',
    reference: 'CA-4760',
    serviceId: 'pan-services',
    status: 'action',
    citizen: 'T. Anand',
    citizenMobile: '9876511205',
    district: 'Karimnagar',
    charge: '₹500',
    documentsAttached: 2,
    documentsRequired: 3,
    updatedAt: '3 days ago',
    lastNote: 'Name on Aadhaar does not match the form. Waiting on confirmation.',
  },
  {
    id: 'ar8',
    reference: 'CA-4795',
    serviceId: 'birth-certificate',
    status: 'completed',
    citizen: 'P. Joseph',
    citizenMobile: '9876511240',
    district: 'Karimnagar',
    charge: '₹420',
    documentsAttached: 3,
    documentsRequired: 3,
    updatedAt: '08 Aug 2026',
    lastNote: 'Certificate issued and handed over.',
  },
  {
    id: 'ar9',
    reference: 'CA-4788',
    serviceId: 'caste-certificate',
    status: 'completed',
    citizen: 'B. Swamy',
    citizenMobile: '9876511288',
    district: 'Karimnagar',
    charge: '₹900',
    documentsAttached: 6,
    documentsRequired: 6,
    updatedAt: '04 Aug 2026',
    lastNote: 'Issued by the SDO office.',
  },
];

/* GET /api/agent/earnings — one entry per completed request. Derived, not
   stored: the amount is the request's charge and the date is its completion. */
export const AGENT_PAYOUTS = [
  { id: 'p1', reference: 'CA-4795', serviceId: 'birth-certificate', amount: '₹420', on: '08 Aug 2026', settled: true },
  { id: 'p2', reference: 'CA-4788', serviceId: 'caste-certificate', amount: '₹900', on: '04 Aug 2026', settled: true },
  { id: 'p3', reference: 'CA-4771', serviceId: 'income-certificate', amount: '₹650', on: '01 Aug 2026', settled: true },
  { id: 'p4', reference: 'CA-4802', serviceId: 'domicile-certificate', amount: '₹700', on: 'Pending', settled: false },
  { id: 'p5', reference: 'CA-4810', serviceId: 'birth-certificate', amount: '₹420', on: 'Pending', settled: false },
  { id: 'p6', reference: 'CA-4744', serviceId: 'aadhaar-services', amount: '₹300', on: '28 Jul 2026', settled: true },
];

/** Statuses an agent can move a request to, in order. */
export const AGENT_NEXT_STATUS = [
  { id: 'review', label: 'Checking documents' },
  { id: 'processing', label: 'At the office' },
  { id: 'action', label: 'Waiting for citizen' },
  { id: 'completed', label: 'Completed' },
];
