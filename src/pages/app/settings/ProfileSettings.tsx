
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageShell from '@/components/ui/page-shell';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { TeacherProfile } from '@/types/auth';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  school: z.string().min(1, 'School/Organization is required'),
  years_experience: z.number().optional(),
  grade_levels: z.array(z.string()).min(1, 'Please select at least one grade level'),
  subjects: z.array(z.string()).min(1, 'Please select at least one subject')
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

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

const ProfileSettings = () => {
  const { profile, updateProfile, updatePassword, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      school: '',
      years_experience: undefined,
      grade_levels: [],
      subjects: [],
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name,
        school: profile.school || '',
        years_experience: profile.years_experience,
        grade_levels: profile.grade_levels,
        subjects: profile.subjects,
      });
    }
  }, [profile, profileForm]);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data as Partial<TeacherProfile>);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handlePasswordUpdate = async (data: PasswordFormValues) => {
    try {
      await updatePassword(data.newPassword);
      passwordForm.reset();
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <PageShell 
      title="Profile Settings" 
      description="Manage your account and teaching preferences"
      icon={<User className="h-6 w-6 text-blue-600" />}
    >
      <div className="container mx-auto py-6">
        <div className="flex space-x-4 mb-6">
          <Button 
            variant={activeTab === 'general' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('general')}
            className={activeTab === 'general' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            General Information
          </Button>
          <Button 
            variant={activeTab === 'security' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('security')}
            className={activeTab === 'security' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Security
          </Button>
        </div>

        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and teaching preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School/Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Lincoln Elementary School" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="years_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Teaching Experience</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                        >
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
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
                      control={profileForm.control}
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

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
};

export default ProfileSettings;
