
import React from 'react';
import EnhancedBreadcrumbs from './EnhancedBreadcrumbs';

// Wrapper to maintain backward compatibility
const Breadcrumbs: React.FC = () => {
  return <EnhancedBreadcrumbs />;
};

export default Breadcrumbs;
