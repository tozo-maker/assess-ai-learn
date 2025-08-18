
import { useMemo } from 'react';

interface DashboardStateProps {
  data: any;
  isLoading: boolean;
  error: any;
}

export const useDashboardState = ({ data, isLoading, error }: DashboardStateProps) => {
  return useMemo(() => {
    const state = {
      isInitialLoading: isLoading && !data,
      isEmpty: !isLoading && !error && (!data || !data?.students?.length),
      hasData: !!data,
      hasError: !!error
    };
    
    // Dashboard state computed
    return state;
  }, [data, isLoading, error]);
};
