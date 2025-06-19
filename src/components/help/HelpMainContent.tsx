
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video, 
  Mail, 
  ExternalLink,
  Search
} from 'lucide-react';

const HelpMainContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const faqItems = [
    {
      question: "How do I add a new student?",
      answer: "Navigate to the Students page and click the 'Add Student' button. Fill out the required information including name, grade level, and any relevant details. You can also import students in bulk using a CSV file."
    },
    {
      question: "How do I create an assessment?",
      answer: "Go to the Assessments page and click 'Create Assessment'. Choose your assessment type, add questions, set scoring criteria, and assign it to students. The AI will help analyze results automatically."
    },
    {
      question: "How do I set up learning goals?",
      answer: "Visit the Goals page to create learning objectives for individual students. Set target dates, track progress, and receive AI-powered recommendations for achieving goals."
    },
    {
      question: "How do I generate progress reports?",
      answer: "Use the Communications section to generate comprehensive progress reports. Select students, choose report templates, and customize the content before sending to parents."
    },
    {
      question: "How do I export my data?",
      answer: "Most pages have an Export button that allows you to download data in CSV or PDF format. You can filter and customize what data to include in your exports."
    },
    {
      question: "How do I contact parents?",
      answer: "Use the Communications tools to send progress reports, updates, and notifications to parents via email. You can also use templates to standardize your messaging."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Step-by-step walkthrough for new users",
      type: "guide",
      icon: Book
    },
    {
      title: "Video Tutorials",
      description: "Watch video guides for common tasks",
      type: "video",
      icon: Video
    },
    {
      title: "Best Practices",
      description: "Tips for maximizing LearnSpark AI",
      type: "guide",
      icon: Book
    },
    {
      title: "Feature Updates",
      description: "Latest features and improvements",
      type: "update",
      icon: ExternalLink
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendSupport = () => {
    // Here you would typically send the support request
    console.log('Support message:', supportMessage);
    setSupportMessage('');
    // Show success message
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Find answers, tutorials, and get help with LearnSpark AI</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get help from our support team</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Book className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-gray-600">Browse our complete guides</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Video className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Watch step-by-step videos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No FAQ items match your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <resource.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">
                    {resource.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <p className="text-gray-600">
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your issue or question..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={6}
                />
                <Button onClick={handleSendSupport} disabled={!supportMessage.trim()}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Other Ways to Reach Us</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> support@learnspark.ai</p>
                  <p><strong>Response Time:</strong> Within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpMainContent;
