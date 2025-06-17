
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
    
    console.log('useDashboardState computed:', state);
    return state;
  }, [data, isLoading, error]);
};
