
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import PublicLayout from '@/components/layout/PublicLayout';
import { CheckCircle, Users, FileText, Lightbulb } from 'lucide-react';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <PublicLayout showNavigation={false}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to LearnSpark AI!</h1>
            <p className="text-gray-600 mt-2">Let's get you set up in just a few steps</p>
          </div>

          <div className="mb-8">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {currentStep === 1 && <><Users className="h-5 w-5" /><span>Tell us about yourself</span></>}
                {currentStep === 2 && <><FileText className="h-5 w-5" /><span>Set up your first class</span></>}
                {currentStep === 3 && <><Lightbulb className="h-5 w-5" /><span>Try a sample assessment</span></>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What should we call you?
                    </label>
                    <Input placeholder="Ms. Johnson, Mr. Smith, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are your main teaching goals this year?
                    </label>
                    <Textarea 
                      placeholder="e.g., Improve reading comprehension, help struggling math students..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How comfortable are you with technology?
                    </label>
                    <div className="space-y-2">
                      {['Beginner - I prefer simple tools', 'Intermediate - I use various digital tools', 'Advanced - I love trying new tech'].map((option, index) => (
                        <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="tech-comfort" className="text-blue-600" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Name
                    </label>
                    <Input placeholder="e.g., 5th Grade Math, Reading Group A" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Students
                      </label>
                      <Input type="number" placeholder="24" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </label>
                      <Input placeholder="5th Grade" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Subject Areas (select all that apply)
                    </label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {['Mathematics', 'Reading/ELA', 'Science', 'Social Studies', 'Writing', 'Other'].map((subject, index) => (
                        <label key={index} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" className="text-blue-600" />
                          <span>{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">You're all set!</h3>
                    <p className="text-gray-600 mb-6">
                      Your account is ready. Would you like to try a sample assessment to see how LearnSpark AI works?
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 border-blue-200 bg-blue-50">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-blue-900">Try Sample Assessment</h4>
                        <p className="text-sm text-blue-700">See AI insights with sample data</p>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Add Real Students</h4>
                        <p className="text-sm text-gray-600">Start with your actual class</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Button 
                  onClick={currentStep === totalSteps ? () => window.location.href = '/dashboard' : nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Onboarding;
