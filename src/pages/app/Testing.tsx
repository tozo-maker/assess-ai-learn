
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TestTube, 
  Shield, 
  Database, 
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import FunctionalityTester from '@/components/testing/FunctionalityTester';
import DataIntegrityChecker from '@/components/testing/DataIntegrityChecker';
import TestingDashboard from '@/components/testing/TestingDashboard';

const Testing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quality Assurance & Testing</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive testing suite to ensure platform reliability and data integrity
        </p>
      </div>

      <Tabs defaultValue="functionality" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="functionality" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Core Testing
          </TabsTrigger>
          <TabsTrigger value="integrity" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Data Integrity
          </TabsTrigger>
          <TabsTrigger value="comprehensive" className="flex items-center">
            <TestTube className="h-4 w-4 mr-2" />
            Full Suite
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="functionality" className="space-y-6">
          <FunctionalityTester />
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <DataIntegrityChecker />
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-6">
          <TestingDashboard />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  System Status Overview
                </CardTitle>
                <CardDescription>
                  Current health and performance metrics of the LearnSpark AI platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">99.9%</div>
                    <div className="text-sm text-green-600">Uptime</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">100%</div>
                    <div className="text-sm text-blue-600">Data Integrity</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">Secure</div>
                    <div className="text-sm text-purple-600">Authentication</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <TestTube className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-700">Active</div>
                    <div className="text-sm text-orange-600">Testing Suite</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Testing Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Core Functionality Testing</h3>
                    <p className="text-sm text-gray-600">
                      Tests authentication, CRUD operations, and basic platform functionality. 
                      Run this first to ensure fundamental features work correctly.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Data Integrity Checking</h3>
                    <p className="text-sm text-gray-600">
                      Validates data relationships, foreign key constraints, and performance calculations. 
                      Essential for maintaining data quality and consistency.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Comprehensive Test Suite</h3>
                    <p className="text-sm text-gray-600">
                      Full testing including AI integration, performance testing, and security validation. 
                      Use for complete platform validation before major releases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing;
