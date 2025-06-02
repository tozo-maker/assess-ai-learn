
import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, Plus, Users, FileText, BarChart3, Settings, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'student' | 'assessment' | 'report' | 'action';
  category: 'Students' | 'Assessments' | 'Reports' | 'Quick Actions';
  href?: string;
  action?: () => void;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const EnhancedGlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick actions that are always available
  const quickActions: SearchResult[] = [
    {
      id: 'add-student',
      title: 'Add Student',
      type: 'action',
      category: 'Quick Actions',
      action: () => navigate('/app/students/add'),
      description: 'Register a new student to your class',
      icon: <Users className="h-4 w-4" />,
      shortcut: 'Alt+S'
    },
    {
      id: 'create-assessment',
      title: 'Create Assessment',
      type: 'action',
      category: 'Quick Actions',
      action: () => navigate('/app/assessments/add'),
      description: 'Design a new assessment',
      icon: <FileText className="h-4 w-4" />,
      shortcut: 'Alt+A'
    },
    {
      id: 'view-insights',
      title: 'View Class Insights',
      type: 'action',
      category: 'Quick Actions',
      action: () => navigate('/app/insights/class'),
      description: 'AI-powered analytics and recommendations',
      icon: <BarChart3 className="h-4 w-4" />,
      shortcut: 'Alt+I'
    },
    {
      id: 'settings',
      title: 'Settings',
      type: 'action',
      category: 'Quick Actions',
      action: () => navigate('/app/settings/profile'),
      description: 'Manage your profile and preferences',
      icon: <Settings className="h-4 w-4" />
    }
  ];

  // Mock search results - in real app, this would come from an API
  const mockSearchData: SearchResult[] = [
    {
      id: '1',
      title: 'Sarah Johnson',
      type: 'student',
      category: 'Students',
      href: '/app/students/1',
      description: 'Grade 5 - Mathematics',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: '2',
      title: 'Math Assessment #3',
      type: 'assessment',
      category: 'Assessments',
      href: '/app/assessments/2',
      description: 'Fractions and Decimals - Due Tomorrow',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: '3',
      title: 'September Progress Report',
      type: 'report',
      category: 'Reports',
      href: '/app/reports/3',
      description: 'Class performance summary',
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  // Search logic
  useEffect(() => {
    if (query.length === 0) {
      setResults(quickActions);
    } else {
      const searchResults = [
        ...mockSearchData.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
        ),
        ...quickActions.filter(action =>
          action.title.toLowerCase().includes(query.toLowerCase()) ||
          action.description?.toLowerCase().includes(query.toLowerCase())
        )
      ];
      setResults(searchResults);
    }
    setSelectedIndex(-1);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }

      // Quick action shortcuts
      if (e.altKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            navigate('/app/students/add');
            break;
          case 'a':
            e.preventDefault();
            navigate('/app/assessments/add');
            break;
          case 'i':
            e.preventDefault();
            navigate('/app/insights/class');
            break;
        }
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            const result = results[selectedIndex];
            if (result.action) {
              result.action();
            } else if (result.href) {
              navigate(result.href);
            }
            setIsOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setQuery('');
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.href) {
      navigate(result.href);
    }
    setIsOpen(false);
    setQuery('');
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      {/* Search Input */}
      <div ref={searchRef} className="relative w-96">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or press Cmd+K..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "w-full pl-10 pr-12 h-10 rounded-lg border border-gray-300 bg-white",
              "focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20",
              "placeholder:text-gray-500 text-sm",
              designSystem.transitions.normal
            )}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Command Palette Dropdown */}
        {isOpen && (
          <DSCard className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-gray-200 max-h-96 overflow-hidden">
            <DSCardContent className="p-0">
              {results.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <DSBodyText className="text-gray-600 mb-2">
                    No results found
                  </DSBodyText>
                  <DSHelpText>
                    Try searching for students, assessments, or reports
                  </DSHelpText>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {Object.entries(groupedResults).map(([category, categoryResults]) => (
                    <div key={category}>
                      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                        <DSHelpText className="font-medium text-gray-700">
                          {category}
                        </DSHelpText>
                      </div>
                      {categoryResults.map((result, index) => {
                        const globalIndex = results.indexOf(result);
                        return (
                          <div
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              "flex items-center px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0",
                              designSystem.transitions.normal,
                              "hover:bg-gray-50",
                              selectedIndex === globalIndex && "bg-[#2563eb]/5 border-[#2563eb]/20"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg mr-3",
                              selectedIndex === globalIndex 
                                ? `${designSystem.colors.primary.light} ${designSystem.colors.primary.text}`
                                : "bg-gray-100 text-gray-600"
                            )}>
                              {result.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <DSFlexContainer justify="between" align="center">
                                <div className="min-w-0 flex-1">
                                  <DSBodyText className="font-medium text-gray-900 truncate">
                                    {result.title}
                                  </DSBodyText>
                                  {result.description && (
                                    <DSHelpText className="truncate">
                                      {result.description}
                                    </DSHelpText>
                                  )}
                                </div>
                                <DSFlexContainer gap="sm" className="ml-3">
                                  {result.shortcut && (
                                    <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600">
                                      {result.shortcut}
                                    </kbd>
                                  )}
                                  <ArrowRight className="h-4 w-4 text-gray-400" />
                                </DSFlexContainer>
                              </DSFlexContainer>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Footer with keyboard hints */}
              <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                <DSFlexContainer justify="between" align="center">
                  <DSHelpText>
                    <kbd className="px-1 py-0.5 text-xs bg-white border border-gray-300 rounded mr-1">↑↓</kbd>
                    to navigate
                  </DSHelpText>
                  <DSHelpText>
                    <kbd className="px-1 py-0.5 text-xs bg-white border border-gray-300 rounded mr-1">Enter</kbd>
                    to select
                  </DSHelpText>
                  <DSHelpText>
                    <kbd className="px-1 py-0.5 text-xs bg-white border border-gray-300 rounded mr-1">Esc</kbd>
                    to close
                  </DSHelpText>
                </DSFlexContainer>
              </div>
            </DSCardContent>
          </DSCard>
        )}
      </div>
    </>
  );
};

export default EnhancedGlobalSearch;
