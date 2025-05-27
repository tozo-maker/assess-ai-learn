
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Target, Calendar, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const GoalDetails = () => {
  const { id } = useParams();

  // Sample goal data
  const goal = {
    id: 1,
    title: "Improve Math Fluency",
    description: "Increase multiplication fact recall speed from 30 facts per minute to 50 facts per minute",
    student: "Sarah Johnson",
    subject: "Mathematics",
    startDate: "2024-03-01",
    targetDate: "2024-04-15",
    progress: 75,
    status: "on-track",
    successCriteria: "Student can correctly answer 50 multiplication facts (0-12) within one minute with 95% accuracy",
    priority: "high"
  };

  const milestones = [
    { date: "2024-03-08", description: "Baseline assessment completed", completed: true },
    { date: "2024-03-15", description: "Reach 35 facts per minute", completed: true },
    { date: "2024-03-22", description: "Reach 40 facts per minute", completed: true },
    { date: "2024-03-29", description: "Reach 45 facts per minute", completed: false },
    { date: "2024-04-05", description: "Reach 50 facts per minute", completed: false },
    { date: "2024-04-15", description: "Final assessment", completed: false }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'needs-attention': return 'bg-yellow-100 text-yellow-800';
      case 'ahead': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/goals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Goals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
            <p className="text-gray-600 mt-2">Goal Details and Progress</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Edit className="h-4 w-4 mr-2" />
          Edit Goal
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Goal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goal Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{goal.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Success Criteria</h3>
                <p className="text-gray-600">{goal.successCriteria}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm ${
                        milestone.completed ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {milestone.description}
                      </p>
                      <p className="text-xs text-gray-500">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Student</p>
                  <p className="text-sm text-gray-600">{goal.student}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-gray-600">
                    {goal.startDate} to {goal.targetDate}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status.replace('-', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Priority</p>
                <Badge className={getPriorityColor(goal.priority)}>
                  {goal.priority}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Subject</p>
                <p className="text-sm text-gray-600">{goal.subject}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Update Progress
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Add Milestone
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoalDetails;
