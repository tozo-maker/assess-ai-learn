
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, FileText } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

interface AssessmentsPageHeaderProps {
  totalAssessments: number;
  filteredCount: number;
}

const AssessmentsPageHeader: React.FC<AssessmentsPageHeaderProps> = ({
  totalAssessments,
  filteredCount
}) => {
  const navigate = useNavigate();

  const handleAddAssessment = () => {
    navigate('/app/assessments/add');
  };

  const handleBulkImport = () => {
    navigate('/app/assessments/batch');
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 rounded-none border-x-0 border-t-0">
      <CardHeader className="p-8">
        <Breadcrumbs />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Assessments
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Manage and analyze student assessments to track learning progress and identify opportunities for improvement.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {totalAssessments} total assessments • {filteredCount} currently shown
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleBulkImport}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Batch Import
            </Button>
            <Button 
              onClick={handleAddAssessment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Assessment
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default AssessmentsPageHeader;
