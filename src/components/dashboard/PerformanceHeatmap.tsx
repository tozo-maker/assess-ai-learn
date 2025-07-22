import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

interface HeatmapData {
  studentId: string;
  studentName: string;
  skills: Record<string, {
    score: number;
    assessmentCount: number;
    lastAssessed: Date;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface PerformanceHeatmapProps {
  data: HeatmapData[];
  skillCategories: string[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: string) => void;
  onCellClick?: (studentId: string, skill: string) => void;
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({
  data,
  skillCategories,
  timeRange = 'month',
  onTimeRangeChange,
  onCellClick
}) => {
  const [viewMode, setViewMode] = useState<'scores' | 'trends' | 'frequency'>('scores');

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-400';
    if (score >= 60) return 'bg-orange-400';
    if (score >= 50) return 'bg-red-400';
    return 'bg-red-500';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'bg-green-400';
      case 'down': return 'bg-red-400';
      case 'stable': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getFrequencyColor = (count: number) => {
    const maxCount = Math.max(...data.flatMap(student => 
      Object.values(student.skills).map(skill => skill.assessmentCount)
    ));
    const intensity = count / maxCount;
    
    if (intensity >= 0.8) return 'bg-blue-500';
    if (intensity >= 0.6) return 'bg-blue-400';
    if (intensity >= 0.4) return 'bg-blue-300';
    if (intensity >= 0.2) return 'bg-blue-200';
    return 'bg-blue-100';
  };

  const getCellColor = (skill: any) => {
    switch (viewMode) {
      case 'scores':
        return getScoreColor(skill?.score || 0);
      case 'trends':
        return getTrendColor(skill?.trend || 'stable');
      case 'frequency':
        return getFrequencyColor(skill?.assessmentCount || 0);
      default:
        return 'bg-gray-200';
    }
  };

  const getCellContent = (skill: any) => {
    if (!skill) return null;
    
    switch (viewMode) {
      case 'scores':
        return skill.score.toFixed(0);
      case 'trends':
        return skill.trend === 'up' ? '↑' : skill.trend === 'down' ? '↓' : '→';
      case 'frequency':
        return skill.assessmentCount;
      default:
        return '';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return null;
    }
  };

  const getViewModeDescription = () => {
    switch (viewMode) {
      case 'scores':
        return 'Performance scores (0-100)';
      case 'trends':
        return 'Performance trends (↑ improving, ↓ declining, → stable)';
      case 'frequency':
        return 'Assessment frequency (number of assessments)';
      default:
        return '';
    }
  };

  return (
    <TooltipProvider>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Class Performance Heatmap
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {onTimeRangeChange && (
                <Select value={timeRange} onValueChange={onTimeRangeChange}>
                  <SelectTrigger className="w-32">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scores">Scores</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-gray-600">{getViewModeDescription()}</p>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header Row */}
              <div className="grid grid-cols-[200px_repeat(var(--skills-count),_60px)] gap-1 mb-2">
                <div className="font-medium text-sm text-gray-700 p-2">Student</div>
                {skillCategories.map((skill) => (
                  <div 
                    key={skill}
                    className="text-xs font-medium text-gray-700 p-2 text-center transform -rotate-45 origin-center"
                    style={{ writingMode: 'vertical-lr' }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
              
              {/* Data Rows */}
              <div className="space-y-1">
                {data.map((student) => (
                  <div 
                    key={student.studentId}
                    className="grid grid-cols-[200px_repeat(var(--skills-count),_60px)] gap-1"
                    style={{ '--skills-count': skillCategories.length } as any}
                  >
                    <div className="font-medium text-sm p-2 truncate">
                      {student.studentName}
                    </div>
                    
                    {skillCategories.map((skill) => {
                      const skillData = student.skills[skill];
                      const cellColor = getCellColor(skillData);
                      const cellContent = getCellContent(skillData);
                      
                      return (
                        <Tooltip key={skill}>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-12 w-12 rounded flex items-center justify-center text-xs font-medium text-white cursor-pointer transition-transform hover:scale-110 ${cellColor}`}
                              onClick={() => onCellClick?.(student.studentId, skill)}
                            >
                              {cellContent}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {student.studentName} - {skill}
                              </div>
                              {skillData ? (
                                <>
                                  <div>Score: {skillData.score.toFixed(1)}%</div>
                                  <div>Assessments: {skillData.assessmentCount}</div>
                                  <div className="flex items-center">
                                    Trend: {getTrendIcon(skillData.trend)}
                                    <span className="ml-1">{skillData.trend}</span>
                                  </div>
                                  <div>Last assessed: {skillData.lastAssessed.toLocaleDateString()}</div>
                                </>
                              ) : (
                                <div className="text-gray-500">No data available</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Legend:</span>
              {viewMode === 'scores' && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-xs">0-50</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                    <span className="text-xs">50-70</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                    <span className="text-xs">70-80</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span className="text-xs">80-90</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-xs">90-100</span>
                  </div>
                </div>
              )}
              
              {viewMode === 'trends' && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span className="text-xs">Improving</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span className="text-xs">Stable</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span className="text-xs">Declining</span>
                  </div>
                </div>
              )}
              
              {viewMode === 'frequency' && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-blue-100 rounded"></div>
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-blue-300 rounded"></div>
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs">High</span>
                  </div>
                </div>
              )}
            </div>
            
            <Badge variant="secondary" className="text-xs">
              {data.length} students • {skillCategories.length} skills
            </Badge>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PerformanceHeatmap;