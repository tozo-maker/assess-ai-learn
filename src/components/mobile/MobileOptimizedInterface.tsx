
import React from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';

interface MobileOptimizedInterfaceProps {
  children: React.ReactNode;
}

const MobileOptimizedInterface: React.FC<MobileOptimizedInterfaceProps> = ({ children }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]">
            <span className="text-white font-bold text-sm">LS</span>
          </div>
          <span className="font-bold text-sm text-gray-900">LearnSpark AI</span>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default MobileOptimizedInterface;
