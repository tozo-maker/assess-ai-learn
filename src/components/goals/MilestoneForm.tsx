
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { GoalMilestone } from '@/types/goals';

const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  target_date: z.string().optional()
});

interface MilestoneFormProps {
  onSubmit: (data: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at' | 'completed_at'>) => void;
  onCancel: () => void;
  initialData?: Partial<GoalMilestone>;
  isLoading?: boolean;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading 
}) => {
  const form = useForm({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      target_date: initialData?.target_date || ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Milestone Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter milestone title" {...field} />
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
                  placeholder="Describe what needs to be accomplished" 
                  {...field} 
                />
              </FormControl>
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

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : 'Save Milestone'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MilestoneForm;
