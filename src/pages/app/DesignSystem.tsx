
import React, { useState } from 'react';
import PageShell from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Copy,
  Eye,
  Settings
} from 'lucide-react';

const DesignSystem = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const designTokens = {
    spacing: [
      { name: 'xs', value: '4px', class: 'space-xs', usage: 'Tight spacing, form elements' },
      { name: 'sm', value: '8px', class: 'space-sm', usage: 'Small gaps, button padding' },
      { name: 'md', value: '16px', class: 'space-md', usage: 'Default spacing, card padding' },
      { name: 'lg', value: '24px', class: 'space-lg', usage: 'Section spacing, margins' },
      { name: 'xl', value: '32px', class: 'space-xl', usage: 'Large sections, page margins' },
      { name: '2xl', value: '48px', class: 'space-2xl', usage: 'Major sections' },
      { name: '3xl', value: '64px', class: 'space-3xl', usage: 'Page-level spacing' },
    ],
    typography: [
      { name: 'Display Large', size: '48px', lineHeight: '56px', weight: 'Bold', class: 'text-display-lg', usage: 'Hero headings' },
      { name: 'Display Medium', size: '36px', lineHeight: '40px', weight: 'Bold', class: 'text-display-md', usage: 'Page titles' },
      { name: 'Display Small', size: '30px', lineHeight: '36px', weight: 'Bold', class: 'text-display-sm', usage: 'Section titles' },
      { name: 'Heading Large', size: '24px', lineHeight: '32px', weight: 'Semibold', class: 'text-heading-lg', usage: 'Card headers' },
      { name: 'Heading Medium', size: '20px', lineHeight: '28px', weight: 'Medium', class: 'text-heading-md', usage: 'Subsections' },
      { name: 'Heading Small', size: '18px', lineHeight: '28px', weight: 'Medium', class: 'text-heading-sm', usage: 'Form sections' },
      { name: 'Body Large', size: '16px', lineHeight: '24px', weight: 'Normal', class: 'text-body-lg', usage: 'Main content' },
      { name: 'Body Medium', size: '14px', lineHeight: '20px', weight: 'Normal', class: 'text-body-md', usage: 'Secondary content' },
      { name: 'Body Small', size: '12px', lineHeight: '16px', weight: 'Normal', class: 'text-body-sm', usage: 'Captions, labels' },
    ],
    colors: [
      { name: 'Primary', hex: '#2563eb', usage: 'Main brand color, primary actions', light: '#dbeafe' },
      { name: 'Success', hex: '#10b981', usage: 'Success states, positive feedback', light: '#d1fae5' },
      { name: 'Warning', hex: '#f59e0b', usage: 'Warning states, caution', light: '#fef3c7' },
      { name: 'Danger', hex: '#ef4444', usage: 'Error states, destructive actions', light: '#fee2e2' },
      { name: 'Info', hex: '#3b82f6', usage: 'Information, neutral actions', light: '#dbeafe' },
      { name: 'Neutral', hex: '#6b7280', usage: 'Secondary actions, borders', light: '#f3f4f6' },
    ]
  };

  return (
    <PageShell
      title="Design System"
      description="LearnSpark AI comprehensive design system and component library"
      icon={<Palette className="h-6 w-6 text-blue-600" />}
    >
      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        {/* Design Tokens */}
        <TabsContent value="tokens" className="space-y-8">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color System
              </CardTitle>
              <CardDescription>
                Semantic color palette for consistent UI states and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designTokens.colors.map((color) => (
                  <div key={color.name} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div 
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: color.light }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{color.name}</div>
                      <div className="text-sm text-gray-600 font-mono">{color.hex}</div>
                      <div className="text-xs text-gray-500 mt-1">{color.usage}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`var(--color-${color.name.toLowerCase()})`, color.name)}
                      className="w-full"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedToken === color.name ? 'Copied!' : 'Copy CSS Variable'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography Scale
              </CardTitle>
              <CardDescription>
                Consistent typography hierarchy for clear information architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {designTokens.typography.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className={type.class}>
                        {type.name} - The quick brown fox
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {type.size} / {type.lineHeight} • {type.weight} • {type.usage}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(type.class, type.name)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spacing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Spacing Scale
              </CardTitle>
              <CardDescription>
                Consistent spacing system for layouts and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {designTokens.spacing.map((space) => (
                  <div key={space.name} className="flex items-center gap-4 p-3 border rounded">
                    <div className="w-16 text-sm font-medium">{space.name}</div>
                    <div 
                      className="bg-blue-200 h-4"
                      style={{ width: space.value }}
                    />
                    <div className="font-mono text-sm">{space.value}</div>
                    <div className="text-sm text-gray-600 flex-1">{space.usage}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`var(--${space.class})`, space.name)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components */}
        <TabsContent value="components" className="space-y-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Consistent button styles for different actions and contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-heading-sm mb-3">Primary Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Primary Button</Button>
                    <Button variant="default" size="sm">Small Primary</Button>
                    <Button variant="default" size="lg">Large Primary</Button>
                    <Button variant="default" disabled>Disabled</Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-heading-sm mb-3">Secondary Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-heading-sm mb-3">Semantic Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="destructive">Delete</Button>
                    <Button className="bg-semantic-success hover:bg-semantic-success-hover">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Success
                    </Button>
                    <Button className="bg-semantic-warning hover:bg-semantic-warning-hover">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Warning
                    </Button>
                    <Button className="bg-semantic-info hover:bg-semantic-info-hover">
                      <Info className="h-4 w-4 mr-2" />
                      Info
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Card Patterns</CardTitle>
              <CardDescription>
                Standard card layouts for different content types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Standard Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-heading-md">Standard Card</CardTitle>
                    <CardDescription>Basic card with header and content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-md">This is the standard card layout with proper spacing and typography.</p>
                  </CardContent>
                </Card>

                {/* Stat Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-heading-sm text-gray-600">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-display-md font-bold text-semantic-primary">142</div>
                    <p className="text-body-sm text-semantic-success mt-1">+12% from last month</p>
                  </CardContent>
                </Card>

                {/* Action Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-heading-md flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-body-md">Complete your profile setup</p>
                    <Button size="sm" className="w-full">Get Started</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                Consistent form patterns with proper spacing and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="teacher@school.edu" />
                  <p className="text-help">We'll use this for important notifications</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex gap-2">
                    <Badge variant="default">Teacher</Badge>
                    <Badge variant="secondary">Administrator</Badge>
                    <Badge variant="outline">Student</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Status Indicators</CardTitle>
              <CardDescription>
                Consistent visual feedback for different states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-semantic-success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                  <Badge className="bg-semantic-warning">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                  <Badge className="bg-semantic-danger">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                  </Badge>
                  <Badge className="bg-semantic-info">
                    <Info className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-semantic-success-light border border-semantic-success rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-semantic-success" />
                      <span className="font-medium text-semantic-success">Success Message</span>
                    </div>
                    <p className="text-sm mt-1">Your changes have been saved successfully.</p>
                  </div>
                  <div className="p-3 bg-semantic-danger-light border border-semantic-danger rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-semantic-danger" />
                      <span className="font-medium text-semantic-danger">Error Message</span>
                    </div>
                    <p className="text-sm mt-1">There was an error processing your request.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Patterns */}
        <TabsContent value="layouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Layout Patterns</CardTitle>
              <CardDescription>
                Consistent layout structures used throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-heading-sm mb-3">Page Header Pattern</h4>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="page-header">
                    <h1 className="page-title">Page Title</h1>
                    <p className="page-description">
                      This is the standard page description that explains what the user can do on this page.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Dashboard Grid</h4>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid-dashboard">
                    <div className="lg:col-span-2">
                      <div className="h-32 bg-white border rounded-lg flex items-center justify-center">
                        Main Content Area
                      </div>
                    </div>
                    <div>
                      <div className="h-32 bg-white border rounded-lg flex items-center justify-center">
                        Sidebar Content
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Card Grid</h4>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="grid-cards">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 bg-white border rounded-lg flex items-center justify-center">
                        Card {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interaction Patterns */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interaction Patterns</CardTitle>
              <CardDescription>
                Consistent interaction behaviors and animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-heading-sm mb-3">Hover States</h4>
                <div className="flex gap-4">
                  <Button className="transition-standard hover:scale-105">Hover Scale</Button>
                  <div className="p-3 border rounded cursor-pointer transition-standard hover:shadow-md">
                    Hover Shadow
                  </div>
                  <div className="p-3 border rounded cursor-pointer transition-standard hover:bg-blue-50">
                    Hover Background
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Loading States</h4>
                <div className="flex gap-4">
                  <Button disabled>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Loading...
                  </Button>
                  <div className="p-3 border rounded animate-pulse bg-gray-100">
                    Skeleton Loading
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Animation Examples</h4>
                <div className="space-y-2">
                  <div className="p-3 border rounded animate-fade-in">Fade In Animation</div>
                  <div className="p-3 border rounded animate-scale-in">Scale In Animation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guidelines */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Guidelines</CardTitle>
              <CardDescription>
                Best practices for using the LearnSpark AI design system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-heading-sm mb-3">Visual Hierarchy</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Element</TableHead>
                      <TableHead>Typography</TableHead>
                      <TableHead>Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Page Titles</TableCell>
                      <TableCell>text-display-sm, font-bold</TableCell>
                      <TableCell>Primary page headings</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Section Headers</TableCell>
                      <TableCell>text-heading-lg, font-semibold</TableCell>
                      <TableCell>Major page sections</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Subsections</TableCell>
                      <TableCell>text-heading-md, font-medium</TableCell>
                      <TableCell>Content subsections</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Body Text</TableCell>
                      <TableCell>text-body-lg</TableCell>
                      <TableCell>Main content</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Help Text</TableCell>
                      <TableCell>text-help</TableCell>
                      <TableCell>Descriptions, hints</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Spacing Guidelines</h4>
                <ul className="space-y-2 text-body-md">
                  <li>• Use consistent spacing scale (xs to 3xl)</li>
                  <li>• Maintain vertical rhythm with line-height</li>
                  <li>• Apply content-spacing classes for consistent flow</li>
                  <li>• Use space-lg (24px) for most section spacing</li>
                  <li>• Use space-md (16px) for component internal spacing</li>
                </ul>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Color Usage</h4>
                <ul className="space-y-2 text-body-md">
                  <li>• Use semantic colors for consistent meaning</li>
                  <li>• Primary blue for main actions and branding</li>
                  <li>• Success green for positive feedback</li>
                  <li>• Warning amber for caution states</li>
                  <li>• Danger red for errors and destructive actions</li>
                  <li>• Info blue for neutral information</li>
                </ul>
              </div>

              <div>
                <h4 className="text-heading-sm mb-3">Accessibility</h4>
                <ul className="space-y-2 text-body-md">
                  <li>• Maintain WCAG 2.1 AA contrast ratios</li>
                  <li>• Use focus-ring class for keyboard navigation</li>
                  <li>• Include proper ARIA labels and roles</li>
                  <li>• Ensure minimum touch target size of 44px</li>
                  <li>• Test with screen readers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
};

export default DesignSystem;
