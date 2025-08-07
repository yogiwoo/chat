import { createContext, useContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
    console.log("DataProvider initialized with sessionId:", sessionId);
  const value = {
    sessionId,
    setSessionId,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to consume context
export const useDataContext = () => useContext(DataContext);
