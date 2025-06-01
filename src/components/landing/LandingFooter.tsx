
import React from 'react';
import { Link } from 'react-router-dom';
import {
  DSPageContainer,
  DSBodyText,
  DSFlexContainer,
  DSContentGrid
} from '@/components/ui/design-system';

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <DSPageContainer>
        <DSContentGrid cols={4} className="gap-8 mb-12">
          <div className="col-span-4 md:col-span-1">
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
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold mb-4">Product</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors">About</Link>
              <Link to="/pricing" className="block text-gray-400 hover:text-white transition-colors">Pricing</Link>
              <Link to="/demo" className="block text-gray-400 hover:text-white transition-colors">Demo</Link>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">Contact</Link>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="col-span-4 md:col-span-1">
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
            </div>
          </div>
        </DSContentGrid>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 LearnSpark AI. All rights reserved.</p>
        </div>
      </DSPageContainer>
    </footer>
  );
};

export default LandingFooter;
