# LearnSpark AI - Component Library Documentation

## Overview

LearnSpark AI uses a comprehensive design system with reusable components built on top of shadcn/ui and Tailwind CSS. This documentation provides detailed information about all available components, their props, usage patterns, and design guidelines.

## Design System Foundation

### Color System

Our semantic color system ensures consistency and accessibility across the application:

```typescript
// Semantic colors available in the design system
const semanticColors = {
  primary: '#2563eb',    // Main brand color
  success: '#10b981',    // Success states
  warning: '#f59e0b',    // Warning states
  danger: '#ef4444',     // Error states
  info: '#3b82f6',       // Informational states
  neutral: '#6b7280'     // Neutral states
}
```

### Typography Scale

```css
/* Typography classes */
.text-display-lg    /* 48px, bold - Hero headings */
.text-display-md    /* 36px, bold - Page titles */
.text-display-sm    /* 30px, bold - Section headers */
.text-heading-lg    /* 24px, semibold - Card titles */
.text-heading-md    /* 20px, medium - Subsection headers */
.text-heading-sm    /* 18px, medium - Component titles */
.text-body-lg       /* 16px, normal - Body text */
.text-body-md       /* 14px, normal - Secondary text */
.text-body-sm       /* 12px, normal - Captions */
```

### Spacing System

```css
/* Consistent spacing using CSS variables */
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
```

## Core Components

### Enhanced Button

An enhanced button component with accessibility features and semantic variants.

```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  shortcut?: string
  tooltip?: string
}
```

**Usage:**
```tsx
import { EnhancedButton } from '@/components/ui/enhanced-button'

// Basic usage
<EnhancedButton variant="primary">Save Changes</EnhancedButton>

// With loading state
<EnhancedButton loading={isSubmitting} loadingText="Saving...">
  Submit
</EnhancedButton>

// With keyboard shortcut
<EnhancedButton shortcut="s" tooltip="Save (Ctrl+S)">
  Save
</EnhancedButton>

// With icon
<EnhancedButton icon={<Plus className="h-4 w-4" />} variant="success">
  Add Student
</EnhancedButton>
```

### Enhanced Loading States

Comprehensive loading components with accessibility support.

```typescript
interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}
```

**Usage:**
```tsx
import { EnhancedLoadingState, ProgressLoading, StatusIndicator } from '@/components/common/EnhancedLoadingStates'

// Basic loading spinner
<EnhancedLoadingState message="Loading students..." />

// Progress indicator
<ProgressLoading progress={75} message="Analyzing assessment data" />

// Status indicator
<StatusIndicator status="loading" message="Generating insights..." />
```

### Enhanced Empty States

Contextual empty states for different scenarios.

```typescript
interface EmptyStateProps {
  variant?: 'default' | 'search' | 'error' | 'permission'
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}
```

**Usage:**
```tsx
import { EmptyStudentsState, EmptyAssessmentsState, EmptySearchState } from '@/components/common/EnhancedEmptyStates'

// Specific empty states
<EmptyStudentsState 
  onAddStudent={() => navigate('/students/new')}
  onImportStudents={() => setShowImport(true)}
/>

<EmptyAssessmentsState 
  onCreateAssessment={() => navigate('/assessments/new')}
/>

// Search results
<EmptySearchState 
  searchTerm={query}
  onClearSearch={() => setQuery('')}
/>
```

### Enhanced Error States

Comprehensive error handling with recovery options.

```typescript
interface ErrorStateProps {
  type?: 'network' | 'server' | 'validation' | 'permission' | 'generic'
  title?: string
  message?: string
  details?: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary' | 'destructive'
    icon?: React.ReactNode
  }>
  showDetails?: boolean
}
```

**Usage:**
```tsx
import { EnhancedErrorState, InlineError, SuccessMessage } from '@/components/common/EnhancedErrorStates'

// Network error with retry
<EnhancedErrorState 
  type="network"
  actions={[
    { label: 'Retry', onClick: refetch, icon: <RefreshCw /> }
  ]}
/>

// Inline form error
<InlineError message="Please enter a valid email address" />

// Success message
<SuccessMessage 
  message="Student added successfully"
  onDismiss={() => setShowSuccess(false)}
/>
```

## Accessibility Components

### AccessibilityProvider

Provides accessibility context and features throughout the application.

```typescript
interface AccessibilityContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
}
```

**Usage:**
```tsx
import { AccessibilityProvider, useAccessibility } from '@/components/accessibility/AccessibilityProvider'

// Wrap your app
<AccessibilityProvider>
  <App />
</AccessibilityProvider>

// Use in components
const { announceMessage, reducedMotion } = useAccessibility()
```

### Keyboard Navigation

Components for enhanced keyboard navigation support.

```tsx
import { FocusTrap, RovingTabIndex, AccessibleButton } from '@/components/accessibility/KeyboardNavigation'

// Focus trap for modals
<FocusTrap active={isModalOpen}>
  <Modal>
    {/* Modal content */}
  </Modal>
</FocusTrap>

// Roving tab index for lists
<RovingTabIndex orientation="vertical">
  {items.map(item => (
    <div key={item.id} data-roving-tabindex-item>
      {item.name}
    </div>
  ))}
</RovingTabIndex>

// Accessible button with shortcuts
<AccessibleButton
  shortcut="n"
  description="Create a new student record"
  onClick={handleCreate}
>
  New Student
</AccessibleButton>
```

## Form Components

### Accessible Form Groups

Enhanced form components with built-in accessibility.

