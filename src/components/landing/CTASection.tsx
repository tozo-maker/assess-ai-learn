
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSBodyText,
  DSButton,
  DSSectionHeader
} from '@/components/ui/design-system';

const CTASection = () => {
  return (
    <DSSection className="bg-[#2563eb]">
      <DSPageContainer>
        <DSSpacer size="2xl" />
        <div className="text-center">
          <DSSectionHeader className="text-white mb-4">
            Ready to Transform Your Teaching?
          </DSSectionHeader>
          <DSBodyText className="text-xl text-blue-100 mb-8">
            Join thousands of educators using AI to better understand their students
          </DSBodyText>
          <Link to="/auth/signup">
            <DSButton variant="secondary" className="bg-white text-[#2563eb] hover:bg-gray-100 text-lg px-8 py-3 h-12">
              Get Started Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </DSButton>
          </Link>
        </div>
        <DSSpacer size="2xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default CTASection;
