
import React from 'react';
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardContent,
  DSContentGrid,
  DSSectionHeader,
  DSSpacer
} from '@/components/ui/design-system';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "LearnSpark AI has transformed how I understand my students' learning patterns. The insights help me provide targeted support exactly when they need it.",
      author: "Sarah Chen",
      role: "5th Grade Teacher, Lincoln Elementary"
    },
    {
      quote: "The assessment analysis saves me hours every week and gives me confidence that I'm addressing each student's unique learning needs.",
      author: "Michael Rodriguez",
      role: "Middle School Math Teacher"
    }
  ];

  return (
    <DSSection className="bg-white">
      <DSPageContainer>
        <div className="text-center mb-16">
          <DSSectionHeader className="mb-4">
            Trusted by Educators
          </DSSectionHeader>
        </div>
        
        <DSContentGrid cols={2} className="gap-8">
          {testimonials.map((testimonial, index) => (
            <DSCard key={index} className="p-6 bg-gray-50">
              <DSCardContent className="pt-6 space-y-4">
                <blockquote className="text-lg text-gray-700">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </DSCardContent>
            </DSCard>
          ))}
        </DSContentGrid>
        <DSSpacer size="2xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default TestimonialsSection;
