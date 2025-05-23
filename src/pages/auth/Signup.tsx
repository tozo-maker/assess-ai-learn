
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import PublicLayout from '@/components/layout/PublicLayout';
import { User, Mail, Lock, School } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { SignUpData } from '@/types/auth';

const signupSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  school: z.string().min(1, 'School/Organization is required'),
  grade_levels: z.array(z.string()).min(1, 'Please select at least one grade level'),
  subjects: z.array(z.string()).min(1, 'Please select at least one subject'),
  years_experience: z.number().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const gradeOptions = [
  { value: 'k', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: 'middle', label: 'Middle School' },
  { value: 'high', label: 'High School' },
];

const subjectOptions = [
  { value: 'math', label: 'Mathematics' },
  { value: 'reading', label: 'Reading/ELA' },
  { value: 'science', label: 'Science' },
  { value: 'social', label: 'Social Studies' },
  { value: 'writing', label: 'Writing' },
  { value: 'art', label: 'Art' },
  { value: 'music', label: 'Music' },
  { value: 'pe', label: 'Physical Education' },
  { value: 'special', label: 'Special Education' },
  { value: 'esl', label: 'ESL/ELL' },
  { value: 'other', label: 'Other' },
];

const experienceOptions = [
  { value: 1, label: '0-1 years' },
  { value: 3, label: '2-5 years' },
  { value: 8, label: '6-10 years' },
  { value: 15, label: '11-20 years' },
  { value: 25, label: '20+ years' },
];

const Signup = () => {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      school: '',
      grade_levels: [],
      subjects: [],
      years_experience: undefined,
      terms: false,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    const signUpData: SignUpData = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      school: data.school,
      grade_levels: data.grade_levels,
      subjects: data.subjects,
      years_experience: data.years_experience,
    };

    try {
      await signUp(signUpData);
      navigate('/auth/onboarding');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
            <p className="mt-2 text-gray-600">Start understanding your students better</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Educator Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="Jane Smith" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" type="email" placeholder="your.email@school.edu" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              className="pl-10"
                              type="password"
                              placeholder="Create a strong password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School/Organization</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Lincoln Elementary School" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="grade_levels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level(s)</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                const currentValues = field.value || [];
                                const valueExists = currentValues.includes(value);
                                
                                if (valueExists) {
                                  field.onChange(currentValues.filter(v => v !== value));
                                } else {
                                  field.onChange([...currentValues, value]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`${field.value?.length || 0} selected`} />
                              </SelectTrigger>
                              <SelectContent>
                                {gradeOptions.map((option) => (
                                  <SelectItem 
                                    key={option.value} 
                                    value={option.value}
                                    className={field.value?.includes(option.value) ? "bg-blue-50" : ""}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subjects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject(s)</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                const currentValues = field.value || [];
                                const valueExists = currentValues.includes(value);
                                
                                if (valueExists) {
                                  field.onChange(currentValues.filter(v => v !== value));
                                } else {
                                  field.onChange([...currentValues, value]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`${field.value?.length || 0} selected`} />
                              </SelectTrigger>
                              <SelectContent>
                                {subjectOptions.map((option) => (
                                  <SelectItem 
                                    key={option.value} 
                                    value={option.value}
                                    className={field.value?.includes(option.value) ? "bg-blue-50" : ""}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="years_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Teaching Experience</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {experienceOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
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
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the{' '}
                            <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Signup;
