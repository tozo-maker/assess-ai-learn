
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AssessmentsPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <BarChart3 className="h-4 w-4" />
                <span>Assessment Management</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Assessments
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed">
              Create, manage, and analyze student assessments to track learning progress and identify opportunities for growth.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:items-end">
            <Button 
              variant="outline" 
              onClick={() => navigate('/app/assessments/batch')}
              className="gap-2 border-gray-300 hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              Batch Import
            </Button>
            <Button 
              onClick={() => navigate('/app/assessments/add')}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsPageHeader;
