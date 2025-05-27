
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { skillsService } from '@/services/skills-service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  grade_levels: z.array(z.string()).min(1, 'Please select at least one grade level'),
});

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      subject: '',
      grade_levels: [],
    },
  });

  const subjects = ['Mathematics', 'English Language Arts', 'Science', 'Social Studies'];
  const gradeLevels = [
    { id: 'K', label: 'Kindergarten' },
    { id: '1st', label: '1st Grade' },
    { id: '2nd', label: '2nd Grade' },
    { id: '3rd', label: '3rd Grade' },
    { id: '4th', label: '4th Grade' },
    { id: '5th', label: '5th Grade' },
    { id: '6th', label: '6th Grade' },
  ];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Ensure all required fields are present
      const categoryData = {
        name: values.name,
        description: values.description || '',
        subject: values.subject,
        grade_levels: values.grade_levels,
      };
      
      await skillsService.createSkillCategory(categoryData);
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your skills
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Number Operations" {...field} />
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
                    <Textarea
                      placeholder="Describe what skills this category includes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
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
              name="grade_levels"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Grade Levels</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {gradeLevels.map((grade) => (
                      <FormField
                        key={grade.id}
                        control={form.control}
                        name="grade_levels"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={grade.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(grade.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, grade.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== grade.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {grade.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Category</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
