
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

const PublicHeader: React.FC = () => {
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">LearnSpark AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/auth/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/auth/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
