import { createContext, useContext } from 'react';

export const HomeReadyContext = createContext(() => {});
export const useMarkHomeReady = () => useContext(HomeReadyContext);
