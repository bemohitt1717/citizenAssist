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
    detail: 'See the documents, fee and usual time before you apply.',
  },
  {
    id: 'submit',
    label: 'Add your details',
    detail: 'Fill in a short form and upload your documents online.',
  },
  {
    id: 'assign',
    label: 'An agent helps you',
    detail: 'An approved agent contacts you and confirms the fee before starting.',
  },
  {
    id: 'review',
    label: 'Your documents are checked',
    detail: 'Your agent checks the documents before sending them to the office.',
  },
  {
    id: 'issue',
    label: 'Get your certificate',
    detail: 'Follow updates until the government office issues your certificate.',
  },
];
