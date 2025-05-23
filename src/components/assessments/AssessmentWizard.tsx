
import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  difficultyLevelOptions 
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
        grade_level: data.grade_level,
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Assessment</CardTitle>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all" 
            style={{ 
              width: activeTab === 'basic-info' ? '25%' : 
                     activeTab === 'assessment-items' ? '50%' : 
                     activeTab === 'scoring-setup' ? '75%' : '100%' 
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
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
              <TabsContent value="basic-info" className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter assessment title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject (e.g., Math, Reading)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="grade_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="assessment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assessment Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assessment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assessmentTypeOptions.map((type) => (
                              <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
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
                      <FormItem>
                        <FormLabel>Assessment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Assessment Items Tab */}
              <TabsContent value="assessment-items" className="space-y-6">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Item #{index + 1}</h3>
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => remove(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.question_text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question/Task</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter question or task description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.knowledge_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Knowledge Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {knowledgeTypeOptions.map((type) => (
                                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
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
                                <FormLabel>Difficulty</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {difficultyLevelOptions.map((level) => (
                                      <SelectItem key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</SelectItem>
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
                              <FormItem>
                                <FormLabel>Points Worth</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="0.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.standard_reference`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Standard Reference (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., CCSS.MATH.CONTENT.3.OA.A.1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
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
                </Button>
              </TabsContent>
              
              {/* Scoring Setup Tab */}
              <TabsContent value="scoring-setup" className="space-y-4">
                <FormField
                  control={form.control}
                  name="max_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Assessment Score</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium mb-2">Item Point Summary:</h3>
                  <ul className="space-y-1">
                    {fields.map((field, index) => (
                      <li key={index} className="text-sm">
                        Item #{index + 1}: {form.watch(`items.${index}.max_score`)} points
                      </li>
                    ))}
                  </ul>
                  <Separator className="my-3" />
                  <div className="flex justify-between">
                    <span>Total Item Points:</span>
                    <span className="font-semibold">
                      {form.watch('items').reduce((sum, item) => sum + Number(item.max_score), 0)}
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              {/* Review Tab */}
              <TabsContent value="review" className="space-y-6">
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="text-gray-500">Title:</div>
                    <div>{form.watch('title')}</div>
                    
                    <div className="text-gray-500">Subject:</div>
                    <div>{form.watch('subject')}</div>
                    
                    <div className="text-gray-500">Grade Level:</div>
                    <div>{form.watch('grade_level')}</div>
                    
                    <div className="text-gray-500">Type:</div>
                    <div>{form.watch('assessment_type')}</div>
                    
                    <div className="text-gray-500">Date:</div>
                    <div>{form.watch('assessment_date')}</div>
                  </div>
                  {form.watch('description') && (
                    <div className="mt-2">
                      <div className="text-gray-500">Description:</div>
                      <div className="mt-1">{form.watch('description')}</div>
                    </div>
                  )}
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Assessment Items ({form.watch('items').length})</h3>
                  <div className="space-y-3">
                    {form.watch('items').map((item, index) => (
                      <div key={index} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                        <div className="font-medium">Item #{index + 1}: {item.max_score} points</div>
                        <div className="text-sm mt-1">{item.question_text}</div>
                        <div className="grid grid-cols-2 text-xs text-gray-500 mt-1">
                          <div>Type: {item.knowledge_type}</div>
                          <div>Difficulty: {item.difficulty_level}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Scoring</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Assessment Max Score:</div>
                    <div>{form.watch('max_score')}</div>
                    
                    <div className="text-gray-500">Sum of Items Points:</div>
                    <div>{form.watch('items').reduce((sum, item) => sum + Number(item.max_score), 0)}</div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between mt-6">
              {activeTab !== 'basic-info' && (
                <Button type="button" variant="outline" onClick={handlePrevTab}>
                  Back
                </Button>
              )}
              
              {activeTab !== 'review' ? (
                <Button type="button" onClick={handleNextTab} className="ml-auto">
                  Continue
                </Button>
              ) : (
                <Button type="submit" className="ml-auto">
                  Create Assessment
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AssessmentWizard;
