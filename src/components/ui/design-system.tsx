
// Component aliases for design system migration
// This allows gradual transition from old to new components

// Export redesigned components with standard names for easy migration
export { ButtonRedesigned as DSButton } from './button-redesigned';
export { 
  CardRedesigned as DSCard,
  CardHeaderRedesigned as DSCardHeader,
  CardContentRedesigned as DSCardContent,
  CardFooterRedesigned as DSCardFooter,
  CardTitleRedesigned as DSCardTitle,
  CardDescriptionRedesigned as DSCardDescription
} from './card-redesigned';
export {
  InputRedesigned as DSInput,
  LabelRedesigned as DSLabel,
  TextareaRedesigned as DSTextarea,
  FormFieldRedesigned as DSFormField
} from './form-redesigned';
export {
  PageTitle as DSPageTitle,
  SectionHeader as DSSectionHeader,
  SubsectionHeader as DSSubsectionHeader,
  BodyText as DSBodyText,
  HelpText as DSHelpText,
  CaptionText as DSCaptionText
} from './typography';
export {
  PageContainer as DSPageContainer,
  Section as DSSection,
  ContentGrid as DSContentGrid,
  GridItem as DSGridItem,
  Spacer as DSSpacer,
  FlexContainer as DSFlexContainer
} from './layout-redesigned';

// Re-export original components for backward compatibility
export { Button } from './button';
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './card';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
