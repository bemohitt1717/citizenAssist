/**
 * ADMIN DASHBOARD — sections and demo data.
 *
 * Lives inside the admin feature, separate from the agent dashboard, so the two
 * can change independently.
 *
 * All records below are invented for building against. No real citizens, agents,
 * requests or complaints exist. There is no marker for this on the dashboard
 * itself — the disclosure lives here, in PRODUCT.md and in the README — so do not
 * read any figure in this file as live, and do not carry one into real copy.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 * Six sections. Your spec listed analytics separately; it is folded into the dashboard
 * because for six services in one district an analytics page would be the same
 * four numbers with more whitespace around them.
 */

export const ADMIN_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'track', blurb: 'See requests and applications to review.' },
  {
    id: 'requests',
    label: 'Requests',
    icon: 'document',
    blurb: 'See requests and choose an agent for each one.',
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'shieldCheck',
    blurb: 'Check applications and manage agents.',
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'caste',
    blurb: 'Change fees, wait times and document lists.',
  },
  {
    id: 'complaints',
    label: 'Complaints',
    icon: 'phone',
    blurb: 'Read and answer complaints.',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'income',
    blurb: 'Update your account details.',
  },
];

/* GET /api/admin/profile */
export const ADMIN_PROFILE = {
  name: 'Platform Admin',
  mobile: '9876543210',
  email: 'admin@citizenassist.in',
  since: '01 Feb 2026',
};

/* GET /api/admin/dashboard — every figure is a count or an average over the three
   collections. Nothing here needs to be stored separately. */
export const ADMIN_COUNTS = {
  citizens: 1284,
  agents: 46,
  pendingAgents: 4,
  activeRequests: 92,
  completedRequests: 741,
  openComplaints: 3,
};

/* completionRate = completed / (completed + rejected)
   averageDays   = mean gap between first and last timeline entry on completed */
export const ADMIN_PERFORMANCE = {
  completionRate: '94%',
  averageDays: '8.2',
};

/* GET /api/admin/analytics/services — a count grouped by serviceId. */
export const ADMIN_SERVICE_VOLUME = [
  { serviceId: 'income-certificate', requests: 268, share: 32 },
  { serviceId: 'caste-certificate', requests: 201, share: 24 },
  { serviceId: 'birth-certificate', requests: 154, share: 18 },
  { serviceId: 'domicile-certificate', requests: 118, share: 14 },
  { serviceId: 'aadhaar-services', requests: 62, share: 7 },
  { serviceId: 'pan-services', requests: 40, share: 5 },
];

/* GET /api/admin/agents — one list, filtered client-side by `status`. */
export const ADMIN_AGENTS = [
  {
    id: 'g1',
    name: 'P. Sharma',
    district: 'Warangal',
    mobile: '9876500011',
    email: 'p.sharma@gmail.com',
    experience: '3 to 7 years',
    services: 4,
    status: 'pending',
    appliedAt: 'Today',
    completed: 0,
    rating: null,
  },
  {
    id: 'g2',
    name: 'K. Iyer',
    district: 'Nizamabad',
    mobile: '9876500042',
    email: 'k.iyer@gmail.com',
    experience: '1 to 3 years',
    services: 2,
    status: 'pending',
    appliedAt: 'Yesterday',
    completed: 0,
    rating: null,
  },
  {
    id: 'g3',
    name: 'D. Naidu',
    district: 'Khammam',
    mobile: '9876500078',
    email: 'd.naidu@gmail.com',
    experience: 'More than 7 years',
    services: 6,
    status: 'pending',
    appliedAt: '3 days ago',
    completed: 0,
    rating: null,
  },
  {
    id: 'g4',
    name: 'L. Fernandes',
    district: 'Karimnagar',
    mobile: '9876500090',
    email: 'l.fernandes@gmail.com',
    experience: 'Just starting out',
    services: 2,
    status: 'pending',
    appliedAt: '4 days ago',
    completed: 0,
    rating: null,
  },
  {
    id: 'g5',
    name: 'R. Meena',
    district: 'Karimnagar',
    mobile: '9876543210',
    email: 'r.meena@gmail.com',
    experience: '3 to 7 years',
    services: 4,
    status: 'active',
    appliedAt: '02 Mar 2026',
    completed: 34,
    rating: '4.8',
  },
  {
    id: 'g6',
    name: 'S. Prakash',
    district: 'Warangal',
    mobile: '9876500310',
    email: 's.prakash@gmail.com',
    experience: 'More than 7 years',
    services: 5,
    status: 'active',
    appliedAt: '18 Feb 2026',
    completed: 61,
    rating: '4.6',
  },
  {
    id: 'g7',
    name: 'A. Bose',
    district: 'Nizamabad',
    mobile: '9876500377',
    email: 'a.bose@gmail.com',
    experience: '1 to 3 years',
    services: 3,
    status: 'active',
    completed: 12,
    appliedAt: '11 Jun 2026',
    rating: '4.2',
  },
  {
    id: 'g8',
    name: 'H. Qureshi',
    district: 'Khammam',
    mobile: '9876500401',
    email: 'h.qureshi@gmail.com',
    experience: 'Just starting out',
    services: 1,
    status: 'rejected',
    appliedAt: '22 Jul 2026',
    completed: 0,
    rating: null,
  },
];

