import React, { createContext, useState } from 'react';

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info', // 'error', 'warning', 'info', 'success'
    message: ''
  });

  // Close alert
  const closeAlert = () => {
    setAlert({
      ...alert,
      show: false
    });
  };

  return (
    <AlertContext.Provider value={{ alert, setAlert, closeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};