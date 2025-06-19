
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { skillService } from '@/services/skill-service';

export interface Skill {
  id: string;
  name: string;
  description?: string;
  grade_level: string;
  subject: string;
  difficulty_level: number;
  curriculum_standard?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillFilters {
  search: string;
  grade_level: string;
  subject: string;
  difficulty_level: string;
}

export const useSkillsData = () => {
  const [filters, setFilters] = useState<SkillFilters>({
    search: '',
    grade_level: '',
    subject: '',
    difficulty_level: ''
  });

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillService.getSkills,
  });

  const filteredSkills = useMemo(() => {
    let filtered = skills;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm) ||
        (skill.description && skill.description.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.grade_level) {
      filtered = filtered.filter(skill => skill.grade_level === filters.grade_level);
    }

    if (filters.subject) {
      filtered = filtered.filter(skill => skill.subject === filters.subject);
    }

    if (filters.difficulty_level) {
      filtered = filtered.filter(skill => skill.difficulty_level.toString() === filters.difficulty_level);
    }

    return filtered;
  }, [skills, filters]);

  return {
    skills,
    filteredSkills,
    isLoading,
    filters,
    setFilters
  };
};
