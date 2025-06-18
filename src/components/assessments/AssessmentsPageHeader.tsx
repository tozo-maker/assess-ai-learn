
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const AssessmentsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Assessments
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Manage and analyze student assessments to track learning progress and identify opportunities for improvement.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/app/assessments/batch')}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              Batch Import
            </Button>
            <Button 
              onClick={() => navigate('/app/assessments/add')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsPageHeader;
