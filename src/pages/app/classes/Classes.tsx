import React, { useState } from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Plus, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClassData {
  id: string;
  name: string;
  display_name: string;
  subject: string;
  grade_level: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  student_count?: number;
}

const Classes: React.FC = () => {
  const { toast } = useToast();
  const [selectedClasses, setSelectedClasses] = useState<ClassData[]>([]);

  // Fetch classes data
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          students(count)
        `)
        .eq('teacher_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include student count
      return data.map(classItem => ({
        ...classItem,
        student_count: classItem.students?.[0]?.count || 0
      }));
    },
  });

  // Calculate statistics
  const stats = {
    totalClasses: classes.length,
    activeClasses: classes.filter(c => c.is_active).length,
    totalStudents: classes.reduce((sum, c) => sum + (c.student_count || 0), 0),
    subjects: new Set(classes.map(c => c.subject)).size
  };

  const columns: Column<ClassData>[] = [
    {
      key: 'display_name',
      title: 'Class Name',
      sortable: true,
      render: (value, row) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.name}</div>
        </div>
      )
    },
    {
      key: 'subject',
      title: 'Subject',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'grade_level',
      title: 'Grade Level',
      sortable: true,
      render: (value) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'student_count',
      title: 'Students',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'is_active',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const handleCreateClass = () => {
    toast({
      title: "Create Class",
      description: "Class creation feature coming soon!",
    });
  };

  const handleViewClass = (classItem: ClassData) => {
    toast({
      title: "View Class",
      description: `Viewing ${classItem.display_name}`,
    });
  };

  const actions = (
    <Button onClick={handleCreateClass} className="gap-2">
      <Plus className="h-4 w-4" />
      Create Class
    </Button>
  );

  return (
    <StandardPageLayout
      title="Classes"
      description="Manage your classes and track student enrollment"
      actions={actions}
      breadcrumbs={[
        { label: 'Classes' }
      ]}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            description="All your classes"
            icon={BookOpen}
          />
          <StatCard
            title="Active Classes"
            value={stats.activeClasses}
            description="Currently running"
            icon={Calendar}
            badge={{ text: "Active", variant: "default" }}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            description="Across all classes"
            icon={Users}
          />
          <StatCard
            title="Subjects"
            value={stats.subjects}
            description="Different subjects"
            icon={GraduationCap}
          />
        </div>

        {/* Classes Table */}
        <div className="bg-background">
          {classes.length === 0 && !isLoading ? (
            <EmptyState
              icon={BookOpen}
              title="No Classes Yet"
              description="Create your first class to start organizing your students and curriculum."
              action={{
                label: "Create First Class",
                onClick: handleCreateClass
              }}
            />
          ) : (
            <DataTable
              data={classes}
              columns={columns}
              loading={isLoading}
              searchable={true}
              filterable={true}
              exportable={true}
              selectable={true}
              selectedRows={selectedClasses}
              onSelectRows={setSelectedClasses}
              onRowClick={handleViewClass}
              emptyState={
                <EmptyState
                  icon={BookOpen}
                  title="No Classes Found"
                  description="Try adjusting your search or filter criteria."
                />
              }
            />
          )}
        </div>

        {/* Bulk Actions */}
        {selectedClasses.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More Actions
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
};

export default Classes;