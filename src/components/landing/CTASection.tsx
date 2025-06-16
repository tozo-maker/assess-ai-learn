
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSBodyText,
  DSButton,
  DSSectionHeader
} from '@/components/ui/design-system';

const CTASection = () => {
  return (
    <DSSection className="bg-[#2563eb]">
      <DSPageContainer>
        <div className="text-center max-w-3xl mx-auto">
          <DSSectionHeader className="text-white mb-6">
            Ready to Transform Your Teaching?
          </DSSectionHeader>
          <DSBodyText className="text-blue-100 mb-8">
            Join thousands of educators using AI to better understand their students
          </DSBodyText>
          <Link to="/auth/signup">
            <DSButton variant="secondary" className="bg-white text-[#2563eb] hover:bg-gray-100 text-lg px-8 py-3 h-12">
              Get Started Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </DSButton>
          </Link>
        </div>
      </DSPageContainer>
    </DSSection>
  );
};

export default CTASection;
