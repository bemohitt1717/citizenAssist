/**
 * DEMO SIGN-IN — for reviewing the interface before auth exists.
 *
 * There is no backend yet, so the form accepts one hard-coded number and code and
 * sends you to the dashboard for whichever role you picked. The credentials are
 * printed on the sign-in screen on purpose: this is a review build, and a demo
 * you cannot get into is not a demo.
 *
 * ── DELETE THIS FILE WHEN THE API LANDS ─────────────────────────────────────
 * Shipping it would mean a publicly documented credential that signs anyone in as
 * an administrator. `IS_DEMO_AUTH` is the single switch every use is behind, so
 * removing this file will surface every place that needs replacing as a build
 * error rather than leaving a silent hole.
 */

export const IS_DEMO_AUTH = true;

export const DEMO_MOBILE = '9876543210';
export const DEMO_OTP = '123456';

/** Where each role lands after signing in. */
export const HOME_FOR_ROLE = {
  citizen: '/track',
  agent: '/agent/dashboard',
  admin: '/admin/dashboard',
};
