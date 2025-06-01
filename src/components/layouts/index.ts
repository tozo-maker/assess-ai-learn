
// Layout Templates Export
export { StandardPageLayout } from './StandardPageLayout';
export { DashboardLayout, DashboardWidget, DashboardGrid } from './DashboardLayout';
export { FormPageLayout } from './FormPageLayout';
export { ListPageLayout } from './ListPageLayout';

// Re-export existing layouts for backward compatibility
export { default as AppLayout } from './AppLayout';
export { default as LegacyStandardPageLayout } from './StandardPageLayout';

// Types
export type { BreadcrumbItem } from './StandardPageLayout';
