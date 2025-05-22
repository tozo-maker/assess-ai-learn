
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/components/layout/PublicLayout';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { resetPassword, isLoading } = useAuth();
  const [resetSent, setResetSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await resetPassword(data.email);
      setResetSent(true);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-gray-600">
              {resetSent 
                ? "Check your email for reset instructions" 
                : "Enter your email to receive password reset instructions"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Password Recovery</CardTitle>
            </CardHeader>
            <CardContent>
              {resetSent ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Reset Link Sent</h3>
                  <p className="text-gray-600 mb-6">
                    We've sent password reset instructions to your email address.
                    Please check your inbox and follow the instructions.
                  </p>
                  <Link to="/auth/login">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>

                    <div className="text-center">
                      <Link to="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Back to login
                      </Link>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgotPassword;
