import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  DSInput,
  DSTextarea,
  DSFormField,
  DSFlexContainer,
  DSSpacer,
  DSContentGrid
} from '@/components/ui/design-system';

// Original Components  
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { gradeLevelOptions } from '@/types/student';
import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import { 
  AssessmentType, 
  assessmentTypeOptions,
  KnowledgeType,
  knowledgeTypeOptions,
  DifficultyLevel,
  difficultyLevelOptions,
  GradeLevel
} from '@/types/assessment';
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
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
      
      // Calculate total max score from items
      const totalItemsScore = data.items.reduce((sum, item) => sum + Number(item.max_score), 0);
      
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
      const assessmentItems = await assessmentService.createAssessmentItems(
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
      
      navigate(`/app/assessments/${assessment.id}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DSCard className="w-full max-w-4xl mx-auto">
      <DSCardHeader>
        <DSCardTitle className="text-2xl font-bold text-gray-900">Create New Assessment</DSCardTitle>
        
        {/* Progress Indicator with primary color */}
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
              
              {/* Basic Info Tab */}
              <TabsContent value="basic-info">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <DSFormField label="Assessment Title" required>
                        <DSInput 
                          placeholder="Enter assessment title" 
                          {...field} 
                          error={!!form.formState.errors.title}
                          helpText={form.formState.errors.title?.message}
                        />
                      </DSFormField>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <DSFormField label="Description">
                        <DSTextarea 
                          placeholder="Enter description" 
                          {...field} 
                          helpText="Optional description of the assessment"
                        />
                      </DSFormField>
                    )}
                  />
                  
                  <DSContentGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <DSFormField label="Subject" required>
                          <DSInput 
                            placeholder="Enter subject (e.g., Math, Reading)" 
                            {...field} 
                            error={!!form.formState.errors.subject}
                            helpText={form.formState.errors.subject?.message}
                          />
                        </DSFormField>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="grade_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Grade Level <span className="text-[#ef4444]">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gradeLevelOptions.map((grade) => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </DSContentGrid>
                  
                  <DSContentGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="assessment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Assessment Type <span className="text-[#ef4444]">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select assessment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assessmentTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="assessment_date"
                      render={({ field }) => (
                        <DSFormField label="Assessment Date">
                          <DSInput 
                            type="date" 
                            {...field} 
                            helpText="When will this assessment be given"
                          />
                        </DSFormField>
                      )}
                    />
                  </DSContentGrid>
                </div>
              </TabsContent>
              
              {/* Assessment Items Tab */}
              <TabsContent value="assessment-items">
                <div className="space-y-8">
                  {fields.map((field, index) => (
                    <DSCard key={field.id}>
                      <DSCardContent>
                        <DSFlexContainer justify="between" align="center" className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Item #{index + 1}</h3>
                          {fields.length > 1 && (
                            <DSButton 
                              type="button" 
                              variant="danger" 
                              size="sm" 
                              onClick={() => remove(index)}
                            >
                              Remove
                            </DSButton>
                          )}
                        </DSFlexContainer>
                        
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name={`items.${index}.question_text`}
                            render={({ field }) => (
                              <DSFormField label="Question/Task" required>
                                <DSTextarea 
                                  placeholder="Enter question or task description" 
                                  {...field} 
                                  error={!!form.formState.errors.items?.[index]?.question_text}
                                  helpText={form.formState.errors.items?.[index]?.question_text?.message}
                                />
                              </DSFormField>
                            )}
                          />
                          
                          <DSContentGrid cols={3}>
                            <FormField
                              control={form.control}
                              name={`items.${index}.knowledge_type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Knowledge Type <span className="text-[#ef4444]">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {knowledgeTypeOptions.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`items.${index}.difficulty_level`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium text-gray-700">
                                    Difficulty <span className="text-[#ef4444]">*</span>
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select difficulty" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {difficultyLevelOptions.map((level) => (
                                        <SelectItem key={level} value={level}>
                                          {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name={`items.${index}.max_score`}
                              render={({ field }) => (
                                <DSFormField label="Points Worth" required>
                                  <DSInput 
                                    type="number" 
                                    min="0" 
                                    step="0.5" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    error={!!form.formState.errors.items?.[index]?.max_score}
                                    helpText={form.formState.errors.items?.[index]?.max_score?.message}
                                  />
                                </DSFormField>
                              )}
                            />
                          </DSContentGrid>
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.standard_reference`}
                            render={({ field }) => (
                              <DSFormField label="Standard Reference">
                                <DSInput 
                                  placeholder="e.g., CCSS.MATH.CONTENT.3.OA.A.1" 
                                  {...field} 
                                  helpText="Optional curriculum standard reference"
                                />
                              </DSFormField>
                            )}
                          />
                        </div>
                      </DSCardContent>
                    </DSCard>
                  ))}
                  
                  <DSButton
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => append({
                      question_text: '',
                      knowledge_type: 'conceptual',
                      difficulty_level: 'medium',
                      max_score: 10,
                      standard_reference: '',
                    })}
                  >
                    + Add Another Item
                  </DSButton>
                </div>
              </TabsContent>
              
              {/* Scoring Setup Tab */}
              <TabsContent value="scoring-setup">
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="max_score"
                    render={({ field }) => (
                      <DSFormField label="Maximum Assessment Score" required>
                        <DSInput 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          error={!!form.formState.errors.max_score}
                          helpText={form.formState.errors.max_score?.message || "Total points possible for this assessment"}
                        />
                      </DSFormField>
                    )}
                  />
                  
                  <DSCard className="bg-gray-50">
                    <DSCardContent>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Point Summary</h3>
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <DSFlexContainer key={index} justify="between">
                            <span className="text-sm text-gray-600">Item #{index + 1}:</span>
                            <span className="text-sm font-medium">{form.watch(`items.${index}.max_score`)} points</span>
                          </DSFlexContainer>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <DSFlexContainer justify="between">
                        <span className="font-medium">Total Item Points:</span>
                        <span className="font-bold text-lg">
                          {form.watch('items').reduce((sum, item) => sum + Number(item.max_score), 0)}
                        </span>
                      </DSFlexContainer>
                    </DSCardContent>
                  </DSCard>
                </div>
              </TabsContent>
              
              {/* Review Tab */}
              <TabsContent value="review">
                <div className="space-y-8">
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle>Basic Information</DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent>
                      <DSContentGrid cols={2}>
                        <div>
                          <span className="text-sm text-gray-600">Title:</span>
                          <p className="font-medium">{form.watch('title')}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Subject:</span>
                          <p className="font-medium">{form.watch('subject')}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Grade Level:</span>
                          <p className="font-medium">{form.watch('grade_level')}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Type:</span>
                          <p className="font-medium">{form.watch('assessment_type')}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Date:</span>
                          <p className="font-medium">{form.watch('assessment_date')}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Max Score:</span>
                          <p className="font-medium">{form.watch('max_score')}</p>
                        </div>
                      </DSContentGrid>
                      {form.watch('description') && (
                        <div className="mt-4">
                          <span className="text-sm text-gray-600">Description:</span>
                          <p className="mt-1">{form.watch('description')}</p>
                        </div>
                      )}
                    </DSCardContent>
                  </DSCard>
                  
                  <DSCard>
                    <DSCardHeader>
                      <DSCardTitle>Assessment Items ({form.watch('items').length})</DSCardTitle>
                    </DSCardHeader>
                    <DSCardContent>
                      <div className="space-y-4">
                        {form.watch('items').map((item, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                            <DSFlexContainer justify="between" align="start" className="mb-2">
                              <span className="font-medium">Item #{index + 1}</span>
                              <span className="text-sm font-medium text-[#2563eb]">{item.max_score} points</span>
                            </DSFlexContainer>
                            <p className="text-sm mb-2">{item.question_text}</p>
                            <DSFlexContainer gap="md">
                              <span className="text-xs text-gray-500">Type: {item.knowledge_type}</span>
                              <span className="text-xs text-gray-500">Difficulty: {item.difficulty_level}</span>
                            </DSFlexContainer>
                          </div>
                        ))}
                      </div>
                    </DSCardContent>
                  </DSCard>
                </div>
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
