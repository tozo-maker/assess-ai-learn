
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StudentWithPerformance, gradeLevelOptions } from '@/types/student';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  student_id: z.string().optional(),
  grade_level: z.string().min(1, {
    message: "Please select a grade level.",
  }),
  parent_name: z.string().optional(),
  parent_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal("")),
  parent_phone: z.string().optional(),
  learning_goals: z.string().optional(),
  special_considerations: z.string().optional(),
});

interface EditStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentWithPerformance | null;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

const EditStudentDialog: React.FC<EditStudentDialogProps> = ({
  isOpen,
  onOpenChange,
  student,
  onSubmit
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: student?.first_name || "",
      last_name: student?.last_name || "",
      student_id: student?.student_id || "",
      grade_level: student?.grade_level || "",
      parent_name: student?.parent_name || "",
      parent_email: student?.parent_email || "",
      parent_phone: student?.parent_phone || "",
      learning_goals: student?.learning_goals || "",
      special_considerations: student?.special_considerations || "",
    },
  });

  React.useEffect(() => {
    if (student) {
      form.reset({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        student_id: student.student_id || "",
        grade_level: student.grade_level || "",
        parent_name: student.parent_name || "",
        parent_email: student.parent_email || "",
        parent_phone: student.parent_phone || "",
        learning_goals: student.learning_goals || "",
        special_considerations: student.special_considerations || "",
      });
    }
  }, [student, form]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Student Profile</AlertDialogTitle>
          <AlertDialogDescription>
            Make changes to the student's information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeLevelOptions.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
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
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Student ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Parent/Guardian Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parent_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parent_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent Email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parent_phone"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Parent Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Learning Information */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Learning Information</h3>
              <FormField
                control={form.control}
                name="learning_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Goals</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Learning goals or objectives" 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="special_considerations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Considerations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Special considerations or accommodations" 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit">Update</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditStudentDialog;
