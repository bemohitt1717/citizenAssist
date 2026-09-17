/**
 * The three roles, and the only thing that differs between their sign-in
 * screens: the words.
 *
 * All three authenticate the same two ways — a mobile number with a 4-digit PIN,
 * or a Google account. One mechanism, one set of endpoints, one users collection
 * with a `role` field on it. Nothing about admin or agent sign-in needs its own
 * page, its own form or its own table.
 *
 *   users {
 *     _id
 *     mobile   string
 *     email    string
 *     pinHash  string   // the hash, never the PIN itself
 *     role     'citizen' | 'agent' | 'admin'
 *     status   'active' | 'pending' | 'suspended'   // agents start 'pending'
 *   }
 *
 * ── SIGNING IN VERSUS SIGNING UP ────────────────────────────────────────────
 * Signing in checks a PIN against the stored hash. Signing up sets the hash for
 * the first time. What differs between the roles is not whether a PIN gets
 * chosen — all three need to choose one once — but who created the record it
 * belongs to:
 *
 *   citizen   signing up creates the record
 *   agent     the record comes from their application at /become-an-agent
 *   admin     the record is created by an existing administrator
 *
 * That is the whole reason each role carries its own `signup` wording. Promising
 * a stranger an admin account would be the interface telling a lie, so the copy
 * says where the account has to come from instead.
 *
 * `foot` is the optional extra line below the sign-in/sign-up swap, for the one
 * thing a role needs said that the swap does not cover.
 */
export const ROLES = [
  {
    id: 'citizen',
    label: 'Citizen',
    blurb: 'Request help with a document and follow it.',
    icon: 'document',
    signin: {
      title: 'Sign in to Citizen Assist',
      lede: 'Your mobile number and the 4-digit PIN you set.',
      ask: 'No account yet?',
      act: 'Create one',
    },
    signup: {
      title: 'Create your account',
      lede: 'A mobile number and a 4-digit PIN you choose. Nothing longer to remember.',
      ask: 'Already signed up?',
      act: 'Sign in instead',
    },
  },
  {
    id: 'agent',
    label: 'Service agent',
    blurb: 'Handle citizen files in your district.',
    icon: 'shieldCheck',
    signin: {
      title: 'Sign in as an agent',
      lede: 'The mobile number you applied with, and your 4-digit PIN.',
      ask: 'First time signing in?',
      act: 'Set your PIN',
    },
    signup: {
      title: 'Set up agent sign-in',
      lede: 'The mobile number you applied with. Your PIN works once an admin verifies you.',
      ask: 'Already set a PIN?',
      act: 'Sign in instead',
    },
    foot: {
      text: 'Not registered as an agent yet?',
      linkText: 'Apply here',
      to: '/become-an-agent',
    },
  },
  {
    id: 'admin',
    label: 'Administrator',
    blurb: 'Verify agents and oversee the platform.',
    icon: 'track',
    signin: {
      title: 'Sign in as administrator',
      lede: 'The number on your admin record, and your 4-digit PIN.',
      ask: 'First time signing in?',
      act: 'Set your PIN',
    },
    signup: {
      title: 'Set up admin sign-in',
      lede: 'The number on your admin record. Only an existing admin can create one.',
      ask: 'Already set a PIN?',
      act: 'Sign in instead',
    },
    foot: { text: 'Every action taken here is recorded.' },
  },
];

/** @param {string} id */
export const getRole = (id) => ROLES.find((role) => role.id === id) ?? ROLES[0];
