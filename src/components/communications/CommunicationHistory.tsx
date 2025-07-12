
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  MessageSquare 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CommunicationHistory: React.FC = () => {
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communication-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parent_communications')
        .select(`
          *,
          student:students(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!communications || communications.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No communications yet</h3>
        <p className="text-muted-foreground">
          Your communication history will appear here once you start sending reports and messages.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <Card key={comm.id} className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(comm.email_status || 'sent')}
                  <h4 className="font-medium">{comm.subject}</h4>
                  <Badge variant={getStatusColor(comm.email_status || 'sent') as any} className="text-xs">
                    {comm.email_status || 'sent'}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <strong>To:</strong> {comm.student?.first_name} {comm.student?.last_name}
                    {comm.parent_email && (
                      <span className="ml-2">({comm.parent_email})</span>
                    )}
                  </p>
                  <p>
                    <strong>Type:</strong> {comm.communication_type}
                  </p>
                  <p>
                    <strong>Sent:</strong> {new Date(comm.created_at).toLocaleDateString()} at{' '}
                    {new Date(comm.created_at).toLocaleTimeString()}
                  </p>
                </div>

                {comm.content && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <p className="text-sm line-clamp-3">{comm.content}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                {comm.pdf_url && (
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommunicationHistory;
