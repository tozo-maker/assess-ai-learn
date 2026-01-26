import { useQuery } from '@tanstack/react-query';
import { skillsService, Skill } from '@/services/skills-service';
import { useState } from 'react';

export interface SkillFilters {
  subject: string;
  gradeLevel: string;
  category: string;
  search: string;
}

// Re-export Skill type
export type { Skill };

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
    queryFn: () => skillsService.getSkills(),
    staleTime: 5 * 60 * 1000,
  });

  // Filter skills based on current filters
  const filteredSkills = skills?.filter(skill => {
    if (filters.subject && skill.subject !== filters.subject) return false;
    if (filters.gradeLevel && !skill.grade_levels?.includes(filters.gradeLevel)) return false;
    if (filters.search && !skill.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return {
    skills: skills || [],
    filteredSkills: filteredSkills || [],
    isLoading,
    error,
    refetch,
    filters,
    setFilters
  };
};
