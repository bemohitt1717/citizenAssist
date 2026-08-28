/**
 * The citizen's path, end to end. Mirrors the flow in PRODUCT.md exactly:
 * explore → select → request → agent assigned → agent processes → status
 * updates → completed.
 *
 * `id` selects the animated stage that illustrates each step. Keep the two in
 * step: adding an entry here without a matching stage renders an empty panel.
 */
export const PROCESS_STEPS = [
  {
    id: 'choose',
    label: 'Pick the service',
    detail:
      'Six to choose from. The documents, the charge and the timeline are all on the card before you commit to anything.',
  },
  {
    id: 'submit',
    label: 'Send us the basics',
    detail:
      'A short form and your documents, uploaded once. Nothing to queue for, and no office visit to get started.',
  },
  {
    id: 'assign',
    label: 'A verified agent takes it',
    detail:
      'Your file goes to an agent an administrator has already checked. They confirm the exact charge with you before starting.',
  },
  {
    id: 'review',
    label: 'Your file gets checked',
    detail:
      'Every document is matched against the list the office is currently using, so nothing bounces back for a missing page.',
  },
  {
    id: 'issue',
    label: 'The authority issues it',
    detail:
      'You watch the status the whole way. The certificate is issued and signed by the government office, then reaches you.',
  },
];
