
import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, Target, Heart, Award } from 'lucide-react';

const About = () => {
  return (
    <PublicLayout>
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Mission: Empower Every Educator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              LearnSpark AI was created by educators, for educators. We believe that understanding each student's unique learning journey is the key to educational success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8">
              <CardContent className="pt-6">
                <Target className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  A world where every teacher has the insights they need to help every student reach their full potential, powered by AI that truly understands learning.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-red-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
                <p className="text-gray-600">
                  We're committed to privacy, simplicity, and making AI accessible to all educators, regardless of their technical background.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to Transform Your Teaching?</h2>
            <Link to="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
