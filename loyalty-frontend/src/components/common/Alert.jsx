import React, { useContext } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { AlertContext } from '../../context/AlertContext';

const Alert = () => {
  const { alert, closeAlert } = useContext(AlertContext);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    closeAlert();
  };

  return (
    <Snackbar
      open={alert.show}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={handleClose}
        severity={alert.severity}
        sx={{ width: '100%' }}
      >
        {alert.message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert;