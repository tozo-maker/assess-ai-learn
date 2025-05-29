
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickVerificationCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          System Verification
        </CardTitle>
        <CardDescription>
          Run comprehensive tests before deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Tests: Build, Workflows, Performance, Email System
          </div>
          <Button asChild className="w-full">
            <Link to="/app/verification">
              <Settings className="mr-2 h-4 w-4" />
              Run Complete Verification
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickVerificationCard;
