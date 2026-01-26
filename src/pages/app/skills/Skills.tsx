
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useSkillsInitialization } from '@/hooks/useSkillsInitialization';
import { useSkillsData } from '@/hooks/useSkillsData';
import SkillsFilters from '@/components/skills/SkillsFilters';
import SkillsTable from '@/components/skills/SkillsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { skillsSeedingService } from '@/services/skills-seeding-service';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Skills: React.FC = () => {
  const { 
    isLoading: isInitializing, 
    hasSkills, 
    skillsCount, 
    seedingResult, 
    status,
    errors,
    refetchSkills,
    debugInfo 
  } = useSkillsInitialization();
  
  const { skills, filteredSkills, isLoading: isLoadingSkills, filters, setFilters } = useSkillsData();
  const { toast } = useToast();

  const isLoading = isInitializing || isLoadingSkills;

  const handleSeedSkills = async () => {
    try {
      toast({
        title: "Seeding Skills",
        description: "Adding skills to database...",
      });
      
      await skillsSeedingService.seedBasicSkills();
      
      toast({
        title: "Success",
        description: "Skills seeded successfully!",
      });
      // Refetch skills to update the display
      await refetchSkills();
    } catch (error) {
      console.error('Error in handleSeedSkills:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to seed skills. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleManualRefresh = async () => {
    try {
      toast({
        title: "Refreshing",
        description: "Checking skills database...",
      });
      await refetchSkills();
      toast({
        title: "Refreshed",
        description: `Found ${skills.length} skills in database`,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh skills data",
        variant: "destructive",
      });
    }
  };

  // Debug panel for development
  const showDebugInfo = process.env.NODE_ENV === 'development';

  if (status === 'error') {
    return (
      <StandardPageLayout
        title="Skills Management"
        description="Manage curriculum skills and learning objectives"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>
            Failed to load skills data. Please check your database connection.
            {errors.checkError && <div className="mt-2 text-sm">Check Error: {errors.checkError.message}</div>}
            {errors.seedingError && <div className="mt-2 text-sm">Seeding Error: {errors.seedingError.message}</div>}
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button onClick={handleManualRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </StandardPageLayout>
    );
  }

  if (isLoading) {
    return (
      <StandardPageLayout
        title="Skills Management"
        description="Manage curriculum skills and learning objectives"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isInitializing ? 
                `Initializing skills database... (${skillsCount} skills found)` : 
                'Loading skills...'
              }
            </p>
            {seedingResult && !seedingResult.success && (
              <p className="mt-2 text-sm text-gray-500">
                Seeding may need manual intervention
              </p>
            )}
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  if (status === 'needs-seeding') {
    return (
      <StandardPageLayout
        title="Skills Management"
        description="Manage curriculum skills and learning objectives"
      >
        <div className="text-center py-8">
          <Alert className="max-w-2xl mx-auto mb-6">
            <Clock className="h-4 w-4" />
            <AlertTitle>Skills Database Needs Setup</AlertTitle>
            <AlertDescription>
              Current skills count: {skillsCount}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Click below to populate the skills database with curriculum standards.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={handleSeedSkills}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Seed Skills Database
              </Button>
              
              <Button onClick={handleManualRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Again
              </Button>
            </div>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Skills Management"
      description={`${filteredSkills.length} of ${skills.length} skills`}
    >
      <div className="space-y-6">
        {/* Status indicator */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Skills Database Ready</AlertTitle>
          <AlertDescription>
            Successfully loaded {skillsCount} curriculum skills across all subjects and grade levels.
          </AlertDescription>
        </Alert>

        <SkillsFilters 
          filters={filters}
          onFiltersChange={setFilters}
          totalSkills={skills.length}
          filteredCount={filteredSkills.length}
        />
        
        <SkillsTable 
          skills={filteredSkills}
          isLoading={isLoading}
        />

        {/* Debug panel for development */}
        {showDebugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            <div className="mt-2 space-x-2">
              <Button size="sm" onClick={handleSeedSkills} variant="outline">
                Reseed
              </Button>
              <Button size="sm" onClick={handleManualRefresh} variant="outline">
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
};

export default Skills;
