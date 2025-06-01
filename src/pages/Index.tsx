
import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';

const Index = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </PublicLayout>
  );
};

export default Index;
