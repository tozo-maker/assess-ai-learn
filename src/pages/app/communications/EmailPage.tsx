import React from 'react';
import { Navigate } from 'react-router-dom';

const EmailPage: React.FC = () => {
  // Redirect to EmailCenter since it's the main email functionality
  return <Navigate to="/app/communications" replace />;
};

export default EmailPage;