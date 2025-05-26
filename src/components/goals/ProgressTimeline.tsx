
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
import { GoalWithMilestones } from '@/types/goals';
import { format, parseISO } from 'date-fns';

interface ProgressTimelineProps {
  goal: GoalWithMilestones;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ goal }) => {
  const completedMilestones = goal.milestones?.filter(m => m.completed_at) || [];
  const totalMilestones = goal.milestones?.length || 0;
  
  // Calculate progress based on milestones if available, otherwise use manual progress
  const milestoneProgress = totalMilestones > 0 
    ? (completedMilestones.length / totalMilestones) * 100 
    : 0;
  
  const displayProgress = totalMilestones > 0 ? milestoneProgress : (goal.progress_percentage || 0);

  const sortedMilestones = (goal.milestones || []).sort((a, b) => {
    if (a.target_date && b.target_date) {
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    }
    if (a.target_date) return -1;
    if (b.target_date) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Progress Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-gray-600">{Math.round(displayProgress)}%</span>
            </div>
            <Progress value={displayProgress} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">
              {totalMilestones > 0 
                ? `${completedMilestones.length} of ${totalMilestones} milestones completed`
                : 'Manual progress tracking'
              }
            </p>
          </div>

          {/* Milestones Timeline */}
          {sortedMilestones.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Milestone Timeline</h4>
              <div className="space-y-3">
                {sortedMilestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        milestone.completed_at 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white border-gray-300'
                      }`} />
                      {index < sortedMilestones.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          milestone.completed_at ? 'line-through text-gray-500' : ''
                        }`}>
                          {milestone.title}
                        </span>
                        {milestone.completed_at && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {milestone.description && (
                        <p className={`text-xs text-gray-600 mt-1 ${
                          milestone.completed_at ? 'line-through' : ''
                        }`}>
                          {milestone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {milestone.target_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {format(parseISO(milestone.target_date), 'MMM d, yyyy')}
                          </div>
                        )}
                        {milestone.completed_at && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Completed: {format(parseISO(milestone.completed_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Target Date */}
          {goal.target_date && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Goal Target:</span>
                <span className="text-gray-600">
                  {format(parseISO(goal.target_date), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTimeline;
