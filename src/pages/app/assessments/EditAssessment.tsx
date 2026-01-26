import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    enabled: !!id
  });

  // Fetch assessment items
  const { data: assessmentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['assessment-items', id],
    queryFn: () => assessmentService.getAssessmentItems(id as string),
    enabled: !!id
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
        item_order: item.item_order,
        knowledge_type: item.knowledge_type,
        difficulty_level: item.difficulty_level,
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

  const handleInputChange = (field: keyof AssessmentFormData, value: unknown) => {
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
      item_order: items.length + 1,
      knowledge_type: 'factual',
      difficulty_level: 'medium',
      max_score: 1
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof AssessmentItemFormData, value: unknown) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateAssessmentMutation.mutate(formData);
  };

  if (isLoadingAssessment || isLoadingItems) {
    return (
      <PageShell 
        title="Edit Assessment" 
        description="Loading assessment..."
      >
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Edit Assessment" 
      description="Update assessment details and questions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Information</CardTitle>
            <CardDescription>Basic details about the assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Assessment title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., Mathematics, English"
                  required
                />
              </div>

              <div>
                <Label>Grade Level</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value: GradeLevel) => handleInputChange('grade_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assessment Type</Label>
                <Select
                  value={formData.assessment_type}
                  onValueChange={(value: AssessmentType) => handleInputChange('assessment_type', value)}
                >
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
                <Label htmlFor="max_score">Maximum Score</Label>
                <Input
                  id="max_score"
                  type="number"
                  min="1"
                  value={formData.max_score}
                  onChange={(e) => handleInputChange('max_score', parseInt(e.target.value) || 100)}
                />
              </div>

              <div>
                <Label htmlFor="assessment_date">Assessment Date</Label>
                <Input
                  id="assessment_date"
                  type="date"
                  value={formData.assessment_date}
                  onChange={(e) => handleInputChange('assessment_date', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the assessment objectives and content"
                rows={3}
              />
            </div>

            <div>
              <Label>Standards Covered</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={standardInput}
                  onChange={(e) => setStandardInput(e.target.value)}
                  placeholder="Add a standard"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addStandard();
                    }
                  }}
                />
                <Button type="button" onClick={addStandard}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.standards_covered?.map((standard, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeStandard(standard)}>
                    {standard} ×
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assessment Items</CardTitle>
              <CardDescription>Questions and tasks for this assessment</CardDescription>
            </div>
            <Button type="button" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Question {(item.item_order || index + 1)}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Knowledge Type</Label>
                    <Select
                      value={item.knowledge_type || 'factual'}
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
                      value={item.difficulty_level || 'medium'}
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
                      value={item.max_score || 1}
                      onChange={(e) => updateItem(index, 'max_score', parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No items added yet. Click "Add Item" to add questions.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateAssessmentMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateAssessmentMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </PageShell>
  );
};

export default EditAssessment;
