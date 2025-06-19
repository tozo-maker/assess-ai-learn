
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, Code2, Wand2 } from 'lucide-react';
import { EmailTemplate, templateService, TemplateVariable } from '@/services/template-service';
import { useToast } from '@/hooks/use-toast';

interface TemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    template_type: template?.template_type || 'custom',
    subject: template?.subject || '',
    content: template?.content || '',
    is_default: template?.is_default || false
  });
  const [availableVariables, setAvailableVariables] = useState<TemplateVariable[]>([]);
  const [previewVariables, setPreviewVariables] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const variables = templateService.getAvailableVariables(formData.template_type);
    setAvailableVariables(variables);
    
    // Set default preview values
    const defaultValues: Record<string, any> = {};
    variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
          defaultValues[variable.key] = `[${variable.label}]`;
          break;
        case 'date':
          defaultValues[variable.key] = new Date().toLocaleDateString();
          break;
        case 'number':
          defaultValues[variable.key] = '85';
          break;
        case 'boolean':
          defaultValues[variable.key] = 'Yes';
          break;
        default:
          defaultValues[variable.key] = `[${variable.label}]`;
      }
    });
    setPreviewVariables(defaultValues);
  }, [formData.template_type]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      let savedTemplate: EmailTemplate;
      
      if (template) {
        savedTemplate = await templateService.updateTemplate(template.id, formData);
      } else {
        savedTemplate = await templateService.createTemplate(formData);
      }

      toast({
        title: 'Success',
        description: `Template ${template ? 'updated' : 'created'} successfully`
      });

      onSave(savedTemplate);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insertVariable = (variableKey: string) => {
    const placeholder = `{{${variableKey}}}`;
    setFormData(prev => ({
      ...prev,
      content: prev.content + placeholder
    }));
  };

  const renderPreview = () => {
    if (!formData.subject || !formData.content) return null;
    
    const rendered = templateService.renderTemplate(
      { ...formData } as EmailTemplate,
      previewVariables
    );

    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Subject Preview</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
            {rendered.subject}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Content Preview</Label>
          <div className="mt-1 p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
            {rendered.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {template ? 'Edit Template' : 'Create Template'}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <Label htmlFor="type">Template Type</Label>
                <Select 
                  value={formData.template_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress_report">Progress Report</SelectItem>
                    <SelectItem value="parent_communication">Parent Communication</SelectItem>
                    <SelectItem value="assessment_reminder">Assessment Reminder</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter email content"
                  rows={12}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="variables">
                <Code2 className="h-4 w-4 mr-2" />
                Variables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPreview()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variables" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableVariables.map((variable) => (
                    <div key={variable.key}>
                      <Label htmlFor={variable.key} className="text-sm">
                        {variable.label}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={variable.key}
                        value={previewVariables[variable.key] || ''}
                        onChange={(e) => setPreviewVariables(prev => ({
                          ...prev,
                          [variable.key]: e.target.value
                        }))}
                        placeholder={variable.description}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="h-4 w-4 mr-2" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableVariables.map((variable) => (
                  <div key={variable.key} className="flex items-center justify-between">
                    <div>
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => insertVariable(variable.key)}
                      >
                        {variable.label}
                      </Badge>
                      {variable.required && (
                        <span className="text-xs text-red-500 ml-1">Required</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click on a variable to insert it into your template
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
