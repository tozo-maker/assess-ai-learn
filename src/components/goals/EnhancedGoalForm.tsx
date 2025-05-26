
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { GoalFormData } from '@/types/goals';
import GoalCategories from './GoalCategories';
import GoalTemplates, { GoalTemplate } from './GoalTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  target_date: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
  category: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  tags: z.string().optional()
});

type EnhancedGoalFormData = GoalFormData & {
  category?: string;
  priority?: 'High' | 'Medium' | 'Low';
  tags?: string;
};

interface EnhancedGoalFormProps {
  onSubmit: (data: EnhancedGoalFormData) => void;
  initialData?: Partial<EnhancedGoalFormData>;
  isLoading?: boolean;
  showTemplates?: boolean;
}

const EnhancedGoalForm: React.FC<EnhancedGoalFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading,
  showTemplates = true 
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.category ? [initialData.category] : []
  );

  const form = useForm<EnhancedGoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      target_date: initialData?.target_date || '',
      status: initialData?.status || 'active',
      progress_percentage: initialData?.progress_percentage || 0,
      category: initialData?.category || '',
      priority: initialData?.priority || 'Medium',
      tags: initialData?.tags || ''
    }
  });

  const handleTemplateSelect = (template: GoalTemplate) => {
    form.setValue('title', template.title);
    form.setValue('description', template.description);
    form.setValue('priority', template.priority);
    form.setValue('category', template.category);
    setSelectedCategories([template.category]);
    
    // Set target date based on estimated duration
    const weeks = parseInt(template.estimatedDuration.split('-')[1]) || 8;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeks * 7));
    form.setValue('target_date', targetDate.toISOString().split('T')[0]);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    form.setValue('category', categories[0] || '');
  };

  const handleFormSubmit = (data: EnhancedGoalFormData) => {
    const submitData = {
      ...data,
      category: selectedCategories[0] || '',
    };
    onSubmit(submitData);
  };

  return (
    <div className="space-y-6">
      {showTemplates && (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Create Manually</TabsTrigger>
            <TabsTrigger value="template">
              <Lightbulb className="h-4 w-4 mr-2" />
              Use Template
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="mt-4">
            <GoalTemplates 
              onSelectTemplate={handleTemplateSelect}
              selectedCategory={selectedCategories[0]}
            />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter goal title" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the goal and what success looks like" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                <GoalCategories
                  selectedCategories={selectedCategories}
                  onCategoryChange={handleCategoryChange}
                  mode="select"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High">High Priority</SelectItem>
                            <SelectItem value="Medium">Medium Priority</SelectItem>
                            <SelectItem value="Low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(new Date(field.value), 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter tags separated by commas" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Goal'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedGoalForm;
