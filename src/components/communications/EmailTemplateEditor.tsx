
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
  Save,
  Eye,
  Code
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplateEditorProps {
  template?: {
    id?: string;
    name: string;
    subject: string;
    content: string;
    template_type: string;
  };
  onSave: (template: any) => void;
  onCancel: () => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    content: template?.content || '',
    template_type: template?.template_type || 'custom'
  });
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const mergeFields = [
    { label: 'Student Name', value: '{{student_name}}' },
    { label: 'Teacher Name', value: '{{teacher_name}}' },
    { label: 'School Name', value: '{{school_name}}' },
    { label: 'Assessment Score', value: '{{assessment_score}}' },
    { label: 'Grade Level', value: '{{grade_level}}' },
    { label: 'Date', value: '{{current_date}}' },
    { label: 'Parent Name', value: '{{parent_name}}' }
  ];

  const insertMergeField = (field: string) => {
    if (contentRef.current) {
      const textarea = contentRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = 
        formData.content.substring(0, start) + 
        field + 
        formData.content.substring(end);
      
      setFormData(prev => ({ ...prev, content: newContent }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.subject.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name and subject are required',
        variant: 'destructive'
      });
      return;
    }

    onSave({
      ...template,
      ...formData
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {template?.id ? 'Edit' : 'Create'} Email Template
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {!showPreview ? (
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
                    ref={contentRef}
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter email content..."
                    className="min-h-[300px] font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Subject:</Label>
                    <p className="font-semibold">{formData.subject}</p>
                  </div>
                  <div>
                    <Label>Content:</Label>
                    <div 
                      className="border rounded p-4 bg-white min-h-[300px]"
                      dangerouslySetInnerHTML={{ 
                        __html: formData.content.replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Merge Fields</CardTitle>
              <p className="text-sm text-gray-600">
                Click to insert dynamic content
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {mergeFields.map((field) => (
                  <Button
                    key={field.value}
                    variant="outline"
                    size="sm"
                    onClick={() => insertMergeField(field.value)}
                    className="justify-start text-left"
                  >
                    <Code className="h-3 w-3 mr-2" />
                    {field.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="capitalize">
                {formData.template_type.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
