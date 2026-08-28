import { createContext, useContext } from 'react';

/**
 * Context and consumer hook only — no component.
 *
 * Kept apart from RequestFlowProvider so that file exports nothing but a
 * component. Mixing a component and a plain function in one module breaks Fast
 * Refresh, which then does a full reload on every edit instead of preserving
 * the open dialog's state.
 */
export const RequestFlowContext = createContext(null);

export const useRequestFlow = () => {
  const context = useContext(RequestFlowContext);

  if (!context) {
    throw new Error('useRequestFlow must be used inside a RequestFlowProvider.');
  }

  return context;
};
