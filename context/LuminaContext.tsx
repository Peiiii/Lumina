import React, { createContext, useContext } from 'react';
import { LuminaPresenter, presenter } from '../presenter/LuminaPresenter';

const LuminaContext = createContext<LuminaPresenter>(presenter);

export const LuminaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LuminaContext.Provider value={presenter}>
      {children}
    </LuminaContext.Provider>
  );
};

export const usePresenter = () => useContext(LuminaContext);