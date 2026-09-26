/**
 * Agent application.
 *
 * ── THE WHOLE SCHEMA ────────────────────────────────────────────────────────
 * One document per application. Nothing nested, nothing binary:
 *
 *   agentApplications {
 *     _id
 *     fullName        string
 *     mobile          string   // 10 digits — also the PIN login identity
 *     email           string   // the Google account — also a login identity
 *     district        string
 *     experience      string   // one of EXPERIENCE_BANDS ids
 *     services        string[] // ids from constants/services.js
 *     status          string   // 'pending' | 'verified' | 'rejected'
 *     createdAt       date
 *   }
 *
 * Deliberately NO photograph and no document uploads. File storage means a
 * bucket, signed URLs, virus scanning and a deletion policy — all of which can
 * come later if they are ever actually needed. An admin can verify an agent from
 * these fields plus a phone call, which is how it would happen anyway.
 *
 * Both `mobile` and `email` are collected because sign-in accepts either: the
 * mobile with a PIN, the email for Google. Same two routes for every role.
 */

export const EXPERIENCE_BANDS = [
  { id: 'new', label: 'Just starting out' },
  { id: '1-3', label: '1 to 3 years' },
  { id: '3-7', label: '3 to 7 years' },
  { id: '7+', label: 'More than 7 years' },
];

/** What an applicant is agreeing to. Shown on the first step, before any field. */
export const AGENT_TERMS = [
  {
    id: 'verify',
    title: 'We review every application',
    text: 'You can take requests only after we approve your application.',
  },
  {
    id: 'charges',
    title: 'Agree on the fee first',
    text: 'We show a fee range. Confirm the exact fee with the citizen before work begins. It cannot change later.',
  },
  {
    id: 'documents',
    title: 'Keep documents private',
    text: 'Use a citizen’s documents only for their request.',
  },
  {
    id: 'honesty',
    title: 'The office makes the decision',
    text: 'The government office issues the certificate. You help with the application.',
  },
];
