
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PageShell } from '@/components/ui/page-shell';
import { assessmentService } from '@/services/assessment-service';
import { AssessmentFormData, GradeLevel, AssessmentType, KnowledgeType, DifficultyLevel, AssessmentItemFormData } from '@/types/assessment';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

const gradeLevels: GradeLevel[] = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const assessmentTypes: AssessmentType[] = ['quiz', 'test', 'project', 'homework', 'classwork', 'other'];
const knowledgeTypes: KnowledgeType[] = ['factual', 'conceptual', 'procedural', 'metacognitive'];
const difficultyLevels: DifficultyLevel[] = ['easy', 'medium', 'hard'];

const EditAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    subject: '',
    grade_level: 'K',
    assessment_type: 'quiz',
    standards_covered: [],
    max_score: 100,
    assessment_date: '',
    is_draft: false,
    teacher_id: ''
  });

  const [items, setItems] = useState<AssessmentItemFormData[]>([]);
  const [standardInput, setStandardInput] = useState('');

  // Fetch assessment data
  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getAssessmentById(id as string),
    enabled: !!id,
  });

  // Fetch assessment items
  const { data: assessmentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['assessmentItems', id],
    queryFn: () => assessmentService.getAssessmentItems(id as string),
    enabled: !!id,
  });

  // Update form data when assessment loads
  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title,
        description: assessment.description || '',
        subject: assessment.subject,
        grade_level: assessment.grade_level,
        assessment_type: assessment.assessment_type,
        standards_covered: assessment.standards_covered || [],
        max_score: assessment.max_score,
        assessment_date: assessment.assessment_date || '',
        is_draft: assessment.is_draft || false,
        teacher_id: assessment.teacher_id
      });
    }
  }, [assessment]);

  // Update items when assessment items load
  useEffect(() => {
    if (assessmentItems) {
      const formattedItems = assessmentItems.map(item => ({
        question_text: item.question_text,
        item_number: item.item_number,
        knowledge_type: item.knowledge_type,
        difficulty_level: item.difficulty_level,
        standard_reference: item.standard_reference || '',
        max_score: item.max_score
      }));
      setItems(formattedItems);
    }
  }, [assessmentItems]);

  // Update assessment mutation
  const updateAssessmentMutation = useMutation({
    mutationFn: (data: Partial<AssessmentFormData>) => 
      assessmentService.updateAssessment(id as string, data),
    onSuccess: () => {
      toast({
        title: 'Assessment Updated',
        description: 'Assessment has been successfully updated.'
      });
      queryClient.invalidateQueries({ queryKey: ['assessment', id] });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      navigate(`/app/assessments/${id}`);
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleInputChange = (field: keyof AssessmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStandard = () => {
    if (standardInput.trim() && !formData.standards_covered?.includes(standardInput.trim())) {
      const newStandards = [...(formData.standards_covered || []), standardInput.trim()];
      handleInputChange('standards_covered', newStandards);
      setStandardInput('');
    }
  };

  const removeStandard = (standard: string) => {
    const newStandards = formData.standards_covered?.filter(s => s !== standard) || [];
    handleInputChange('standards_covered', newStandards);
  };

  const addItem = () => {
    const newItem: AssessmentItemFormData = {
      question_text: '',
      item_number: items.length + 1,
      knowledge_type: 'factual',
      difficulty_level: 'medium',
      standard_reference: '',
      max_score: 1
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof AssessmentItemFormData, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Renumber items
    const renumberedItems = newItems.map((item, i) => ({ ...item, item_number: i + 1 }));
    setItems(renumberedItems);
  };

  const calculateTotalScore = () => {
    return items.reduce((total, item) => total + item.max_score, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Assessment title is required.',
        variant: 'destructive'
      });
      return;
    }

    const totalScore = calculateTotalScore();
    const updatedFormData = { ...formData, max_score: totalScore };
    
    updateAssessmentMutation.mutate(updatedFormData);
  };

  if (isLoadingAssessment || isLoadingItems) {
    return (
      <PageShell
        title="Loading..."
        description="Loading assessment data"
        link="/app/assessments"
        linkText="Back to Assessments"
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageShell>
    );
  }

  if (!assessment) {
    return (
      <PageShell
        title="Assessment Not Found"
        description="The requested assessment could not be found"
        link="/app/assessments"
        linkText="Back to Assessments"
      >
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Assessment not found</h3>
          <p className="text-gray-500">The assessment you're looking for doesn't exist or has been deleted.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit Assessment"
      description="Modify assessment details and questions"
      link="/app/assessments"
      linkText="Back to Assessments"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(`/app/assessments/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Information</CardTitle>
              <CardDescription>Basic details about the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Assessment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assessment title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="e.g., Mathematics, Science"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the assessment"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select value={formData.grade_level} onValueChange={(value: GradeLevel) => handleInputChange('grade_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                  <Select value={formData.assessment_type} onValueChange={(value: AssessmentType) => handleInputChange('assessment_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assessmentDate">Assessment Date</Label>
                  <Input
                    id="assessmentDate"
                    type="date"
                    value={formData.assessment_date}
                    onChange={(e) => handleInputChange('assessment_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDraft"
                  checked={formData.is_draft}
                  onCheckedChange={(checked) => handleInputChange('is_draft', checked)}
                />
                <Label htmlFor="isDraft">Save as draft</Label>
              </div>
            </CardContent>
          </Card>

          {/* Standards */}
          <Card>
            <CardHeader>
              <CardTitle>Standards Covered</CardTitle>
              <CardDescription>Educational standards this assessment addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={standardInput}
                  onChange={(e) => setStandardInput(e.target.value)}
                  placeholder="e.g., CCSS.MATH.3.OA.A.1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStandard())}
                />
                <Button type="button" onClick={addStandard} variant="outline">
                  Add
                </Button>
              </div>
              
              {formData.standards_covered && formData.standards_covered.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.standards_covered.map((standard) => (
                    <Badge key={standard} variant="secondary" className="flex items-center gap-1">
                      {standard}
                      <button
                        type="button"
                        onClick={() => removeStandard(standard)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assessment Items</CardTitle>
                  <CardDescription>Questions and scoring for this assessment</CardDescription>
                </div>
                <div className="text-sm text-gray-600">
                  Total Score: {calculateTotalScore()} points
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Question {item.item_number}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <Label>Question Text *</Label>
                    <Textarea
                      value={item.question_text}
                      onChange={(e) => updateItem(index, 'question_text', e.target.value)}
                      placeholder="Enter the question or task description"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Knowledge Type</Label>
                      <Select
                        value={item.knowledge_type}
                        onValueChange={(value: KnowledgeType) => updateItem(index, 'knowledge_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {knowledgeTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={item.difficulty_level}
                        onValueChange={(value: DifficultyLevel) => updateItem(index, 'difficulty_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.max_score}
                        onChange={(e) => updateItem(index, 'max_score', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label>Standard (Optional)</Label>
                      <Input
                        value={item.standard_reference}
                        onChange={(e) => updateItem(index, 'standard_reference', e.target.value)}
                        placeholder="Standard reference"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" onClick={addItem} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/app/assessments/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateAssessmentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateAssessmentMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Assessment
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default EditAssessment;
