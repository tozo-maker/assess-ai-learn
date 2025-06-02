
import React from 'react';
import EnhancedGlobalSearch from './EnhancedGlobalSearch';

// Wrapper to maintain backward compatibility
const GlobalSearch: React.FC = () => {
  return <EnhancedGlobalSearch />;
};

export default GlobalSearch;
