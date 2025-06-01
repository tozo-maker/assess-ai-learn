
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Users, 
  FileText, 
  Lightbulb,
  ArrowRight,
  User
} from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer,
  DSCard,
  DSCardContent,
  DSButton,
  DSSubsectionHeader,
  DSContentGrid,
  DSSectionHeader
} from '@/components/ui/design-system';

const Index = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-[var(--color-primary)]" />,
      title: "Smart Assessment Analysis",
      description: "Upload assessment data and get instant AI-powered insights into student performance patterns and learning gaps."
    },
    {
      icon: <Users className="h-8 w-8 text-[var(--color-primary)]" />,
      title: "Class & Individual Insights",
      description: "Understand both whole-class trends and individual student needs with detailed analytics and visualizations."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-[var(--color-primary)]" />,
      title: "Personalized Recommendations",
      description: "Receive actionable teaching strategies and personalized learning recommendations for each student."
    }
  ];

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
    <PublicLayout>
      {/* Hero Section */}
      <DSSection className="bg-gradient-to-b from-blue-50 to-white">
        <DSPageContainer>
          <DSSpacer size="3xl" />
          <div className="text-center">
            <DSPageTitle className="text-4xl md:text-6xl mb-6">
              Transform Assessment Data into{' '}
              <span className="text-[var(--color-primary)]">Student Understanding</span>
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

      {/* Features Section */}
      <DSSection id="features" className="bg-white">
        <DSPageContainer>
          <div className="text-center mb-16">
            <DSSectionHeader className="mb-4">
              Powerful Features for Educators
            </DSSectionHeader>
            <DSBodyText className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to turn assessment data into actionable insights
            </DSBodyText>
          </div>
          
          <DSContentGrid cols={3} className="gap-8">
            {features.map((feature, index) => (
              <DSCard key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <DSCardContent className="pt-6 space-y-4">
                  <DSFlexContainer justify="center">
                    {feature.icon}
                  </DSFlexContainer>
                  <DSSubsectionHeader className="text-gray-900">
                    {feature.title}
                  </DSSubsectionHeader>
                  <DSBodyText className="text-gray-600">
                    {feature.description}
                  </DSBodyText>
                </DSCardContent>
              </DSCard>
            ))}
          </DSContentGrid>
        </DSPageContainer>
      </DSSection>

      {/* Benefits Section */}
      <DSSection className="bg-gray-50">
        <DSPageContainer>
          <DSContentGrid cols={2} className="gap-12 items-center">
            <div>
              <DSSectionHeader className="mb-6">
                Why Educators Choose LearnSpark AI
              </DSSectionHeader>
              <div className="space-y-4">
                {[
                  "Save 5+ hours weekly on assessment analysis",
                  "Identify learning gaps before they become problems",
                  "Get personalized teaching recommendations",
                  "Track student progress with visual insights",
                  "Support differentiated instruction with data"
                ].map((benefit, index) => (
                  <DSFlexContainer key={index} align="center" gap="sm">
                    <CheckCircle className="h-5 w-5 text-[var(--color-success)] flex-shrink-0" />
                    <DSBodyText className="text-gray-700">{benefit}</DSBodyText>
                  </DSFlexContainer>
                ))}
              </div>
            </div>
            <DSCard className="p-8">
              <DSCardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-8 w-8 text-[var(--color-primary)]" />
                  </div>
                  <DSSubsectionHeader className="text-gray-900">Quick Start</DSSubsectionHeader>
                  <DSBodyText className="text-gray-600">
                    Get started in minutes with our simple onboarding process
                  </DSBodyText>
                  <Link to="/auth/signup">
                    <DSButton variant="primary">
                      Create Free Account
                    </DSButton>
                  </Link>
                </div>
              </DSCardContent>
            </DSCard>
          </DSContentGrid>
        </DSPageContainer>
      </DSSection>

      {/* Testimonials */}
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

      {/* CTA Section */}
      <DSSection className="bg-[var(--color-primary)]">
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
              <DSButton variant="secondary" className="bg-white text-[var(--color-primary)] hover:bg-gray-100 text-lg px-8 py-3 h-12">
                Get Started Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </DSButton>
            </Link>
          </div>
          <DSSpacer size="2xl" />
        </DSPageContainer>
      </DSSection>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <DSPageContainer>
          <DSContentGrid cols={4} className="gap-8">
            <div>
              <DSFlexContainer align="center" gap="sm" className="mb-4">
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold">LearnSpark AI</span>
              </DSFlexContainer>
              <DSBodyText className="text-gray-400">
                Empowering educators with AI-powered insights
              </DSBodyText>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/demo" className="block text-gray-400 hover:text-white transition-colors">Demo</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
              </div>
            </div>
          </DSContentGrid>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LearnSpark AI. All rights reserved.</p>
          </div>
        </DSPageContainer>
      </footer>
    </PublicLayout>
  );
};

export default Index;
