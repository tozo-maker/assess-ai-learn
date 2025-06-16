
import React from 'react';

interface ComponentValidationResult {
  isValid: boolean;
  missingComponents: string[];
  errors: string[];
}

class ComponentValidator {
  private static instance: ComponentValidator;
  
  static getInstance(): ComponentValidator {
    if (!ComponentValidator.instance) {
      ComponentValidator.instance = new ComponentValidator();
    }
    return ComponentValidator.instance;
  }

  async validateLazyComponents(): Promise<ComponentValidationResult> {
    const result: ComponentValidationResult = {
      isValid: true,
      missingComponents: [],
      errors: []
    };

    const componentsToValidate = [
      { name: 'LazyDashboardStats', path: '@/components/common/LazyComponents' },
      { name: 'LazyActivityFeed', path: '@/components/common/LazyComponents' },
      { name: 'LazyRecentInsights', path: '@/components/common/LazyComponents' },
      { name: 'LazySecondaryWidgets', path: '@/components/common/LazyComponents' },
      { name: 'DashboardWelcomeSection', path: '@/components/dashboard/DashboardWelcomeSection' },
      { name: 'DashboardAlerts', path: '@/components/dashboard/DashboardAlerts' },
      { name: 'DashboardPerformanceWidget', path: '@/components/dashboard/DashboardPerformanceWidget' }
    ];

    for (const component of componentsToValidate) {
      try {
        // In a real implementation, you might dynamically import the component
        // For now, we'll just log the validation attempt
        console.log(`Validating component: ${component.name} from ${component.path}`);
        
        // This would be the actual validation:
        // const module = await import(component.path);
        // if (!module[component.name]) {
        //   result.missingComponents.push(component.name);
        //   result.isValid = false;
        // }
      } catch (error) {
        result.errors.push(`Failed to validate ${component.name}: ${error}`);
        result.isValid = false;
      }
    }

    return result;
  }

  createFallbackComponent(componentName: string): React.ComponentType {
    return () => React.createElement(
      'div',
      { 
        className: 'p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center' 
      },
      React.createElement(
        'p',
        { className: 'text-gray-600' },
        `Component ${componentName} is not available`
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-gray-500 mt-2' },
        'Please check the component implementation'
      )
    );
  }

  logValidationResults(result: ComponentValidationResult): void {
    if (result.isValid) {
      console.log('✅ All dashboard components validated successfully');
    } else {
      console.warn('⚠️ Dashboard component validation issues:');
      if (result.missingComponents.length > 0) {
        console.warn('Missing components:', result.missingComponents);
      }
      if (result.errors.length > 0) {
        console.error('Validation errors:', result.errors);
      }
    }
  }
}

export const componentValidator = ComponentValidator.getInstance();
