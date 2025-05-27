
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkillCategory, skillsService } from '@/services/skills-service';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Please select a category'),
  grade_level: z.string().min(1, 'Please select a grade level'),
  subject: z.string().min(1, 'Please select a subject'),
  curriculum_standard: z.string().optional(),
  difficulty_level: z.number().min(1).max(5),
});

interface CreateSkillDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SkillCategory[];
  onSuccess: () => void;
}

const CreateSkillDialog: React.FC<CreateSkillDialogProps> = ({
  isOpen,
  onOpenChange,
  categories,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      grade_level: '',
      subject: '',
      curriculum_standard: '',
      difficulty_level: 3,
    },
  });

  const subjects = ['Mathematics', 'English Language Arts', 'Science', 'Social Studies'];
  const gradeLevels = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th'];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Ensure all required fields are present
      const skillData = {
        name: values.name,
        description: values.description || '',
        category_id: values.category_id,
        grade_level: values.grade_level,
        subject: values.subject,
        curriculum_standard: values.curriculum_standard || '',
        difficulty_level: values.difficulty_level,
      };
      
      await skillsService.createSkill(skillData);
      toast({
        title: "Success",
        description: "Skill created successfully.",
      });
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Skill</DialogTitle>
          <DialogDescription>
            Add a new skill to your curriculum library
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Addition Facts 0-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Beginner</SelectItem>
                        <SelectItem value="2">2 - Easy</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - Hard</SelectItem>
                        <SelectItem value="5">5 - Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this skill involves..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
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
                name="grade_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeLevels.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            Grade {grade}
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="curriculum_standard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curriculum Standard (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1.OA.C.6" {...field} />
                  </FormControl>
                  <FormDescription>
                    Common Core or other curriculum alignment reference
                  </FormDescription>
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
              <Button type="submit">Create Skill</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSkillDialog;
