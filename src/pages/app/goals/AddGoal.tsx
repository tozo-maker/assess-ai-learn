
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddGoal = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/app/goals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Goal</h1>
          <p className="text-gray-600 mt-2">Set a learning objective for a student</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="goalTitle">Goal Title</Label>
            <Input 
              id="goalTitle" 
              placeholder="e.g., Improve Math Fluency"
            />
          </div>

          <div>
            <Label htmlFor="goalDescription">Description</Label>
            <Textarea 
              id="goalDescription" 
              placeholder="Describe what the student needs to achieve..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Select Student</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Chen</SelectItem>
                  <SelectItem value="emma">Emma Davis</SelectItem>
                  <SelectItem value="alex">Alex Rodriguez</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="social-studies">Social Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" />
            </div>

            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input id="targetDate" type="date" />
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Priority Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="successCriteria">Success Criteria</Label>
            <Textarea 
              id="successCriteria" 
              placeholder="How will you measure success for this goal?"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link to="/app/goals">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddGoal;
