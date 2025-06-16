
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Users, BookOpen, FileText, Brain, MessageSquare, Trash2, PlayCircle } from 'lucide-react';
import { sampleDataGenerator } from '@/utils/sample-data-generator';

const SampleDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [clearExisting, setClearExisting] = useState(true);
  const [generateAnalysis, setGenerateAnalysis] = useState(true);
  const [generationComplete, setGenerationComplete] = useState(false);
  const { toast } = useToast();

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      setGenerationComplete(false);
      
      toast({
        title: 'Generating Sample Data',
        description: 'Creating comprehensive educational dataset with performance metrics. This may take a few minutes...',
      });

      await sampleDataGenerator.generateComprehensiveData({
        clearExistingData: clearExisting,
        generateAnalysis: generateAnalysis
      });

      setGenerationComplete(true);
      toast({
        title: 'Sample Data Generated Successfully!',
        description: 'Your LearnSpark AI platform is now populated with realistic educational data and performance metrics.',
      });

    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        title: 'Error Generating Sample Data',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const dataComponents = [
    {
      icon: <Users className="h-5 w-5" />,
      title: '12 Diverse Students',
      description: 'Mixed grade levels (3rd-6th), varied learning profiles, different performance levels'
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: '8 Comprehensive Assessments',
      description: 'Math, Reading, Science, and Writing assessments across multiple grade levels'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Realistic Student Responses',
      description: 'Varied performance patterns with authentic error types and teacher notes'
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: 'AI Analysis & Insights',
      description: 'Generated strengths, growth areas, and personalized recommendations'
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Communication History',
      description: 'Parent communications, progress reports, and engagement records'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlayCircle className="h-6 w-6 mr-2 text-blue-600" />
            Generate Comprehensive Sample Data
          </CardTitle>
          <CardDescription>
            Create a complete educational dataset with performance analytics to fully test LearnSpark AI capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Components Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataComponents.map((component, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    {component.icon}
                  </div>
                  <h4 className="font-semibold text-sm">{component.title}</h4>
                </div>
                <p className="text-xs text-gray-600">{component.description}</p>
              </div>
            ))}
          </div>

          {/* Configuration Options */}
          <div className="space-y-4">
            <h4 className="font-semibold">Configuration Options</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="clearExisting" 
                checked={clearExisting} 
                onCheckedChange={(checked) => setClearExisting(checked === true)}
              />
              <label htmlFor="clearExisting" className="text-sm font-medium">
                Clear existing data before generating new data
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="generateAnalysis" 
                checked={generateAnalysis} 
                onCheckedChange={(checked) => setGenerateAnalysis(checked === true)}
              />
              <label htmlFor="generateAnalysis" className="text-sm font-medium">
                Generate AI analysis and insights data
              </label>
            </div>
          </div>

          {/* Warning for clearing data */}
          {clearExisting && (
            <Alert>
              <Trash2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will permanently delete all existing students, assessments, and related data. 
                Make sure to backup any important data before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {generationComplete && (
            <Alert className="border-green-200 bg-green-50">
              <PlayCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Success!</strong> Your comprehensive sample data has been generated. You can now explore:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Student profiles and performance analytics</li>
                  <li>Assessment results and AI-generated insights</li>
                  <li>Class-wide analytics and visualizations</li>
                  <li>Learning goals and progress tracking</li>
                  <li>Parent communication features</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleGenerateData} 
              disabled={isGenerating}
              size="lg"
              className="min-w-48"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Data...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Generate Sample Data
                </>
              )}
            </Button>
          </div>

          {/* Expected Generation Time */}
          <p className="text-center text-sm text-gray-600">
            Expected generation time: 2-5 minutes (now includes performance calculation)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleDataGenerator;
