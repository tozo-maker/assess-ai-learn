
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Target } from 'lucide-react';
import { Goal, GoalFilters } from '@/hooks/useGoalsData';
import GoalCard from './GoalCard';
import CreateGoalDialog from './CreateGoalDialog';

interface GoalsMainContentProps {
  goals: Goal[];
  filteredGoals: Goal[];
  filters: GoalFilters;
  onFiltersChange: (filters: GoalFilters) => void;
  onCreateGoal: (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalsMainContent: React.FC<GoalsMainContentProps> = ({
  goals,
  filteredGoals,
  filters,
  onFiltersChange,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleFilterChange = (key: keyof GoalFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleStatusChange = (value: string) => {
    // Convert "all" back to empty string for filtering logic
    const statusValue = value === "all" ? "" : value;
    handleFilterChange('status', statusValue);
  };

  // Ensure we have a safe value for the Select component
  const safeStatusValue = filters.status || "all";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Goals</h1>
          <p className="text-gray-600 mt-1">Track and manage student learning objectives</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {goals.filter(g => g.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {goals.filter(g => g.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {goals.length > 0 
                ? Math.round(goals.reduce((acc, g) => acc + g.progress_percentage, 0) / goals.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search goals..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={safeStatusValue} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={onUpdateGoal}
              onDelete={onDeleteGoal}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              {goals.length === 0 ? 'No goals created yet' : 'No goals match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {goals.length === 0 
                ? 'Create your first learning goal to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {goals.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Goal Dialog */}
      <CreateGoalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateGoal={onCreateGoal}
      />
    </div>
  );
};

export default GoalsMainContent;
