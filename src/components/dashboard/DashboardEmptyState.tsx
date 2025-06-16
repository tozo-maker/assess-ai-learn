
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardWelcomeSection from '@/components/dashboard/DashboardWelcomeSection';
import {
  DSPageContainer,
  DSSpacer
} from '@/components/ui/design-system';

interface DashboardEmptyStateProps {
  teacher: {
    full_name?: string;
    firstName?: string;
  };
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ teacher }) => {
  console.log('DashboardEmptyState render - no students found');

  return (
    <DSPageContainer>
      <DashboardWelcomeSection teacher={teacher} />
      <DSSpacer size="2xl" />
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Welcome to LearnSpark AI
        </h3>
        <p className="text-gray-600 mb-6">
          Start by adding students to your class to see their progress and insights.
        </p>
        <Link 
          to="/app/students/add" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Your First Student
        </Link>
      </div>
    </DSPageContainer>
  );
};

export default DashboardEmptyState;
