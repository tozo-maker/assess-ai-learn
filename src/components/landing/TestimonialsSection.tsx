
import React from 'react';
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardContent,
  DSContentGrid,
  DSSectionHeader
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
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <DSSectionHeader className="mb-4">
            Trusted by Educators
          </DSSectionHeader>
        </div>
        
        <DSContentGrid cols={2}>
          {testimonials.map((testimonial, index) => (
            <DSCard key={index} className="p-8 bg-gray-50 h-full">
              <DSCardContent className="pt-6 space-y-6 h-full flex flex-col">
                <blockquote className="text-lg text-gray-700 flex-grow leading-relaxed">
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
      </DSPageContainer>
    </DSSection>
  );
};

export default TestimonialsSection;
