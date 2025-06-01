
import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import { DSSpacer } from '@/components/ui/design-system';

const Index = () => {
  return (
    <PublicLayout>
      <main className="min-h-screen">
        <HeroSection />
        <DSSpacer size="lg" />
        <FeaturesSection />
        <DSSpacer size="lg" />
        <BenefitsSection />
        <DSSpacer size="lg" />
        <TestimonialsSection />
        <DSSpacer size="lg" />
        <CTASection />
        <LandingFooter />
      </main>
    </PublicLayout>
  );
};

export default Index;
