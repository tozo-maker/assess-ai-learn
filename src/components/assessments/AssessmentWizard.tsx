
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

// Design System Components
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSSpacer
} from '@/components/ui/design-system';

// Form Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';

// Wizard Form Components
import BasicInfoForm from './wizard/BasicInfoForm';
import AssessmentItemsForm from './wizard/AssessmentItemsForm';
import ScoringSetupForm from './wizard/ScoringSetupForm';
import ReviewForm from './wizard/ReviewForm';
import AssessmentSubmissionWorkflow from './AssessmentSubmissionWorkflow';

import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import { GradeLevel, AssessmentType, KnowledgeType, DifficultyLevel } from '@/types/assessment';
import { supabase } from '@/integrations/supabase/client';

// Validation schemas
const basicInfoSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  subject: z.string().min(1, { message: 'Subject is required' }),
  grade_level: z.string().min(1, { message: 'Grade level is required' }),
  assessment_type: z.string().min(1, { message: 'Assessment type is required' }),
  standards_covered: z.array(z.string()).optional(),
  assessment_date: z.string().optional(),
  is_draft: z.boolean().optional(),
});

const assessmentItemSchema = z.object({
  question_text: z.string().min(1, { message: 'Question text is required' }),
  knowledge_type: z.string().min(1, { message: 'Knowledge type is required' }),
  difficulty_level: z.string().min(1, { message: 'Difficulty level is required' }),
  max_score: z.number().min(0.1, { message: 'Max score must be greater than 0' }),
  standard_reference: z.string().optional(),
});

const assessmentItemsSchema = z.object({
  items: z.array(assessmentItemSchema).min(1, { message: 'At least one assessment item is required' }),
});

const scoringSetupSchema = z.object({
  max_score: z.number().min(1, { message: 'Max score must be at least 1' }),
});

type AssessmentWizardValues = z.infer<typeof basicInfoSchema> & z.infer<typeof assessmentItemsSchema> & z.infer<typeof scoringSetupSchema>;

