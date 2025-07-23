
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Filter,
  Eye,
  Palette
} from 'lucide-react';

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

interface PerformanceHeatmapEnhancedProps {
  data: HeatmapData[];
  skillCategories: string[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: string) => void;
  onCellClick?: (studentId: string, skill: string) => void;
}

const PerformanceHeatmapEnhanced: React.FC<PerformanceHeatmapEnhancedProps> = ({
  data,
  skillCategories,
  timeRange = 'month',
  onTimeRangeChange,
  onCellClick
}) => {
  const [viewMode, setViewMode] = useState<'scores' | 'trends' | 'frequency'>('scores');
  const [colorScheme, setColorScheme] = useState<'standard' | 'colorblind' | 'grayscale'>('standard');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Colorblind-friendly color schemes
  const colorSchemes = {
    standard: {
      excellent: 'bg-green-500',
      good: 'bg-green-400',
      average: 'bg-yellow-400',
      below: 'bg-orange-400',
      poor: 'bg-red-400',
      critical: 'bg-red-500'
    },
    colorblind: {
      excellent: 'bg-blue-600',
      good: 'bg-blue-400',
      average: 'bg-amber-400',
      below: 'bg-amber-600',
      poor: 'bg-red-400',
      critical: 'bg-red-600'
    },
    grayscale: {
      excellent: 'bg-gray-800',
      good: 'bg-gray-600',
      average: 'bg-gray-400',
      below: 'bg-gray-300',
      poor: 'bg-gray-200',
      critical: 'bg-gray-100'
    }
  };

  const getScoreColor = (score: number) => {
    const scheme = colorSchemes[colorScheme];
    if (score >= 90) return scheme.excellent;
    if (score >= 80) return scheme.good;
    if (score >= 70) return scheme.average;
    if (score >= 60) return scheme.below;
    if (score >= 50) return scheme.poor;
    return scheme.critical;
  };

  const getTrendColor = (trend: string) => {
    const scheme = colorSchemes[colorScheme];
    switch (trend) {
      case 'up': return scheme.excellent;
      case 'down': return scheme.critical;
      case 'stable': return scheme.average;
      default: return 'bg-gray-300';
    }
  };

  const getFrequencyColor = (count: number) => {
    const maxCount = Math.max(...data.flatMap(student => 
      Object.values(student.skills).map(skill => skill.assessmentCount)
    ));
    const intensity = count / maxCount;
    const scheme = colorSchemes[colorScheme];
    
    if (intensity >= 0.8) return scheme.excellent;
    if (intensity >= 0.6) return scheme.good;
    if (intensity >= 0.4) return scheme.average;
    if (intensity >= 0.2) return scheme.below;
    return scheme.poor;
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
    if (!skill) return '';
    
    switch (viewMode) {
      case 'scores':
        return skill.score.toFixed(0);
      case 'trends':
        return skill.trend === 'up' ? '↑' : skill.trend === 'down' ? '↓' : '→';
      case 'frequency':
        return skill.assessmentCount.toString();
      default:
        return '';
    }
  };

  // Filter data based on performance filter
  const filteredData = data.filter(student => {
    if (performanceFilter === 'all') return true;
    
    const avgScore = Object.values(student.skills).reduce((sum, skill) => sum + skill.score, 0) / 
                     Object.values(student.skills).length;
    
    switch (performanceFilter) {
      case 'high': return avgScore >= 80;
      case 'medium': return avgScore >= 60 && avgScore < 80;
      case 'low': return avgScore < 60;
      default: return true;
    }
  });

  const exportToPNG = async () => {
    if (!heatmapRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(heatmapRef.current);
      const link = document.createElement('a');
      link.download = `performance-heatmap-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportToPDF = async () => {
    if (!heatmapRef.current) return;
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(heatmapRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`performance-heatmap-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return null;
    }
  };

  return (
    <TooltipProvider>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Enhanced Performance Heatmap
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Time Range */}
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
              
              {/* View Mode */}
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <Eye className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scores">Scores</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="frequency">Frequency</SelectItem>
                </SelectContent>
              </Select>

              {/* Color Scheme */}
              <Select value={colorScheme} onValueChange={(value: any) => setColorScheme(value)}>
                <SelectTrigger className="w-36">
                  <Palette className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="colorblind">Colorblind Safe</SelectItem>
                  <SelectItem value="grayscale">Grayscale</SelectItem>
                </SelectContent>
              </Select>

              {/* Performance Filter */}
              <Select value={performanceFilter} onValueChange={(value: any) => setPerformanceFilter(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="high">High Performers</SelectItem>
                  <SelectItem value="medium">Medium Performers</SelectItem>
                  <SelectItem value="low">Needs Support</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Options */}
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={exportToPNG}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export as PNG</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={exportToPDF}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export as PDF</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                disabled={zoomLevel <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoomLevel}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                disabled={zoomLevel >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <Slider
                value={[zoomLevel]}
                onValueChange={(value) => setZoomLevel(value[0])}
                min={50}
                max={200}
                step={25}
                className="w-32"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div 
            ref={heatmapRef}
            className="overflow-auto bg-white p-4 rounded-lg border"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
          >
            <div className="min-w-max">
              {/* Header Row */}
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `200px repeat(${skillCategories.length}, 60px)` }}>
                <div className="font-medium text-sm text-gray-700 p-2">Student</div>
                {skillCategories.map((skill) => (
                  <div 
                    key={skill}
                    className="text-xs font-medium text-gray-700 p-2 text-center"
                    style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
              
              {/* Data Rows */}
              <div className="space-y-1">
                {filteredData.map((student) => (
                  <div 
                    key={student.studentId}
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `200px repeat(${skillCategories.length}, 60px)` }}
                  >
                    <div className="font-medium text-sm p-2 truncate bg-gray-50 rounded">
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
                              className={`h-12 w-12 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg ${cellColor}`}
                              onClick={() => onCellClick?.(student.studentId, skill)}
                            >
                              {cellContent}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 max-w-xs">
                              <div className="font-medium">
                                {student.studentName} - {skill}
                              </div>
                              {skillData ? (
                                <>
                                  <div className="text-sm">Score: {skillData.score.toFixed(1)}%</div>
                                  <div className="text-sm">Assessments: {skillData.assessmentCount}</div>
                                  <div className="flex items-center text-sm">
                                    Trend: {getTrendIcon(skillData.trend)}
                                    <span className="ml-1 capitalize">{skillData.trend}</span>
                                  </div>
                                  <div className="text-sm">Last assessed: {skillData.lastAssessed.toLocaleDateString()}</div>
                                </>
                              ) : (
                                <div className="text-gray-500 text-sm">No data available</div>
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
          
          {/* Enhanced Legend */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Legend:</span>
                {viewMode === 'scores' && (
                  <div className="flex items-center space-x-2">
                    {[
                      { range: '90-100', color: getScoreColor(95), label: 'Excellent' },
                      { range: '80-89', color: getScoreColor(85), label: 'Good' },
                      { range: '70-79', color: getScoreColor(75), label: 'Average' },
                      { range: '60-69', color: getScoreColor(65), label: 'Below Avg' },
                      { range: '50-59', color: getScoreColor(55), label: 'Poor' },
                      { range: '0-49', color: getScoreColor(25), label: 'Critical' }
                    ].map(({ range, color, label }) => (
                      <div key={range} className="flex items-center space-x-1">
                        <div className={`w-4 h-4 rounded ${color}`}></div>
                        <span className="text-xs">{range}</span>
                        <span className="text-xs text-gray-500">({label})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {viewMode === 'trends' && (
                  <div className="flex items-center space-x-2">
                    {[
                      { trend: 'up', color: getTrendColor('up'), label: 'Improving', icon: '↑' },
                      { trend: 'stable', color: getTrendColor('stable'), label: 'Stable', icon: '→' },
                      { trend: 'down', color: getTrendColor('down'), label: 'Declining', icon: '↓' }
                    ].map(({ trend, color, label, icon }) => (
                      <div key={trend} className="flex items-center space-x-1">
                        <div className={`w-4 h-4 rounded ${color} flex items-center justify-center text-white text-xs font-bold`}>
                          {icon}
                        </div>
                        <span className="text-xs">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-xs">
                  {filteredData.length} students • {skillCategories.length} skills
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {colorScheme} palette
                </Badge>
              </div>
            </div>

            {/* Accessibility Note */}
            {colorScheme === 'colorblind' && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                ✓ Colorblind-friendly palette active
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PerformanceHeatmapEnhanced;
