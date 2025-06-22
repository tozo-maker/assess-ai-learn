import { createClient } from '@supabase/supabase-js';
import { ParentCommunication } from '@/types/communications';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export const communicationsService = {
  async getCommunications(): Promise<ParentCommunication[]> {
    // Mock data for now - replace with actual Supabase query when table is created
    return [
      {
        id: '1',
        student_id: '1',
        teacher_id: '1',
        communication_type: 'progress_report',
        subject: 'Weekly Progress Report for John Doe',
        content: 'John has shown excellent progress this week...',
        parent_email: 'parent@example.com',
        email_status: 'sent',
        sent_at: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T09:30:00Z'
      },
      {
        id: '2',
        student_id: '2',
        teacher_id: '1',
        communication_type: 'achievement',
        subject: 'Great Achievement - Math Assessment',
        content: 'Congratulations! Your child scored 95% on the recent math assessment.',
        parent_email: 'parent2@example.com',
        email_status: 'sent',
        sent_at: '2024-01-14T14:30:00Z',
        created_at: '2024-01-14T14:00:00Z'
      }
    ];
  },

  async createCommunication(data: Omit<ParentCommunication, 'id' | 'created_at'>): Promise<ParentCommunication> {
    // Mock implementation - replace with actual Supabase insert
    const newCommunication: ParentCommunication = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      ...data
    };
    return newCommunication;
  }
};
