
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
  DSContentGrid
} from '@/components/ui/design-system';

const Index = () => {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-[#2563eb]" />,
      title: "Smart Assessment Analysis",
      description: "Upload assessment data and get instant AI-powered insights into student performance patterns and learning gaps."
    },
    {
      icon: <Users className="h-8 w-8 text-[#2563eb]" />,
      title: "Class & Individual Insights",
      description: "Understand both whole-class trends and individual student needs with detailed analytics and visualizations."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-[#2563eb]" />,
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
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Assessment Data into{' '}
              <span className="text-[#2563eb]">Student Understanding</span>
            </h1>
            <DSBodyText className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered insights that help teachers understand student learning patterns, 
              identify knowledge gaps, and provide personalized support that makes a difference.
            </DSBodyText>
            <DSFlexContainer direction="col" className="sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <DSButton variant="primary" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-lg px-8 py-3 h-12">
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
            <DSPageTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Educators
            </DSPageTitle>
            <DSBodyText className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to turn assessment data into actionable insights
            </DSBodyText>
          </div>
          
          <DSContentGrid cols={3} className="gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <DSCard key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <DSCardContent className="pt-6">
                  <DSFlexContainer justify="center" className="mb-4">
                    {feature.icon}
                  </DSFlexContainer>
                  <DSSubsectionHeader className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </DSSubsectionHeader>
                  <DSBodyText className="text-base text-gray-600">
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
              <DSPageTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Educators Choose LearnSpark AI
              </DSPageTitle>
              <div className="space-y-4">
                {[
                  "Save 5+ hours weekly on assessment analysis",
                  "Identify learning gaps before they become problems",
                  "Get personalized teaching recommendations",
                  "Track student progress with visual insights",
                  "Support differentiated instruction with data"
                ].map((benefit, index) => (
                  <DSFlexContainer key={index} align="center" gap="sm">
                    <CheckCircle className="h-5 w-5 text-[#10b981] flex-shrink-0" />
                    <DSBodyText className="text-gray-700">{benefit}</DSBodyText>
                  </DSFlexContainer>
                ))}
              </div>
            </div>
            <DSCard className="p-8">
              <DSCardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-[#2563eb]" />
                  </div>
                  <DSSubsectionHeader className="text-xl text-gray-900 mb-2">Quick Start</DSSubsectionHeader>
                  <DSBodyText className="text-gray-600 mb-6">
                    Get started in minutes with our simple onboarding process
                  </DSBodyText>
                  <Link to="/auth/signup">
                    <DSButton variant="primary" className="bg-[#2563eb] hover:bg-[#1d4ed8]">
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
            <DSPageTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Educators
            </DSPageTitle>
          </div>
          
          <DSContentGrid cols={2} className="gap-8">
            {testimonials.map((testimonial, index) => (
              <DSCard key={index} className="p-6 bg-gray-50">
                <DSCardContent className="pt-6">
                  <blockquote className="text-lg text-gray-700 mb-4">
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
      <DSSection className="bg-[#2563eb]">
        <DSPageContainer>
          <DSSpacer size="2xl" />
          <div className="text-center">
            <DSPageTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Teaching?
            </DSPageTitle>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <DSPageContainer>
          <DSContentGrid cols={4} className="gap-8">
            <div>
              <DSFlexContainer align="center" gap="sm" className="mb-4">
                <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center">
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
                <Link to="/about" className="block text-gray-400 hover:text-white">About</Link>
                <Link to="/pricing" className="block text-gray-400 hover:text-white">Pricing</Link>
                <Link to="/demo" className="block text-gray-400 hover:text-white">Demo</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <Link to="/contact" className="block text-gray-400 hover:text-white">Contact</Link>
                <a href="#" className="block text-gray-400 hover:text-white">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white">Privacy Policy</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="block text-gray-400 hover:text-white">LinkedIn</a>
                <a href="#" className="block text-gray-400 hover:text-white">Blog</a>
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
