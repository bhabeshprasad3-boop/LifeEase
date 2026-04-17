import { createContext, useContext, useState } from 'react';

const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(v => !v);

  return (
    <MobileMenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) throw new Error('useMobileMenu must be used within MobileMenuProvider');
  return ctx;
}