const AssessmentWizard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('basic-info');
  const [showSubmissionWorkflow, setShowSubmissionWorkflow] = useState(false);
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AssessmentWizardValues>({
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      grade_level: '',
      assessment_type: 'quiz',
      standards_covered: [],
      assessment_date: new Date().toISOString().split('T')[0],
      is_draft: false,
      max_score: 100,
      items: [
        {
          question_text: '',
          knowledge_type: 'conceptual',
          difficulty_level: 'medium',
          max_score: 10,
          standard_reference: '',
        },
      ],
    },
    resolver: zodResolver(
      z.object({
        ...basicInfoSchema.shape,
        ...assessmentItemsSchema.shape,
        ...scoringSetupSchema.shape,
      })
    ),
  });

  const getProgressPercentage = () => {
    switch (activeTab) {
      case 'basic-info': return 25;
      case 'assessment-items': return 50;
      case 'scoring-setup': return 75;
      case 'review': return 100;
      default: return 0;
    }
  };

  const handleNextTab = async () => {
    if (activeTab === 'basic-info') {
      const basicInfoResult = await form.trigger([
        'title', 'subject', 'grade_level', 'assessment_type'
      ], { shouldFocus: true });
      
      if (basicInfoResult) {
        setActiveTab('assessment-items');
      }
    } else if (activeTab === 'assessment-items') {
      const itemsResult = await form.trigger('items', { shouldFocus: true });
      
      if (itemsResult) {
        setActiveTab('scoring-setup');
      }
    } else if (activeTab === 'scoring-setup') {
      const scoringResult = await form.trigger(['max_score'], { shouldFocus: true });
      
      if (scoringResult) {
        setActiveTab('review');
      }
    }
  };

  const handlePrevTab = () => {
    if (activeTab === 'assessment-items') {
      setActiveTab('basic-info');
    } else if (activeTab === 'scoring-setup') {
      setActiveTab('assessment-items');
    } else if (activeTab === 'review') {
      setActiveTab('scoring-setup');
    }
  };

  // Fetch students when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('students')
          .select('id, first_name, last_name, grade_level')
          .eq('teacher_id', user.id)
          .order('last_name', { ascending: true });

        if (error) throw error;
        setAvailableStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const onSubmit = async (data: AssessmentWizardValues) => {
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create an assessment",
          variant: "destructive",
        });
        return;
      }
      
      // Create the assessment first
      const assessment = await assessmentService.createAssessment({
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade_level: data.grade_level as GradeLevel,
        assessment_type: data.assessment_type as AssessmentType,
        standards_covered: data.standards_covered,
        max_score: data.max_score,
        assessment_date: data.assessment_date,
        is_draft: data.is_draft,
        teacher_id: authData.user.id,
      });
      
      // Then create the assessment items
      await assessmentService.createAssessmentItems(
        data.items.map((item, index) => ({
          assessment_id: assessment.id,
          item_number: index + 1,
          question_text: item.question_text,
          knowledge_type: item.knowledge_type as KnowledgeType,
          difficulty_level: item.difficulty_level as DifficultyLevel,
          max_score: Number(item.max_score),
          standard_reference: item.standard_reference,
        })),
        assessment.id
      );
      
      toast({
        title: "Assessment created",
        description: "Your assessment has been created successfully",
      });
      
      // Store assessment ID and show submission workflow
      setCreatedAssessmentId(assessment.id);
      setShowSubmissionWorkflow(true);
      
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWorkflowComplete = () => {
    if (createdAssessmentId) {
      navigate(`/app/assessments/${createdAssessmentId}/insights`);
    }
  };

  // Show submission workflow after assessment creation
  if (showSubmissionWorkflow && createdAssessmentId) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <AssessmentSubmissionWorkflow
          assessmentId={createdAssessmentId}
          assessmentTitle={form.watch('title')}
          students={availableStudents}
          onComplete={handleWorkflowComplete}
        />
      </div>
    );
  }

  return (
    <DSCard className="w-full max-w-4xl mx-auto">
      <DSCardHeader>
        <DSCardTitle className="text-2xl font-bold text-gray-900">Create New Assessment</DSCardTitle>
        
        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="w-full bg-gray-300 h-2 rounded-full">
            <div 
              className="bg-[#2563eb] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['Basic Info', 'Items', 'Scoring', 'Review'].map((label, index) => (
              <span 
                key={label}
                className={`text-sm font-medium transition-colors duration-200 ${
                  getProgressPercentage() > index * 25 ? 'text-[#2563eb]' : 'text-gray-300'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </DSCardHeader>
      
      <DSCardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="assessment-items">Items</TabsTrigger>
                <TabsTrigger value="scoring-setup">Scoring</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic-info">
                <BasicInfoForm form={form} />
              </TabsContent>
              
              <TabsContent value="assessment-items">
                <AssessmentItemsForm form={form} />
              </TabsContent>
              
              <TabsContent value="scoring-setup">
                <ScoringSetupForm form={form} />
              </TabsContent>
              
              <TabsContent value="review">
                <ReviewForm form={form} />
              </TabsContent>
            </Tabs>
            
            <DSSpacer size="xl" />
            
            {/* Navigation Buttons */}
            <DSFlexContainer justify="between">
              {activeTab !== 'basic-info' && (
                <DSButton type="button" variant="ghost" onClick={handlePrevTab}>
                  Previous
                </DSButton>
              )}
              
              {activeTab !== 'review' ? (
                <DSButton type="button" variant="primary" onClick={handleNextTab} className="ml-auto">
                  Next
                </DSButton>
              ) : (
                <DSButton type="submit" variant="primary" className="ml-auto">
                  Create Assessment
                </DSButton>
              )}
            </DSFlexContainer>
          </form>
        </Form>
      </DSCardContent>
    </DSCard>
  );
};

export default AssessmentWizard;