```tsx
import { AccessibleFormGroup } from '@/components/accessibility/KeyboardNavigation'

<AccessibleFormGroup
  label="Student Name"
  description="Enter the student's full name"
  error={errors.name}
  required
>
  <Input placeholder="John Doe" />
</AccessibleFormGroup>
```

## Advanced Components

### Analytics Dashboard

Comprehensive analytics and monitoring dashboard.

```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

// Full analytics dashboard
<AnalyticsDashboard />
```

### Comprehensive Audit Report

Development tool for tracking implementation progress.

```tsx
import { ComprehensiveAuditReport } from '@/components/audit/ComprehensiveAuditReport'

// Development audit tracking
<ComprehensiveAuditReport />
```

## Hooks and Services

### Analytics Service

```typescript
import { useAnalytics } from '@/services/analytics-service'

const { 
  trackPageView, 
  trackClick, 
  trackFormSubmission,
  trackFeatureUsage 
} = useAnalytics()

// Track user interactions
trackPageView('/dashboard')
trackClick('add-student-button', '/students')
trackFormSubmission('student-form', '/students/new')
trackFeatureUsage('assessment-wizard', '/assessments')
```

### Optimized Components Hook

```typescript
import { useOptimizedComponents } from '@/hooks/useOptimizedComponents'

const {
  MemoizedCard,
  OptimizedList,
  useMemoizedCallback,
  useOptimizedEffect
} = useOptimizedComponents()
```

### Unified State Management

```typescript
import { useUnifiedState } from '@/hooks/useUnifiedState'

const [state, setState, { isLoading, error, reset }] = useUnifiedState({
  initialValue: '',
  validation: (value) => value.length > 0,
  persistKey: 'form-data'
})
```

## Design Patterns

### Loading Patterns

```tsx
// Page-level loading
<EnhancedLoadingState variant="skeleton" />

// Component-level loading
<EnhancedButton loading={isSubmitting}>Save</EnhancedButton>

// Progress indicators
<ProgressLoading progress={uploadProgress} />
```

### Error Patterns

```tsx
// Page-level errors
<EnhancedErrorState type="network" />

// Form validation errors
<InlineError message="Invalid email format" />

// Success feedback
<SuccessMessage message="Changes saved successfully" />
```

### Empty State Patterns

```tsx
// No data scenarios
<EmptyStudentsState onAddStudent={handleAdd} />

// Search results
<EmptySearchState searchTerm={query} onClearSearch={clearSearch} />

// Permission denied
<PermissionDeniedState resource="student data" />
```

## Styling Guidelines

### Using Semantic Colors

```tsx
// Use semantic color utilities
<div className="bg-semantic-success text-semantic-success-foreground">
  Success state
</div>

<Button variant="danger">Delete</Button>
```

### Responsive Design

```tsx
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Animation and Motion

```tsx
// Respect motion preferences
<div className={cn(
  "transition-all duration-300",
  reducedMotion && "transition-none"
)}>
  Animated content
</div>
```

## Best Practices

### Component Development

1. **Always use TypeScript interfaces** for props
2. **Include accessibility attributes** (ARIA labels, roles)
3. **Support keyboard navigation** where applicable
4. **Handle loading and error states** appropriately
5. **Use semantic HTML elements** when possible
6. **Test with screen readers** for critical components

### Performance Optimization

1. **Use React.memo** for expensive components
2. **Implement useCallback** for event handlers
3. **Use useMemo** for expensive calculations
4. **Lazy load** non-critical components
5. **Optimize images** and assets

### Accessibility Requirements

1. **Color contrast** must meet WCAG AA standards
2. **Focus indicators** must be visible and clear
3. **Screen reader support** for all interactive elements
4. **Keyboard navigation** for all functionality
5. **Motion preferences** must be respected

### Error Handling

1. **Provide clear error messages** with actionable guidance
2. **Include recovery options** when possible
3. **Log errors** for monitoring and debugging
4. **Graceful degradation** for non-critical features
5. **User-friendly language** instead of technical jargon

## Component Testing

### Testing Patterns

```typescript
// Example test for enhanced button
import { render, screen, fireEvent } from '@testing-library/react'
import { EnhancedButton } from '@/components/ui/enhanced-button'

test('enhanced button handles loading state', () => {
  render(
    <EnhancedButton loading loadingText="Saving...">
      Save
    </EnhancedButton>
  )
  
  expect(screen.getByText('Saving...')).toBeInTheDocument()
  expect(screen.getByRole('button')).toBeDisabled()
})
```

### Accessibility Testing

```typescript
// Test keyboard navigation
test('button supports keyboard shortcuts', () => {
  const handleClick = jest.fn()
  render(<EnhancedButton shortcut="s" onClick={handleClick}>Save</EnhancedButton>)
  
  fireEvent.keyDown(document, { key: 's', ctrlKey: true })
  expect(handleClick).toHaveBeenCalled()
})
```

## Migration Guide

### From Basic Components

```tsx
// Before: Basic button
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Save
</button>

// After: Enhanced button
<EnhancedButton variant="primary">
  Save
</EnhancedButton>
```

### From Custom Loading States

```tsx
// Before: Custom spinner
<div className="flex items-center">
  <Loader2 className="animate-spin" />
  <span>Loading...</span>
</div>

// After: Enhanced loading
<EnhancedLoadingState message="Loading..." />
```

This documentation serves as a comprehensive guide for using the LearnSpark AI component library. All components are designed with accessibility, performance, and user experience in mind.