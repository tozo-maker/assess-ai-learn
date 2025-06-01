
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer,
  DSButton
} from '@/components/ui/design-system';

const HeroSection = () => {
  return (
    <DSSection className="bg-gradient-to-b from-blue-50 to-white">
      <DSPageContainer>
        <DSSpacer size="3xl" />
        <div className="text-center">
          <DSPageTitle className="text-4xl md:text-6xl mb-6">
            Transform Assessment Data into{' '}
            <span className="text-[#2563eb]">Student Understanding</span>
          </DSPageTitle>
          <DSBodyText className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered insights that help teachers understand student learning patterns, 
            identify knowledge gaps, and provide personalized support that makes a difference.
          </DSBodyText>
          <DSFlexContainer direction="row" className="flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <DSButton variant="primary" className="text-lg px-8 py-3 h-12">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </DSButton>
            </Link>
            <Link to="/demo">
              <DSButton variant="ghost" className="text-lg px-8 py-3 h-12">
                Watch Demo
              </DSButton>
            </Link>
          </DSFlexContainer>
        </div>
        <DSSpacer size="3xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default HeroSection;
