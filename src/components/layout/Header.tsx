
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  User, 
  Home, 
  Settings, 
  LogOut,
  ChevronDown,
  BookOpen,
  LineChart,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  isAuthenticated?: boolean;
  showNavigation?: boolean;
}

// Add proper type for navigation items
interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ showNavigation = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  
  const isAuthenticated = !!user;

  const publicNavItems: NavItem[] = [
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Demo', href: '/demo' },
  ];

  const appNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'Students', href: '/students', icon: <User className="h-4 w-4 mr-2" /> },
    { name: 'Assessments', href: '/assessments', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { name: 'Insights', href: '/insights/class', icon: <LineChart className="h-4 w-4 mr-2" /> },
    { name: 'Reports', href: '/reports/progress', icon: <FileText className="h-4 w-4 mr-2" /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LearnSpark AI</span>
          </Link>

          {/* Navigation */}
          {showNavigation && (
            <nav className="hidden md:flex space-x-8">
              {(isAuthenticated ? appNavItems : publicNavItems).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center ${
                    location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'text-blue-600' 
                      : 'text-gray-700'
                  }`}
                >
                  {isAuthenticated && item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/settings/profile">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {profile?.full_name?.split(' ')[0] || 'Teacher'}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/settings/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/profile" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="flex items-center text-red-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(isAuthenticated ? appNavItems : publicNavItems).map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link to={item.href} className="flex items-center">
                      {isAuthenticated && item.icon}
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/login" className="flex items-center">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/auth/signup" className="flex items-center">
                        Get Started
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
