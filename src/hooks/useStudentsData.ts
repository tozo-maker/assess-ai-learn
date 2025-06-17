
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StudentFilterValues } from '@/components/students/filters/StudentFilterTypes';
import { studentService } from '@/services/student-service';

export const useStudentsData = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filters, setFilters] = useState<StudentFilterValues>({
    search: '',
    gradeLevel: '',
    performanceLevel: '',
    needsAttention: null,
    hasParentContact: null
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Filter students based on current filters
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.first_name.toLowerCase().includes(searchTerm) ||
        student.last_name.toLowerCase().includes(searchTerm) ||
        student.grade_level.toLowerCase().includes(searchTerm) ||
        student.student_id?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.gradeLevel) {
      filtered = filtered.filter(student => student.grade_level === filters.gradeLevel);
    }

    if (filters.performanceLevel) {
      filtered = filtered.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return false;
        }
        return student.performance.performance_level === filters.performanceLevel;
      });
    }

    if (filters.needsAttention !== null) {
      filtered = filtered.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return !filters.needsAttention;
        }
        return student.performance.needs_attention === filters.needsAttention;
      });
    }

    if (filters.hasParentContact !== null) {
      filtered = filtered.filter(student => {
        const hasContact = !!(student.parent_email || student.parent_phone);
        return hasContact === filters.hasParentContact;
      });
    }

    return filtered;
  }, [students, filters]);

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  const isAllSelected = selectedStudents.length === filteredStudents.length && filteredStudents.length > 0;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  return {
    students,
    filteredStudents,
    isLoading,
    viewMode,
    setViewMode,
    selectedStudents,
    setSelectedStudents,
    filters,
    setFilters,
    handleSelectStudent,
    handleSelectAll,
    handleClearSelection,
    isAllSelected,
    isIndeterminate
  };
};
