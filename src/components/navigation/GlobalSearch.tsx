
import React, { useState, useRef, useEffect } from 'react';
import { Search, Users, FileText, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'student' | 'assessment' | 'report';
  href: string;
  description?: string;
}

// Mock search results - replace with actual search logic
const mockResults: SearchResult[] = [
  { id: '1', title: 'Sarah Johnson', type: 'student', href: '/app/students/1', description: 'Grade 5 - Math' },
  { id: '2', title: 'Math Assessment #3', type: 'assessment', href: '/app/assessments/2', description: 'Fractions and Decimals' },
  { id: '3', title: 'Class Progress Report', type: 'report', href: '/app/reports/3', description: 'September 2024' },
];

const getResultIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'student':
      return Users;
    case 'assessment':
      return FileText;
    case 'report':
      return BarChart3;
    default:
      return FileText;
  }
};

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate search
  useEffect(() => {
    if (query.length > 1) {
      const filtered = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            window.location.href = results[selectedIndex].href;
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-96">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search students, assessments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          className="pl-10 pr-4 h-10 bg-white border-gray-300 focus:border-[#2563eb] focus:ring-[#2563eb]/20"
        />
      </div>

      {/* Search Results Dropdown - Design System Card Styling */}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-gray-200">
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => {
                const Icon = getResultIcon(result.type);
                return (
                  <a
                    key={result.id}
                    href={result.href}
                    className={cn(
                      "flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0",
                      selectedIndex === index && "bg-[#2563eb]/5"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <Icon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 capitalize ml-2">
                      {result.type}
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results - Design System Styling */}
      {isOpen && query.length > 1 && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-gray-200">
          <CardContent className="p-4 text-center text-gray-500 text-sm">
            No results found for "{query}"
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
