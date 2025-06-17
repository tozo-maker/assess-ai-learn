
import { useMemo } from 'react';

interface DashboardStateProps {
  data: any;
  isLoading: boolean;
  error: any;
}

export const useDashboardState = ({ data, isLoading, error }: DashboardStateProps) => {
  return useMemo(() => ({
    isInitialLoading: isLoading && !data,
    isEmpty: !isLoading && !error && !data?.students?.length,
    hasData: !!data,
    hasError: !!error
  }), [data, isLoading, error]);
};