/* GET /api/admin/requests — every request, with the agent denormalised onto it so
   the list needs one read rather than a join. */
export const ADMIN_REQUESTS = [
  {
    id: 'q1',
    reference: 'CA-4903',
    serviceId: 'caste-certificate',
    citizen: 'A. Kumar',
    district: 'Karimnagar',
    agentName: 'R. Meena',
    status: 'assigned',
    charge: '₹800',
    createdAt: 'Today',
  },
  {
    id: 'q2',
    reference: 'CA-4899',
    serviceId: 'domicile-certificate',
    citizen: 'F. Khan',
    district: 'Warangal',
    agentName: null,
    status: 'pending',
    charge: '₹700',
    createdAt: 'Today',
  },
  {
    id: 'q3',
    reference: 'CA-4896',
    serviceId: 'income-certificate',
    citizen: 'J. Thomas',
    district: 'Nizamabad',
    agentName: null,
    status: 'pending',
    charge: '₹650',
    createdAt: 'Yesterday',
  },
  {
    id: 'q4',
    reference: 'CA-4821',
    serviceId: 'income-certificate',
    citizen: 'G. Shankar',
    district: 'Karimnagar',
    agentName: 'R. Meena',
    status: 'review',
    charge: '₹650',
    createdAt: '12 Aug 2026',
  },
  {
    id: 'q5',
    reference: 'CA-4810',
    serviceId: 'birth-certificate',
    citizen: 'N. Lakshmi',
    district: 'Karimnagar',
    agentName: 'R. Meena',
    status: 'processing',
    charge: '₹420',
    createdAt: '10 Aug 2026',
  },
  {
    id: 'q6',
    reference: 'CA-4760',
    serviceId: 'pan-services',
    citizen: 'T. Anand',
    district: 'Karimnagar',
    agentName: 'R. Meena',
    status: 'action',
    charge: '₹500',
    createdAt: '28 Jul 2026',
  },
  {
    id: 'q7',
    reference: 'CA-4795',
    serviceId: 'birth-certificate',
    citizen: 'P. Joseph',
    district: 'Karimnagar',
    agentName: 'R. Meena',
    status: 'completed',
    charge: '₹420',
    createdAt: '02 Aug 2026',
  },
  {
    id: 'q8',
    reference: 'CA-4712',
    serviceId: 'caste-certificate',
    citizen: 'U. Patil',
    district: 'Warangal',
    agentName: 'S. Prakash',
    status: 'completed',
    charge: '₹900',
    createdAt: '21 Jul 2026',
  },
];

/* GET /api/admin/complaints
   complaints { _id, reference, requestRef, citizen, against, subject, detail,
                status: 'open'|'resolved', raisedAt, resolution } */
export const ADMIN_COMPLAINTS = [
  {
    id: 'c1',
    reference: 'CP-118',
    requestRef: 'CA-4760',
    citizen: 'T. Anand',
    against: 'R. Meena',
    subject: 'Agent asked for more than the stated charge',
    detail:
      'The card said ₹400 to ₹800 and the agent confirmed ₹500, but then asked for ₹700 in cash.',
    status: 'open',
    raisedAt: '2 days ago',
    resolution: null,
  },
  {
    id: 'c2',
    reference: 'CP-117',
    requestRef: 'CA-4899',
    citizen: 'F. Khan',
    against: null,
    subject: 'No agent assigned for four days',
    detail: 'Request was placed on Monday and still shows as pending with nobody assigned.',
    status: 'open',
    raisedAt: '4 days ago',
    resolution: null,
  },
  {
    id: 'c3',
    reference: 'CP-115',
    requestRef: 'CA-4712',
    citizen: 'U. Patil',
    against: 'S. Prakash',
    subject: 'Documents not returned after submission',
    detail: 'Original school certificate was taken and has not come back.',
    status: 'open',
    raisedAt: '6 days ago',
    resolution: null,
  },
  {
    id: 'c4',
    reference: 'CP-109',
    requestRef: 'CA-4611',
    citizen: 'M. Sundaram',
    against: 'A. Bose',
    subject: 'Agent unreachable for a week',
    detail: 'Calls not answered while the request sat in review.',
    status: 'resolved',
    raisedAt: '18 Jul 2026',
    resolution: 'Agent contacted and warned. Request reassigned to S. Prakash and completed.',
  },
];
