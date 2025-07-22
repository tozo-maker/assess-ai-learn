
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { FontLoadingWrapper, FontPreloader } from "@/components/ui/font-loading";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { useComponentPerformance } from "@/components/ui/performance-monitor";
import { AppRoutes } from "@/components/routing/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  useComponentPerformance('App');

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <FontLoadingWrapper>
          <PerformanceMonitor>
            <FontPreloader />
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </PerformanceMonitor>
        </FontLoadingWrapper>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

export default App;
