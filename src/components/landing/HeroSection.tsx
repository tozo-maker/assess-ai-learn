
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer,
  DSButton
} from '@/components/ui/design-system';

const HeroSection = () => {
  return (
    <DSSection className="bg-gradient-to-b from-blue-50 to-white w-full" fullWidth>
      <DSPageContainer fullWidth>
        <div className="text-center max-w-4xl mx-auto">
          <DSPageTitle className="mb-6">
            Transform Assessment Data into{' '}
            <span className="text-[#2563eb]">Student Understanding</span>
          </DSPageTitle>
          <DSBodyText className="text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered insights that help teachers understand student learning patterns, 
            identify knowledge gaps, and provide personalized support that makes a difference.
          </DSBodyText>
          <DSFlexContainer 
            direction="row" 
            justify="center" 
            gap="md" 
            className="flex-col sm:flex-row w-full max-w-md mx-auto"
          >
            <Link to="/auth/signup" className="w-full sm:w-auto">
              <DSButton variant="primary" className="text-lg px-8 py-3 h-12 w-full">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </DSButton>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <DSButton variant="ghost" className="text-lg px-8 py-3 h-12 w-full">
                Watch Demo
              </DSButton>
            </Link>
          </DSFlexContainer>
        </div>
      </DSPageContainer>
    </DSSection>
  );
};

export default HeroSection;
