
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { emailService } from '@/services/email-service';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const EmailTestButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const runEmailTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('Starting email delivery test...');
      
      const result = await emailService.testEmailDelivery();
      
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: 'Email Test Successful',
          description: `Test email sent successfully. ${result.total_sent || 1} email(s) delivered.`
        });
      } else {
        toast({
          title: 'Email Test Failed',
          description: result.error || 'Email delivery test failed',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      setTestResult({ success: false, error: error.message });
      toast({
        title: 'Email Test Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Test Email System
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email System Test</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will send a test email to verify that the email delivery system is working correctly.
          </p>
          
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Test Passed' : 'Test Failed'}
                </span>
              </div>
              
              {testResult.summary && (
                <p className="text-sm mt-2 text-gray-600">
                  {testResult.summary}
                </p>
              )}
              
              {testResult.error && (
                <p className="text-sm mt-2 text-red-600">
                  Error: {testResult.error}
                </p>
              )}
              
              {testResult.results && (
                <div className="mt-2">
                  <p className="text-xs font-medium">Results:</p>
                  <ul className="text-xs space-y-1 mt-1">
                    {testResult.results.map((result: any, index: number) => (
                      <li key={index} className={result.success ? 'text-green-600' : 'text-red-600'}>
                        {result.recipient}: {result.success ? 'Delivered' : result.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={runEmailTest} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTestButton;
