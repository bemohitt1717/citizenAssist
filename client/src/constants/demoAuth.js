/**
 * DEMO SIGN-IN — lets the interface be reviewed before auth exists.
 *
 * There is no server to verify against, so any well-formed mobile number and
 * six-digit code is accepted and you land on the dashboard for whichever role you
 * picked. There is no fixed credential to look up, which is why the panel that
 * used to print one has been removed.
 *
 * ── THIS IS NOT A LOGIN ─────────────────────────────────────────────────────
 * While `IS_DEMO_AUTH` is true, sign-in guards nothing. There are also no route
 * guards, so /agent/... and /admin/... are reachable by typing the URL whether you
 * sign in or not. That is fine for a prototype with invented data and no real
 * accounts; it is not fine the moment anything real is behind it.
 *
 * ── DELETE THIS FILE WHEN THE API LANDS ─────────────────────────────────────
 * `IS_DEMO_AUTH` is the single switch every use sits behind, so removing this file
 * turns each one into a build error rather than leaving a silent hole. Add the
 * route guards at the same time.
 */

export const IS_DEMO_AUTH = true;

/** Where each role lands after signing in. */
export const HOME_FOR_ROLE = {
  citizen: '/track',
  agent: '/agent/dashboard',
  admin: '/admin/dashboard',
};
