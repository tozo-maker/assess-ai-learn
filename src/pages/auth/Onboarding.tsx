import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import PublicLayout from '@/components/layout/PublicLayout';
import { CheckCircle, Users, FileText, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Onboarding = () => {
  const { user, profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState(profile?.full_name?.split(' ')[0] || '');
  const [goals, setGoals] = useState('');
  const [techLevel, setTechLevel] = useState('');
  const [className, setClassName] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep === 1 && displayName) {
      updateProfile({ full_name: displayName });
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const completeSetup = () => {
    console.log('Onboarding: Setup complete, redirecting to /app/dashboard');
    navigate('/app/dashboard');
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
                    <Input 
                      placeholder="Ms. Johnson, Mr. Smith, etc." 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are your main teaching goals this year?
                    </label>
                    <Textarea 
                      placeholder="e.g., Improve reading comprehension, help struggling math students..."
                      rows={3}
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How comfortable are you with technology?
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'beginner', label: 'Beginner - I prefer simple tools' },
                        { id: 'intermediate', label: 'Intermediate - I use various digital tools' },
                        { id: 'advanced', label: 'Advanced - I love trying new tech' }
                      ].map((option) => (
                        <label 
                          key={option.id}
                          className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                            techLevel === option.id ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="tech-comfort" 
                            className="text-blue-600"
                            value={option.id}
                            checked={techLevel === option.id}
                            onChange={() => setTechLevel(option.id)} 
                          />
                          <span>{option.label}</span>
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
                    <Input 
                      placeholder="e.g., 5th Grade Math, Reading Group A" 
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Students
                      </label>
                      <Input 
                        type="number" 
                        placeholder="24" 
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </label>
                      <Input 
                        placeholder="5th Grade" 
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Subject Areas (select all that apply)
                    </label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {['Mathematics', 'Reading/ELA', 'Science', 'Social Studies', 'Writing', 'Other'].map((subject) => (
                        <label 
                          key={subject} 
                          className={`flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer ${
                            selectedSubjects.includes(subject) ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="text-blue-600" 
                            checked={selectedSubjects.includes(subject)}
                            onChange={() => handleSubjectToggle(subject)}
                          />
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
                    <Card className="p-4 border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-blue-900">Try Sample Assessment</h4>
                        <p className="text-sm text-blue-700">See AI insights with sample data</p>
                      </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
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
                  onClick={currentStep === totalSteps ? completeSetup : nextStep}
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
