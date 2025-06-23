
import { useQuery } from '@tanstack/react-query';
import { skillsService } from '@/services/skills-service';
import { useState } from 'react';

interface SkillFilters {
  subject: string;
  gradeLevel: string;
  category: string;
  search: string;
}

export const useSkillsData = () => {
  const [filters, setFilters] = useState<SkillFilters>({
    subject: '',
    gradeLevel: '',
    category: '',
    search: ''
  });

  const {
    data: skills,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsService.getSkills,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter skills based on current filters
  const filteredSkills = skills?.filter(skill => {
    if (filters.subject && skill.subject !== filters.subject) return false;
    if (filters.gradeLevel && skill.grade_level !== filters.gradeLevel) return false;
    if (filters.search && !skill.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return {
    skills,
    filteredSkills,
    isLoading,
    error,
    refetch,
    filters,
    setFilters
  };
};
