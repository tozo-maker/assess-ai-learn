
import React from 'react';

const AssessmentListSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Filter Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="h-11 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-11 bg-gray-200 rounded-lg w-32"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="animate-pulse">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              
              {/* Subject Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentListSkeleton;
