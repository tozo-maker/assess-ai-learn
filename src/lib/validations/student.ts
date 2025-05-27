
import * as z from "zod";
import { gradeLevelOptions } from "@/types/student";

export const studentFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  student_id: z.string().optional(),
  grade_level: z.enum(gradeLevelOptions as [string, ...string[]]),
  learning_goals: z.string().optional(),
  special_considerations: z.string().optional(),
  parent_name: z.string().optional(),
  parent_email: z.string().email("Invalid email format").optional().or(z.literal("")),
  parent_phone: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

// Email validation utility
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// CSV import validation schema
export const csvStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  student_id: z.string().optional(),
  grade_level: z.string().optional(),
  learning_goals: z.string().optional(),
  special_considerations: z.string().optional(),
  parent_name: z.string().optional(),
  parent_email: z.string().optional(),
  parent_phone: z.string().optional(),
});

export type CSVStudentData = z.infer<typeof csvStudentSchema>;
