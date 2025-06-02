
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Filter } from 'lucide-react';

// Design System Components
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSBodyText
} from '@/components/ui/design-system';

// Original Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface StudentResult {
  id: string;
  firstName: string;
  lastName: string;
  score: number;
  percentage: number;
  status: 'completed' | 'incomplete' | 'needs-attention';
  itemScores?: Array<{
    itemNumber: number;
    score: number;
    maxScore: number;
  }>;
}

interface AssessmentResultsTableProps {
  results: StudentResult[];
  onExport?: (format: 'csv' | 'pdf') => void;
}

const AssessmentResultsTable: React.FC<AssessmentResultsTableProps> = ({
  results,
  onExport
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string, percentage: number) => {
    if (status === 'incomplete') {
      return <Badge className="bg-[#6b7280] text-white">Incomplete</Badge>;
    }
    
    if (percentage >= 80) {
      return <Badge className="bg-[#10b981] text-white">Proficient</Badge>;
    } else if (percentage >= 65) {
      return <Badge className="bg-[#f59e0b] text-white">Developing</Badge>;
    } else {
      return <Badge className="bg-[#ef4444] text-white">Needs Support</Badge>;
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-[#10b981]';
    if (percentage >= 65) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  return (
    <DSCard>
      <DSCardHeader>
        <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
          <DSCardTitle className="text-lg font-semibold text-gray-900">Student Results</DSCardTitle>
          <DSFlexContainer gap="sm" className="flex-wrap">
            <DSButton variant="secondary" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </DSButton>
            <DSButton 
              variant="secondary" 
              size="sm"
              onClick={() => onExport?.('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </DSButton>
            <DSButton 
              variant="secondary" 
              size="sm"
              onClick={() => onExport?.('pdf')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </DSButton>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-8"></TableHead>
              <TableHead className="font-medium text-gray-700">Student</TableHead>
              <TableHead className="font-medium text-gray-700">Score</TableHead>
              <TableHead className="font-medium text-gray-700">Percentage</TableHead>
              <TableHead className="font-medium text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <React.Fragment key={result.id}>
                <Collapsible 
                  open={expandedRows.has(result.id)}
                  onOpenChange={() => toggleRow(result.id)}
                >
                  <CollapsibleTrigger asChild>
                    <TableRow className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                      <TableCell>
                        {expandedRows.has(result.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {result.firstName} {result.lastName}
                      </TableCell>
                      <TableCell className="text-gray-700">{result.score}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getPerformanceColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(result.status, result.percentage)}
                      </TableCell>
                    </TableRow>
                  </CollapsibleTrigger>
                  
                  {result.itemScores && (
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={5} className="bg-gray-50 border-t">
                          <div className="py-4 transition-all duration-300">
                            <DSBodyText className="font-medium text-gray-700 mb-3">Item-by-Item Breakdown</DSBodyText>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {result.itemScores.map((item) => (
                                <div key={item.itemNumber} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                                  <DSBodyText className="font-medium text-gray-700">Item {item.itemNumber}</DSBodyText>
                                  <span className={`text-sm font-semibold ${
                                    (item.score / item.maxScore) >= 0.8 ? 'text-[#10b981]' : 
                                    (item.score / item.maxScore) >= 0.6 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                                  }`}>
                                    {item.score}/{item.maxScore}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </DSCardContent>
    </DSCard>
  );
};

export default AssessmentResultsTable;
