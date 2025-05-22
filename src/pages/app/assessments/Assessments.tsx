
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Plus, Upload } from 'lucide-react';

const Assessments = () => {
  const actions = (
    <>
      <Link to="/assessments/batch">
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Batch Assessment</span>
        </Button>
      </Link>
      <Link to="/assessments/add">
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Assessment</span>
        </Button>
      </Link>
    </>
  );

  return (
    <PageShell 
      title="Assessments" 
      description="Manage and analyze student assessments"
      icon={<FileText className="h-6 w-6 text-blue-600" />}
      actions={actions}
    />
  );
};

export default Assessments;
