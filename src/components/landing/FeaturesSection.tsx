
import React from 'react';
import { 
  FileText, 
  Users, 
  Lightbulb
} from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSBodyText,
  DSFlexContainer,
  DSCard,
  DSCardContent,
  DSSubsectionHeader,
  DSContentGrid,
  DSSectionHeader
} from '@/components/ui/design-system';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-[#2563eb]" />,
      title: "Smart Assessment Analysis",
      description: "Upload assessment data and get instant AI-powered insights into student performance patterns and learning gaps."
    },
    {
      icon: <Users className="h-8 w-8 text-[#2563eb]" />,
      title: "Class & Individual Insights",
      description: "Understand both whole-class trends and individual student needs with detailed analytics and visualizations."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-[#2563eb]" />,
      title: "Personalized Recommendations",
      description: "Receive actionable teaching strategies and personalized learning recommendations for each student."
    }
  ];

  return (
    <DSSection id="features" className="bg-white w-full" fullWidth>
      <DSPageContainer fullWidth>
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <DSSectionHeader className="mb-4">
            Powerful Features for Educators
          </DSSectionHeader>
          <DSBodyText className="text-gray-600">
            Everything you need to turn assessment data into actionable insights
          </DSBodyText>
        </div>
        
        <DSContentGrid cols={3}>
          {features.map((feature, index) => (
            <DSCard key={index} className="p-6 text-center hover:shadow-lg transition-shadow h-full">
              <DSCardContent className="pt-6 space-y-4 h-full flex flex-col">
                <DSFlexContainer justify="center">
                  {feature.icon}
                </DSFlexContainer>
                <DSSubsectionHeader className="text-gray-900">
                  {feature.title}
                </DSSubsectionHeader>
                <DSBodyText className="text-gray-600 flex-grow text-center">
                  {feature.description}
                </DSBodyText>
              </DSCardContent>
            </DSCard>
          ))}
        </DSContentGrid>
      </DSPageContainer>
    </DSSection>
  );
};

export default FeaturesSection;
