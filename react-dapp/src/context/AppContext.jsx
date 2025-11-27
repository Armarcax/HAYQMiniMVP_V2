import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [statusMessage, setStatusMessage] = useState("");
  const [aprHistory, setAprHistory] = useState([]);

  const addAprPoint = (value) => {
    setAprHistory(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString(), value }
    ]);
  };

  return (
    <AppContext.Provider value={{ statusMessage, setStatusMessage, aprHistory, addAprPoint }}>
      {children}
    </AppContext.Provider>
  );
};
