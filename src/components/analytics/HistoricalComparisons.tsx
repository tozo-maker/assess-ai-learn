
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react';
import { assessmentService } from '@/services/assessment-service';

interface HistoricalComparisonsProps {
  students: any[];
  assessments: any[];
}

const HistoricalComparisons: React.FC<HistoricalComparisonsProps> = ({ students, assessments }) => {
  const [comparisonType, setComparisonType] = useState('month_to_month');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [allResponses, setAllResponses] = useState<any[]>([]);

  // Fetch all student responses
  const { data: responsesData, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['allStudentResponses', assessments],
    queryFn: async () => {
      if (!assessments || assessments.length === 0) return [];
      
      const responsesPromises = assessments.map(assessment =>
        assessmentService.getStudentResponses(assessment.id)
      );
      
      const responsesArrays = await Promise.all(responsesPromises);
      return responsesArrays.flat();
    },
    enabled: !!assessments && assessments.length > 0,
  });

  useEffect(() => {
    if (responsesData) {
      setAllResponses(responsesData);
    }
  }, [responsesData]);

  // Filter assessments by subject
  const filteredAssessments = assessments?.filter(assessment => {
    if (selectedSubject !== 'all' && assessment.subject !== selectedSubject) return false;
    return true;
  }) || [];

  const filteredResponses = allResponses?.filter(response =>
    filteredAssessments.some(assessment => assessment.id === response.assessment_id)
  ) || [];

  // Calculate historical comparisons
  const calculateHistoricalComparisons = () => {
    if (!filteredAssessments.length || !filteredResponses.length) {
      return {
        monthToMonth: [],
        yearToYear: [],
        seasonalPatterns: [],
        interventionAnalysis: []
      };
    }

    const now = new Date();
    
    // Group assessments by time periods
    const getTimeGrouping = (date: string, type: string) => {
      const d = new Date(date);
      switch (type) {
        case 'month_to_month':
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        case 'year_to_year':
          return d.getFullYear().toString();
        case 'seasonal':
          const month = d.getMonth();
          if (month >= 8 && month <= 11) return 'Fall';
          if (month >= 0 && month <= 2) return 'Winter';
          if (month >= 3 && month <= 5) return 'Spring';
          return 'Summer';
        default:
          return date;
      }
    };

    // Month-to-month comparison
    const monthlyData = new Map();
    filteredAssessments.forEach(assessment => {
      if (!assessment.assessment_date) return;
      
      const monthKey = getTimeGrouping(assessment.assessment_date, 'month_to_month');
      const responses = filteredResponses.filter(r => r.assessment_id === assessment.id);
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { assessments: [], responses: [], subjects: new Set() });
      }
      
      monthlyData.get(monthKey).assessments.push(assessment);
      monthlyData.get(monthKey).responses.push(...responses);
      monthlyData.get(monthKey).subjects.add(assessment.subject);
    });

    const monthToMonth = Array.from(monthlyData.entries())
      .map(([month, data]) => {
        const scores = data.responses.map((r: any) => {
          const assessment = data.assessments.find((a: any) => a.id === r.assessment_id);
          return assessment ? (r.score / assessment.max_score) * 100 : 0;
        });
        
        const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        
        return {
          period: month,
          average: Math.round(average),
          assessmentCount: data.assessments.length,
          studentParticipation: new Set(data.responses.map((r: any) => r.student_id)).size,
          subjects: Array.from(data.subjects)
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));

    // Calculate trends for month-to-month
    const monthTrends = monthToMonth.map((month, index) => {
      const previousMonth = index > 0 ? monthToMonth[index - 1] : null;
      const trend = previousMonth ? month.average - previousMonth.average : 0;
      
      return {
        ...month,
        trend: Math.round(trend),
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
      };
    });

    // Year-to-year comparison
    const yearlyData = new Map();
    filteredAssessments.forEach(assessment => {
      if (!assessment.assessment_date) return;
      
      const yearKey = getTimeGrouping(assessment.assessment_date, 'year_to_year');
      const responses = filteredResponses.filter(r => r.assessment_id === assessment.id);
      
      if (!yearlyData.has(yearKey)) {
        yearlyData.set(yearKey, { assessments: [], responses: [] });
      }
      
      yearlyData.get(yearKey).assessments.push(assessment);
      yearlyData.get(yearKey).responses.push(...responses);
    });

    const yearToYear = Array.from(yearlyData.entries())
      .map(([year, data]) => {
        const scores = data.responses.map((r: any) => {
          const assessment = data.assessments.find((a: any) => a.id === r.assessment_id);
          return assessment ? (r.score / assessment.max_score) * 100 : 0;
        });
        
        const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        
        return {
          year,
          average: Math.round(average),
          assessmentCount: data.assessments.length,
          studentCount: new Set(data.responses.map((r: any) => r.student_id)).size
        };
      })
      .sort((a, b) => a.year.localeCompare(b.year));

    // Seasonal patterns
    const seasonalData = new Map();
    filteredAssessments.forEach(assessment => {
      if (!assessment.assessment_date) return;
      
      const seasonKey = getTimeGrouping(assessment.assessment_date, 'seasonal');
      const responses = filteredResponses.filter(r => r.assessment_id === assessment.id);
      
      if (!seasonalData.has(seasonKey)) {
        seasonalData.set(seasonKey, { assessments: [], responses: [] });
      }
      
      seasonalData.get(seasonKey).assessments.push(assessment);
      seasonalData.get(seasonKey).responses.push(...responses);
    });

    const seasonalPatterns = Array.from(seasonalData.entries())
      .map(([season, data]) => {
        const scores = data.responses.map((r: any) => {
          const assessment = data.assessments.find((a: any) => a.id === r.assessment_id);
          return assessment ? (r.score / assessment.max_score) * 100 : 0;
        });
        
        const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
        
        return {
          season,
          average: Math.round(average),
          assessmentCount: data.assessments.length,
          pattern: average > 80 ? 'Strong' : average > 70 ? 'Good' : 'Needs Improvement'
        };
      });

    return {
      monthToMonth: monthTrends,
      yearToYear,
      seasonalPatterns,
      interventionAnalysis: [] // Placeholder for intervention tracking
    };
  };

  const historicalData = calculateHistoricalComparisons();

  const exportHistoricalData = () => {
    let csvData: any[] = [];
    
    switch (comparisonType) {
      case 'month_to_month':
        csvData = historicalData.monthToMonth.map(month => ({
          'Period': month.period,
          'Average Score': `${month.average}%`,
          'Trend': `${month.trend > 0 ? '+' : ''}${month.trend}%`,
          'Assessments': month.assessmentCount,
          'Student Participation': month.studentParticipation,
          'Subjects': month.subjects.join(', ')
        }));
        break;
      case 'year_to_year':
        csvData = historicalData.yearToYear.map(year => ({
          'Year': year.year,
          'Average Score': `${year.average}%`,
          'Assessments': year.assessmentCount,
          'Students': year.studentCount
        }));
        break;
      case 'seasonal':
        csvData = historicalData.seasonalPatterns.map(season => ({
          'Season': season.season,
          'Average Score': `${season.average}%`,
          'Pattern': season.pattern,
          'Assessments': season.assessmentCount
        }));
        break;
    }

    if (csvData.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8," + 
      Object.keys(csvData[0]).join(",") + "\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historical_comparison_${comparisonType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingResponses) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={comparisonType} onValueChange={setComparisonType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Comparison Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month_to_month">Month to Month</SelectItem>
              <SelectItem value="year_to_year">Year to Year</SelectItem>
              <SelectItem value="seasonal">Seasonal Patterns</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {[...new Set(assessments?.map(a => a.subject) || [])].map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={exportHistoricalData} variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </Button>
      </div>

      {/* Month-to-Month Comparison */}
      {comparisonType === 'month_to_month' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Month-to-Month Performance</span>
            </CardTitle>
            <CardDescription>
              Track performance changes over consecutive months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historicalData.monthToMonth.length > 0 ? (
              <div className="space-y-4">
                {historicalData.monthToMonth.map((month, index) => (
                  <div key={month.period} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{month.period}</h4>
                      <p className="text-sm text-gray-600">
                        {month.assessmentCount} assessments • {month.studentParticipation} students
                      </p>
                      <p className="text-xs text-gray-500">
                        Subjects: {month.subjects.join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{month.average}%</div>
                        {month.trend !== 0 && (
                          <div className={`flex items-center text-sm ${
                            month.trendDirection === 'up' ? 'text-green-600' : 
                            month.trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {month.trendDirection === 'up' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : month.trendDirection === 'down' ? (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            ) : null}
                            {month.trend > 0 ? '+' : ''}{month.trend}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No monthly data available for the selected criteria.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Year-to-Year Comparison */}
      {comparisonType === 'year_to_year' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Year-to-Year Performance</span>
            </CardTitle>
            <CardDescription>
              Compare academic performance across different years
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historicalData.yearToYear.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historicalData.yearToYear.map((year, index) => {
                  const previousYear = index > 0 ? historicalData.yearToYear[index - 1] : null;
                  const yearlyTrend = previousYear ? year.average - previousYear.average : 0;
                  
                  return (
                    <div key={year.year} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{year.year}</h4>
                        {yearlyTrend !== 0 && (
                          <Badge variant={yearlyTrend > 0 ? 'default' : 'destructive'}>
                            {yearlyTrend > 0 ? '+' : ''}{Math.round(yearlyTrend)}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{year.average}%</div>
                        <div className="text-sm text-gray-600">
                          <p>{year.assessmentCount} assessments</p>
                          <p>{year.studentCount} students</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No yearly data available for comparison.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seasonal Patterns */}
      {comparisonType === 'seasonal' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Seasonal Performance Patterns</span>
            </CardTitle>
            <CardDescription>
              Identify patterns in performance across different seasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historicalData.seasonalPatterns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Fall', 'Winter', 'Spring', 'Summer'].map(season => {
                  const seasonData = historicalData.seasonalPatterns.find(s => s.season === season);
                  
                  return (
                    <div key={season} className={`p-4 border rounded-lg ${
                      seasonData ? 'bg-white' : 'bg-gray-50 opacity-50'
                    }`}>
                      <h4 className="font-medium mb-2">{season}</h4>
                      
                      {seasonData ? (
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">{seasonData.average}%</div>
                          <Badge variant={
                            seasonData.pattern === 'Strong' ? 'default' :
                            seasonData.pattern === 'Good' ? 'secondary' : 'outline'
                          }>
                            {seasonData.pattern}
                          </Badge>
                          <p className="text-sm text-gray-600">
                            {seasonData.assessmentCount} assessments
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No data available</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No seasonal data available for analysis.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key takeaways from historical performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisonType === 'month_to_month' && historicalData.monthToMonth.length > 0 && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-2">Monthly Trend</h5>
                  <p className="text-sm text-blue-700">
                    {(() => {
                      const recentMonths = historicalData.monthToMonth.slice(-3);
                      const positiveTrends = recentMonths.filter(m => m.trend > 0).length;
                      
                      if (positiveTrends >= 2) {
                        return "📈 Consistent improvement over recent months!";
                      } else if (positiveTrends === 1) {
                        return "📊 Mixed performance with some improvement.";
                      } else {
                        return "📉 Focus needed to reverse declining trend.";
                      }
                    })()}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h5 className="font-medium text-green-800 mb-2">Best Performing Month</h5>
                  <p className="text-sm text-green-700">
                    {(() => {
                      const bestMonth = historicalData.monthToMonth.reduce((best, current) => 
                        current.average > best.average ? current : best
                      );
                      return `${bestMonth.period}: ${bestMonth.average}% average`;
                    })()}
                  </p>
                </div>
              </>
            )}
            
            {comparisonType === 'seasonal' && historicalData.seasonalPatterns.length > 0 && (
              <>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-2">Strongest Season</h5>
                  <p className="text-sm text-purple-700">
                    {(() => {
                      const bestSeason = historicalData.seasonalPatterns.reduce((best, current) => 
                        current.average > best.average ? current : best
                      );
                      return `${bestSeason.season}: ${bestSeason.average}% average performance`;
                    })()}
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h5 className="font-medium text-orange-800 mb-2">Growth Opportunity</h5>
                  <p className="text-sm text-orange-700">
                    {(() => {
                      const weakestSeason = historicalData.seasonalPatterns.reduce((worst, current) => 
                        current.average < worst.average ? current : worst
                      );
                      return `${weakestSeason.season} needs attention (${weakestSeason.average}% average)`;
                    })()}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoricalComparisons;
