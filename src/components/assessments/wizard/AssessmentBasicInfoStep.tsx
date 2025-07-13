/**
 * Assessment Basic Info Step Component
 * First step of the assessment wizard
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AssessmentFormData } from '@/types/comprehensive';

interface AssessmentBasicInfoStepProps {
  data: AssessmentFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof AssessmentFormData>(field: K, value: AssessmentFormData[K]) => void;
  onNext: () => void;
}

const SUBJECTS = [
  'Mathematics', 'English Language Arts', 'Science', 'Social Studies', 
  'Reading', 'Writing', 'History', 'Geography', 'Physics', 'Chemistry', 
  'Biology', 'Art', 'Music', 'Physical Education'
];

const GRADE_LEVELS = [
  'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

const ASSESSMENT_TYPES = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'test', label: 'Test' },
  { value: 'exam', label: 'Exam' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'project', label: 'Project' },
  { value: 'homework', label: 'Homework' }
];

const AssessmentBasicInfoStep: React.FC<AssessmentBasicInfoStepProps> = ({
  data,
  errors,
  onChange,
  onNext
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <p className="text-gray-600 mb-6">
          Enter the basic details for your assessment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="title">Assessment Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Enter assessment title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={data.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Brief description of the assessment"
            rows={3}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Select value={data.subject} onValueChange={(value) => onChange('subject', value)}>
            <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
          )}
        </div>

        <div>
          <Label htmlFor="grade_level">Grade Level *</Label>
          <Select value={data.grade_level} onValueChange={(value) => onChange('grade_level', value)}>
            <SelectTrigger className={errors.grade_level ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select grade level" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.grade_level && (
            <p className="text-red-500 text-sm mt-1">{errors.grade_level}</p>
          )}
        </div>

        <div>
          <Label htmlFor="assessment_type">Assessment Type *</Label>
          <Select value={data.assessment_type} onValueChange={(value) => onChange('assessment_type', value)}>
            <SelectTrigger className={errors.assessment_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ASSESSMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.assessment_type && (
            <p className="text-red-500 text-sm mt-1">{errors.assessment_type}</p>
          )}
        </div>

        <div>
          <Label htmlFor="assessment_date">Assessment Date</Label>
          <Input
            id="assessment_date"
            type="date"
            value={data.assessment_date || ''}
            onChange={(e) => onChange('assessment_date', e.target.value)}
            className={errors.assessment_date ? 'border-red-500' : ''}
          />
          {errors.assessment_date && (
            <p className="text-red-500 text-sm mt-1">{errors.assessment_date}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit">
          Next: Add Questions
        </Button>
      </div>
    </form>
  );
};

export default React.memo(AssessmentBasicInfoStep);