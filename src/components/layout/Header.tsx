
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import RealtimeNotificationBell from '@/components/realtime/RealtimeNotificationBell';
import { useRealtime } from '@/components/realtime/RealtimeProvider';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useRealtime();

  const getQuickActionForRoute = () => {
    const path = location.pathname;
    
    if (path.includes('/students')) {
      return {
        label: 'Add Student',
        action: () => navigate('/app/students/add'),
        icon: Plus
      };
    }
    
    if (path.includes('/assessments')) {
      return {
        label: 'Create Assessment',
        action: () => navigate('/app/assessments/add'),
        icon: Plus
      };
    }
    
    if (path.includes('/goals')) {
      return {
        label: 'Create Goal',
        action: () => navigate('/app/goals/add'),
        icon: Plus
      };
    }
    
    return null;
  };

  const quickAction = getQuickActionForRoute();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Live updates enabled' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          
          {quickAction && (
            <Button size="sm" onClick={quickAction.action}>
              <quickAction.icon className="h-4 w-4 mr-2" />
              {quickAction.label}
            </Button>
          )}
          
          <RealtimeNotificationBell />
        </div>
      </div>
    </header>
  );
};

export default Header;
