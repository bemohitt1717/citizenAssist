/**
 * The three roles, and the only thing that differs between their sign-in
 * screens: the words.
 *
 * All three use the same two routes — a one-time code to a mobile number, or a
 * Google account. One auth mechanism, one set of endpoints, one users collection
 * with a `role` field on it. Nothing about admin or agent sign-in needs its own
 * page, its own form or its own table.
 *
 *   users {
 *     _id
 *     mobile   string
 *     email    string
 *     role     'citizen' | 'agent' | 'admin'
 *     status   'active' | 'pending' | 'suspended'   // agents start 'pending'
 *   }
 */
export const ROLES = [
  {
    id: 'citizen',
    label: 'Citizen',
    blurb: 'Request help with a document and follow it.',
    icon: 'document',
    title: 'Sign in to Citizen Assist',
    lede: 'Use your mobile number and we will send you a one-time code. No password to remember.',
    foot: 'First time here? Signing in creates your account.',
  },
  {
    id: 'agent',
    label: 'Service agent',
    blurb: 'Handle citizen files in your district.',
    icon: 'shieldCheck',
    title: 'Sign in as an agent',
    lede: 'Use the mobile number or Google account you applied with. Your account opens once an admin has verified you.',
    foot: 'Not registered as an agent yet? Apply first — verification comes before your first file.',
  },
  {
    id: 'admin',
    label: 'Administrator',
    blurb: 'Verify agents and oversee the platform.',
    icon: 'track',
    title: 'Sign in as administrator',
    lede: 'Use the mobile number or Google account on your admin record. Every action taken here is recorded.',
    foot: 'Admin accounts are created by an existing administrator, never by signing in.',
  },
];

/** @param {string} id */
export const getRole = (id) => ROLES.find((role) => role.id === id) ?? ROLES[0];
