import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  showSidebar: true,
  setShowSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(true);

  const value = {
    showSidebar,
    setShowSidebar,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;
