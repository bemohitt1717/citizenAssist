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
    problem: 'The list of required documents can change.',
    response: 'Your agent checks the latest list before sending your documents.',
  },
  {
    id: 'queue',
    problem: 'A missing document can mean another trip to the office.',
    response: 'See what you need before you apply.',
  },
  {
    id: 'charges',
    problem: 'You should know the fee before work begins.',
    response: 'We show a fee range. Your agent confirms the exact amount first.',
  },
  {
    id: 'status',
    problem: 'It can be hard to know what is happening with your request.',
    response: 'Check its status and read updates from your agent at any time.',
  },
];

/**
 * The agent gate. The sequence is load-bearing — each stop is a condition for
 * the next, which is why these carry numbers where the service cards do not.
 */
export const VERIFICATION_STEPS = [
  { id: 'register', label: 'Agent applies', detail: 'Shares their details and work experience.' },
  { id: 'review', label: 'We check the application', detail: 'A person reviews the details.' },
  { id: 'verify', label: 'Approved', detail: 'The agent can now help with requests.' },
  { id: 'assign', label: 'Gets requests', detail: 'Citizens can now be matched with this agent.' },
];
