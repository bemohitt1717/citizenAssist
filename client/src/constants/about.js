/**
 * About content.
 *
 * Deliberately contains no counters, no testimonials and no team roster.
 * None of those exist yet, and inventing them is the one thing this product
 * cannot afford to do — see the evidence section of PRODUCT.md. What is here
 * instead is verifiable from the product's own mechanics.
 */

/**
 * Each pair is a documented failure of the current process against the
 * specific thing the platform does about it. Every response maps to real
 * product logic, not to a promise: requirement checking, up-front document
 * lists, published charges, and request status.
 */
export const FRICTIONS = [
  {
    id: 'requirements',
    problem: 'The requirement list changes, and nobody tells you which version is current.',
    response:
      'Your agent checks the file against the list the office is actually using before it goes in.',
  },
  {
    id: 'queue',
    problem: 'You find out a paper is missing after you have already spent the morning queueing.',
    response:
      'Every document is named on the service page up front, and checked off before submission.',
  },
  {
    id: 'charges',
    problem: 'Nobody will tell you what the help costs until you are too far in to walk away.',
    response:
      'The assistance charge is published as a range, then confirmed with you before any work starts.',
  },
  {
    id: 'status',
    problem: 'Once the file is submitted, you have no way of knowing where it has got to.',
    response:
      'The request carries a status you can open at any time, and the agent moves it as it advances.',
  },
];

/**
 * The agent gate. The sequence is load-bearing — each stop is a condition for
 * the next, which is why these carry numbers where the service cards do not.
 */
export const VERIFICATION_STEPS = [
  { id: 'register', label: 'Agent registers', detail: 'Applies with identity and work history.' },
  { id: 'review', label: 'Admin reviews', detail: 'Documents are checked by a person, not a script.' },
  { id: 'verify', label: 'Verified', detail: 'Approved and marked active on the platform.' },
  { id: 'assign', label: 'Takes requests', detail: 'Only now can a citizen’s file reach them.' },
];
