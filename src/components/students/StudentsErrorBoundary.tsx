
import React from 'react';
import EnhancedErrorBoundary from '@/components/dashboard/EnhancedErrorBoundary';

interface StudentsErrorBoundaryProps {
  children: React.ReactNode;
}

const StudentsErrorBoundary: React.FC<StudentsErrorBoundaryProps> = ({ children }) => {
  return (
    <EnhancedErrorBoundary
      componentName="Students"
      fallback={({ error, retry, reset }) => (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Students Section Error</h2>
          <p className="text-gray-600 mb-6">
            There was an error loading the students section. This might be due to a data loading issue.
          </p>
          <div className="space-x-4">
            <button 
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button 
              onClick={reset}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </EnhancedErrorBoundary>
  );
};

export default StudentsErrorBoundary;
