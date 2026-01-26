import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  teacher_id: string;
  name: string;
  template_type: 'progress_report' | 'parent_communication' | 'assessment_reminder' | 'custom';
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
}

class TemplateService {
  async getTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      template_type: (item.template_type || 'custom') as EmailTemplate['template_type'],
      content: item.content || ''
    }));
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? {
      ...data,
      template_type: (data.template_type || 'custom') as EmailTemplate['template_type'],
      content: data.content || ''
    } : null;
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>): Promise<EmailTemplate> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: template.name,
        template_type: template.template_type,
        subject: template.subject,
        content: template.content,
        teacher_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      template_type: (data.template_type || 'custom') as EmailTemplate['template_type'],
      content: data.content || ''
    };
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        name: updates.name,
        template_type: updates.template_type,
        subject: updates.subject,
        content: updates.content
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      template_type: (data.template_type || 'custom') as EmailTemplate['template_type'],
      content: data.content || ''
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async duplicateTemplate(id: string, newName: string): Promise<EmailTemplate> {
    const template = await this.getTemplateById(id);
    if (!template) throw new Error('Template not found');

    return this.createTemplate({
      name: newName,
      template_type: template.template_type,
      subject: template.subject,
      content: template.content
    });
  }

  getAvailableVariables(templateType: string): TemplateVariable[] {
    const commonVariables: TemplateVariable[] = [
      {
        key: 'student_name',
        label: 'Student Name',
        description: 'Full name of the student',
        type: 'text',
        required: true
      },
      {
        key: 'parent_name',
        label: 'Parent Name',
        description: 'Name of the parent/guardian',
        type: 'text',
        required: false
      },
      {
        key: 'teacher_name',
        label: 'Teacher Name',
        description: 'Name of the teacher',
        type: 'text',
        required: true
      },
      {
        key: 'school_name',
        label: 'School Name',
        description: 'Name of the school',
        type: 'text',
        required: false
      },
      {
        key: 'current_date',
        label: 'Current Date',
        description: 'Today\'s date',
        type: 'date',
        required: false
      }
    ];

    const typeSpecificVariables: Record<string, TemplateVariable[]> = {
      progress_report: [
        {
          key: 'assessment_scores',
          label: 'Assessment Scores',
          description: 'Recent assessment scores',
          type: 'text',
          required: false
        },
        {
          key: 'progress_summary',
          label: 'Progress Summary',
          description: 'Summary of student progress',
          type: 'text',
          required: false
        }
      ],
      assessment_reminder: [
        {
          key: 'assessment_title',
          label: 'Assessment Title',
          description: 'Name of the upcoming assessment',
          type: 'text',
          required: true
        },
        {
          key: 'assessment_date',
          label: 'Assessment Date',
          description: 'Date of the assessment',
          type: 'date',
          required: true
        }
      ]
    };

    return [...commonVariables, ...(typeSpecificVariables[templateType] || [])];
  }

  renderTemplate(template: EmailTemplate, variables: Record<string, any>): { subject: string; content: string } {
    let renderedSubject = template.subject;
    let renderedContent = template.content;

    // Replace variables in both subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value);
      
      renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), stringValue);
      renderedContent = renderedContent.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return {
      subject: renderedSubject,
      content: renderedContent
    };
  }
}

export const templateService = new TemplateService();
