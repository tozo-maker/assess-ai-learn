
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, User } from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSBodyText,
  DSFlexContainer,
  DSCard,
  DSCardContent,
  DSButton,
  DSSubsectionHeader,
  DSContentGrid,
  DSSectionHeader
} from '@/components/ui/design-system';

const BenefitsSection = () => {
  const benefits = [
    "Save 5+ hours weekly on assessment analysis",
    "Identify learning gaps before they become problems",
    "Get personalized teaching recommendations",
    "Track student progress with visual insights",
    "Support differentiated instruction with data"
  ];

  return (
    <DSSection className="bg-gray-50 py-16 md:py-24">
      <DSPageContainer>
        <DSContentGrid cols={2} className="gap-12 items-center">
          <div className="order-2 lg:order-1">
            <DSSectionHeader className="mb-8">
              Why Educators Choose LearnSpark AI
            </DSSectionHeader>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <DSFlexContainer key={index} align="center" gap="sm">
                  <CheckCircle className="h-5 w-5 text-[#10b981] flex-shrink-0" />
                  <DSBodyText className="text-gray-700">{benefit}</DSBodyText>
                </DSFlexContainer>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <DSCard className="p-8">
              <DSCardContent>
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-8 w-8 text-[#2563eb]" />
                  </div>
                  <DSSubsectionHeader className="text-gray-900">Quick Start</DSSubsectionHeader>
                  <DSBodyText className="text-gray-600">
                    Get started in minutes with our simple onboarding process
                  </DSBodyText>
                  <Link to="/auth/signup">
                    <DSButton variant="primary" className="w-full sm:w-auto">
                      Create Free Account
                    </DSButton>
                  </Link>
                </div>
              </DSCardContent>
            </DSCard>
          </div>
        </DSContentGrid>
      </DSPageContainer>
    </DSSection>
  );
};

export default BenefitsSection;
