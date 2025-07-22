import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  GitBranch,
  Clock,
  Mail,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface WorkflowTrigger {
  id: string;
  type: 'score_threshold' | 'time_based' | 'manual' | 'goal_completion';
  condition: string;
  value: any;
}

interface WorkflowAction {
  id: string;
  type: 'send_email' | 'create_goal' | 'send_alert' | 'generate_report';
  config: Record<string, any>;
  delay?: number;
}

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  createdAt: Date;
}

interface WorkflowBuilderProps {
  workflows: WorkflowRule[];
  onSaveWorkflow: (workflow: WorkflowRule) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onToggleWorkflow: (workflowId: string, isActive: boolean) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflows,
  onSaveWorkflow,
  onDeleteWorkflow,
  onToggleWorkflow
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowRule | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [actions, setActions] = useState<WorkflowAction[]>([]);

  const triggerTypes = [
    { value: 'score_threshold', label: 'Score Threshold', icon: Target },
    { value: 'time_based', label: 'Time-based', icon: Clock },
    { value: 'manual', label: 'Manual Trigger', icon: Play },
    { value: 'goal_completion', label: 'Goal Completion', icon: CheckCircle }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'create_goal', label: 'Create Goal', icon: Target },
    { value: 'send_alert', label: 'Send Alert', icon: AlertTriangle },
    { value: 'generate_report', label: 'Generate Report', icon: GitBranch }
  ];

  const addTrigger = () => {
    const newTrigger: WorkflowTrigger = {
      id: `trigger_${Date.now()}`,
      type: 'score_threshold',
      condition: 'less_than',
      value: 70
    };
    setTriggers([...triggers, newTrigger]);
  };

  const updateTrigger = (id: string, updates: Partial<WorkflowTrigger>) => {
    setTriggers(triggers.map(trigger => 
      trigger.id === id ? { ...trigger, ...updates } : trigger
    ));
  };

  const removeTrigger = (id: string) => {
    setTriggers(triggers.filter(trigger => trigger.id !== id));
  };

  const addAction = () => {
    const newAction: WorkflowAction = {
      id: `action_${Date.now()}`,
      type: 'send_email',
      config: { recipient: 'parent', template: 'low_performance' },
      delay: 0
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (id: string, updates: Partial<WorkflowAction>) => {
    setActions(actions.map(action => 
      action.id === id ? { ...action, ...updates } : action
    ));
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(action => action.id !== id));
  };

  const saveWorkflow = () => {
    const workflow: WorkflowRule = {
      id: editingWorkflow?.id || `workflow_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      isActive: true,
      triggers,
      actions,
      createdAt: editingWorkflow?.createdAt || new Date()
    };

    onSaveWorkflow(workflow);
    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingWorkflow(null);
    setWorkflowName('');
    setWorkflowDescription('');
    setTriggers([]);
    setActions([]);
  };

  const editWorkflow = (workflow: WorkflowRule) => {
    setEditingWorkflow(workflow);
    setIsCreating(true);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);
    setTriggers(workflow.triggers);
    setActions(workflow.actions);
  };

  const getTriggerIcon = (type: string) => {
    const triggerType = triggerTypes.find(t => t.value === type);
    return triggerType?.icon || Target;
  };

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(a => a.value === type);
    return actionType?.icon || Mail;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-gray-600">Create automated workflows to streamline your teaching processes</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {isCreating && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>
              {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Low Performance Alert"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  rows={2}
                />
              </div>
            </div>

            {/* Triggers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Triggers</h3>
                <Button variant="outline" size="sm" onClick={addTrigger}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trigger
                </Button>
              </div>
              
              <div className="space-y-3">
                {triggers.map((trigger) => {
                  const Icon = getTriggerIcon(trigger.type);
                  return (
                    <Card key={trigger.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <Icon className="h-5 w-5 text-blue-600" />
                        
                        <Select
                          value={trigger.type}
                          onValueChange={(value) => updateTrigger(trigger.id, { type: value as any })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {triggerTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {trigger.type === 'score_threshold' && (
                          <>
                            <Select
                              value={trigger.condition}
                              onValueChange={(value) => updateTrigger(trigger.id, { condition: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="less_than">Less than</SelectItem>
                                <SelectItem value="greater_than">Greater than</SelectItem>
                                <SelectItem value="equals">Equals</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={trigger.value}
                              onChange={(e) => updateTrigger(trigger.id, { value: parseInt(e.target.value) })}
                              className="w-24"
                              placeholder="Score"
                            />
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTrigger(trigger.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Actions</h3>
                <Button variant="outline" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
              
              <div className="space-y-3">
                {actions.map((action) => {
                  const Icon = getActionIcon(action.type);
                  return (
                    <Card key={action.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <Icon className="h-5 w-5 text-green-600" />
                        
                        <Select
                          value={action.type}
                          onValueChange={(value) => updateAction(action.id, { type: value as any })}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          value={action.delay || 0}
                          onChange={(e) => updateAction(action.id, { delay: parseInt(e.target.value) })}
                          className="w-24"
                          placeholder="Delay (min)"
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={saveWorkflow}
                disabled={!workflowName || triggers.length === 0 || actions.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <Badge variant={workflow.isActive ? "default" : "secondary"}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Triggers ({workflow.triggers.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow.triggers.map((trigger) => {
                      const Icon = getTriggerIcon(trigger.type);
                      return (
                        <Badge key={trigger.id} variant="outline" className="text-xs">
                          <Icon className="h-3 w-3 mr-1" />
                          {triggerTypes.find(t => t.value === trigger.type)?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Actions ({workflow.actions.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {workflow.actions.map((action) => {
                      const Icon = getActionIcon(action.type);
                      return (
                        <Badge key={action.id} variant="outline" className="text-xs">
                          <Icon className="h-3 w-3 mr-1" />
                          {actionTypes.find(a => a.value === action.type)?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Created {workflow.createdAt.toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleWorkflow(workflow.id, !workflow.isActive)}
                    >
                      {workflow.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editWorkflow(workflow)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-12">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No workflows created yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first automated workflow to streamline repetitive tasks
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowBuilder;
