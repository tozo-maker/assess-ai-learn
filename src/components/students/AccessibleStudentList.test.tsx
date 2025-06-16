import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, createMockStudents, createMockFunctions } from '@/test/utils';
import AccessibleStudentList from './AccessibleStudentList';

describe('AccessibleStudentList', () => {
  const mockStudents = createMockStudents(10);
  const mockFunctions = createMockFunctions();
  
  const defaultProps = {
    students: mockStudents,
    selectedStudents: [],
    ...mockFunctions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders student list with correct number of students', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      // Should show first 25 students (pagination)
      const studentRows = screen.getAllByRole('listitem');
      expect(studentRows).toHaveLength(10); // We only have 10 mock students
    });

    it('renders loading state correctly', () => {
      render(<AccessibleStudentList {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading student list...')).toBeInTheDocument();
    });

    it('renders empty state when no students', () => {
      render(<AccessibleStudentList {...defaultProps} students={[]} />);
      
      expect(screen.getByText('No students found')).toBeInTheDocument();
    });

    it('displays search input with proper accessibility attributes', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search students');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for the list', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label');
      expect(list).toHaveAttribute('tabIndex', '0');
    });

    it('has proper ARIA attributes for list items', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      const listItems = screen.getAllByRole('listitem');
      listItems.forEach((item, index) => {
        expect(item).toHaveAttribute('id', `item-${index}`);
        expect(item).toHaveAttribute('aria-selected');
        expect(item).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation', async () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      // Test arrow down navigation
      fireEvent.keyDown(list, { key: 'ArrowDown' });
      
      const firstItem = screen.getAllByRole('listitem')[0];
      expect(firstItem).toHaveAttribute('aria-current', 'true');
    });

    it('supports enter key for opening details', async () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      const list = screen.getByRole('list');
      list.focus();
      
      // Navigate to first item and open with enter
      fireEvent.keyDown(list, { key: 'ArrowDown' });
      fireEvent.keyDown(list, { key: 'Enter' });
      
      expect(mockFunctions.onStudentClick).toHaveBeenCalledWith(mockStudents[0].id);
    });
  });

  describe('Search Functionality', () => {
    it('shows search results count', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      expect(screen.getByText(/Select All \(10 of 10 students\)/)).toBeInTheDocument();
    });

    it('displays search input correctly', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search students');
      expect(searchInput).toHaveValue('');
      expect(searchInput).toHaveAttribute('placeholder', 'Search students by name, grade, or ID...');
    });
  });

  describe('Selection Functionality', () => {
    it('calls onSelectStudent when clicking checkbox', async () => {
      const user = userEvent.setup();
      render(<AccessibleStudentList {...defaultProps} />);
      
      const firstCheckbox = screen.getAllByRole('checkbox')[1]; // Skip "Select All" checkbox
      await user.click(firstCheckbox);
      
      expect(mockFunctions.onSelectStudent).toHaveBeenCalledWith(
        mockStudents[0].id,
        true
      );
    });

    it('calls onSelectAll when clicking select all checkbox', async () => {
      const user = userEvent.setup();
      render(<AccessibleStudentList {...defaultProps} />);
      
      const selectAllCheckbox = screen.getByLabelText(/Select all/);
      await user.click(selectAllCheckbox);
      
      expect(mockFunctions.onSelectAll).toHaveBeenCalledWith(true);
    });

    it('shows checked state when all students selected', () => {
      const allStudentIds = mockStudents.map(s => s.id);
      render(
        <AccessibleStudentList 
          {...defaultProps} 
          selectedStudents={allStudentIds} 
        />
      );
      
      const selectAllCheckbox = screen.getByLabelText(/Select all/);
      expect(selectAllCheckbox).toBeChecked();
    });
  });

  describe('Student Row Interactions', () => {
    it('displays student information correctly', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      expect(screen.getByText('Student1 Last1')).toBeInTheDocument();
      expect(screen.getAllByText(/Grade 10/)[0]).toBeInTheDocument();
      expect(screen.getByText(/ID: STU001/)).toBeInTheDocument();
    });

    it('displays performance information', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      // Check for performance badges
      const performanceBadges = screen.getAllByText(/Average|Above Average|Below Average/);
      expect(performanceBadges.length).toBeGreaterThan(0);
    });

    it('shows risk indicators for students needing attention', () => {
      const highRiskStudents = createMockStudents(1);
      if (highRiskStudents[0].performance && !Array.isArray(highRiskStudents[0].performance)) {
        highRiskStudents[0].performance.needs_attention = true;
      }
      
      render(<AccessibleStudentList {...defaultProps} students={highRiskStudents} />);
      
      // Component should handle needs_attention flag appropriately
      expect(screen.getByText('Student1 Last1')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('does not show pagination when students fit on one page', () => {
      render(<AccessibleStudentList {...defaultProps} />);
      
      // With 10 students and 25 per page, no pagination should show
      expect(screen.queryByLabelText(/pagination/)).not.toBeInTheDocument();
    });

    it('shows pagination when students exceed page size', () => {
      const manyStudents = createMockStudents(30);
      render(<AccessibleStudentList {...defaultProps} students={manyStudents} />);
      
      expect(screen.getByLabelText(/pagination/)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time', async () => {
      const manyStudents = createMockStudents(100);
      
      const startTime = performance.now();
      render(<AccessibleStudentList {...defaultProps} students={manyStudents} />);
      const endTime = performance.now();
      
      // Should render within 100ms even with many students
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles large datasets efficiently', () => {
      const manyStudents = createMockStudents(1000);
      
      // Should not crash or hang
      expect(() => {
        render(<AccessibleStudentList {...defaultProps} students={manyStudents} />);
      }).not.toThrow();
      
      // Should only render first page (25 students)
      const studentRows = screen.getAllByRole('listitem');
      expect(studentRows).toHaveLength(25);
    });
  });

  describe('Error Handling', () => {
    it('handles missing performance data gracefully', () => {
      const studentsWithoutPerformance = mockStudents.map(student => ({
        ...student,
        performance: undefined
      }));
      
      expect(() => {
        render(<AccessibleStudentList {...defaultProps} students={studentsWithoutPerformance} />);
      }).not.toThrow();
    });

    it('handles malformed student data gracefully', () => {
      const malformedStudents = [
        {
          ...mockStudents[0],
          first_name: '',
          last_name: ''
        }
      ];
      
      expect(() => {
        render(<AccessibleStudentList {...defaultProps} students={malformedStudents} />);
      }).not.toThrow();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders correctly on different viewport sizes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<AccessibleStudentList {...defaultProps} />);
      
      // Performance info should be present but may be hidden via CSS
      const performanceElements = screen.getAllByText(/Average/);
      expect(performanceElements.length).toBeGreaterThan(0);
    });
  });
}); 