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
    blurb: 'Apply for a document and follow your request.',
    icon: 'document',
    signin: {
      title: 'Sign in to Citizen Assist',
      lede: 'Use your mobile number and 4-digit PIN.',
      ask: 'No account yet?',
      act: 'Create one',
    },
    signup: {
      title: 'Create your account',
      lede: 'Use your mobile number and choose a 4-digit PIN.',
      ask: 'Already signed up?',
      act: 'Sign in instead',
    },
  },
  {
    id: 'agent',
    label: 'Agent',
    blurb: 'Help people with requests in your district.',
    icon: 'shieldCheck',
    signin: {
      title: 'Sign in as an agent',
      lede: 'Use the mobile number from your application and your 4-digit PIN.',
      ask: 'First time signing in?',
      act: 'Set your PIN',
    },
    signup: {
      title: 'Set up agent sign-in',
      lede: 'Use the mobile number from your application. Set a PIN after your application is approved.',
      ask: 'Already set a PIN?',
      act: 'Sign in instead',
    },
    foot: {
      text: 'Not an agent yet?',
      linkText: 'Apply now',
      to: '/become-an-agent',
    },
  },
  {
    id: 'admin',
    label: 'Administrator',
    blurb: 'Review agent applications and manage requests.',
    icon: 'track',
    signin: {
      title: 'Sign in as administrator',
      lede: 'Use the mobile number on your account and your 4-digit PIN.',
      ask: 'First time signing in?',
      act: 'Set your PIN',
    },
    signup: {
      title: 'Set up admin sign-in',
      lede: 'Use the mobile number on your account. An existing admin must set this up for you.',
      ask: 'Already set a PIN?',
      act: 'Sign in instead',
    },
    foot: { text: 'Admin actions are recorded.' },
  },
];

/** @param {string} id */
export const getRole = (id) => ROLES.find((role) => role.id === id) ?? ROLES[0];
