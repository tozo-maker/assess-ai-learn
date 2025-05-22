
import * as z from "zod";
import { gradeLevelOptions } from "@/types/student";

export const studentFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  student_id: z.string().optional(),
  grade_level: z.enum(gradeLevelOptions as [string, ...string[]]),
  learning_goals: z.string().optional(),
  special_considerations: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
