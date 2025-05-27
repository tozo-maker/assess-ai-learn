
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, School, BookOpen } from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Jane" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="jane.smith@school.edu" />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself..."
                  defaultValue="5th grade teacher passionate about using technology to enhance learning."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-sm text-gray-600">jane.smith@school.edu</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <School className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Joined</p>
                  <p className="text-sm text-gray-600">March 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Plan</p>
                  <p className="text-sm text-gray-600">Free Trial</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teaching Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="school">School</Label>
                <Input id="school" defaultValue="Lincoln Elementary" />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Input id="grade" defaultValue="5th Grade" />
              </div>
              <div>
                <Label htmlFor="subject">Primary Subject</Label>
                <Input id="subject" defaultValue="Mathematics" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  );
};

export default Profile;
