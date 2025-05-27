
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Goals = () => {
  const sampleGoals = [
    {
      id: 1,
      title: "Improve Math Fluency",
      description: "Increase multiplication fact recall speed",
      student: "Sarah Johnson",
      progress: 75,
      deadline: "2024-04-15",
      status: "on-track"
    },
    {
      id: 2,
      title: "Reading Comprehension",
      description: "Improve understanding of complex texts",
      student: "Mike Chen",
      progress: 45,
      deadline: "2024-04-30",
      status: "needs-attention"
    },
    {
      id: 3,
      title: "Science Vocabulary",
      description: "Master grade-level science terms",
      student: "Emma Davis",
      progress: 90,
      deadline: "2024-04-10",
      status: "ahead"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'needs-attention': return 'text-yellow-600 bg-yellow-100';
      case 'ahead': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Goals</h1>
          <p className="text-gray-600 mt-2">Track and manage student learning objectives</p>
        </div>
        <Link to="/app/goals/add">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-600">On Track</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Due This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Student: {goal.student}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">Due: {goal.deadline}</span>
                  <Link to={`/app/goals/${goal.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
