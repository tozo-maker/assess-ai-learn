
import React from 'react';
import StudentsErrorBoundary from '@/components/students/StudentsErrorBoundary';
import { useStudents } from '@/hooks/queries/useOptimizedQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Students: React.FC = () => {
  const { data: students = [], isLoading, error } = useStudents();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    throw error; // Let error boundary handle it
  }

  return (
    <StudentsErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Students</h1>
            <span className="text-gray-500">({students.length})</span>
          </div>
          <Link to="/app/students/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>

        {/* Students Grid */}
        {students.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first student to begin tracking their progress.
              </p>
              <Link to="/app/students/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Student
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Link key={student.id} to={`/app/students/${student.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{student.first_name} {student.last_name}</span>
                      <span className="text-sm font-normal text-gray-500">
                        {student.grade_level}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {student.learning_style && (
                        <p className="text-sm text-gray-600">
                          Learning Style: {student.learning_style}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Added {new Date(student.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StudentsErrorBoundary>
  );
};

export default Students;
