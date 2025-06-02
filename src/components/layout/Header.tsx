
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationWidget from '@/components/notifications/NotificationWidget';
import GlobalSearch from '@/components/navigation/GlobalSearch';
import MobileNavigation from '@/components/layout/MobileNavigation';

const Header = () => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Navigation Component */}
      <MobileNavigation />
      
      {/* Desktop Header - Design System Colors and Spacing */}
      <header className="hidden md:block sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-xl ml-64">
          {/* Global Search */}
          <div className="flex-1 max-w-2xl">
            <GlobalSearch />
          </div>

          {/* Right side - Notifications and User menu */}
          <div className="flex items-center space-x-md">
            {/* Notification Widget */}
            <NotificationWidget />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full transition-colors duration-200">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="bg-[#2563eb] text-white">
                      {profile?.full_name ? getInitials(profile.full_name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-xs">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {profile?.full_name || 'Teacher'}
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      {user?.email}
                    </p>
                    {profile?.school && (
                      <p className="text-xs leading-none text-gray-500">
                        {profile.school}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings/profile" className="cursor-pointer transition-colors duration-200 hover:bg-gray-50">
                    <User className="mr-sm h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings/notifications" className="cursor-pointer transition-colors duration-200 hover:bg-gray-50">
                    <Settings className="mr-sm h-4 w-4" />
                    <span>Preferences</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer transition-colors duration-200 hover:bg-gray-50 text-[#ef4444]">
                  <LogOut className="mr-sm h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
