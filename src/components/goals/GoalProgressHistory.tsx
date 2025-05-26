
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp } from 'lucide-react';
import { GoalProgressHistory } from '@/types/goals';
import { format } from 'date-fns';

interface GoalProgressHistoryProps {
  progressHistory: GoalProgressHistory[];
  currentProgress: number;
}

const GoalProgressHistoryComponent: React.FC<GoalProgressHistoryProps> = ({ 
  progressHistory, 
  currentProgress 
}) => {
  const sortedHistory = progressHistory.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const progressTrend = sortedHistory.length >= 2 
    ? sortedHistory[0].progress_percentage - sortedHistory[1].progress_percentage
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Progress History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Current Progress</span>
              <span className="text-gray-600">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-3" />
            {progressTrend !== 0 && (
              <p className={`text-xs mt-1 ${progressTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {progressTrend > 0 ? '+' : ''}{progressTrend}% from last update
              </p>
            )}
          </div>

          {/* Progress Timeline */}
          {sortedHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Recent Updates</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sortedHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      {index < sortedHistory.length - 1 && (
                        <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {entry.progress_percentage}% completed
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedHistory.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No progress history available yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalProgressHistoryComponent;
