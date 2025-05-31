
import React, { useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { Palette, Type, Layout, Square, MousePointer, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import redesigned components
import { ButtonRedesigned } from '@/components/ui/button-redesigned';
import { 
  CardRedesigned, 
  CardHeaderRedesigned, 
  CardContentRedesigned, 
  CardFooterRedesigned,
  CardTitleRedesigned,
  CardDescriptionRedesigned
} from '@/components/ui/card-redesigned';
import { 
  InputRedesigned, 
  LabelRedesigned, 
  TextareaRedesigned, 
  FormFieldRedesigned 
} from '@/components/ui/form-redesigned';
import { 
  PageTitle, 
  SectionHeader, 
  SubsectionHeader, 
  BodyText, 
  HelpText, 
  CaptionText 
} from '@/components/ui/typography';
import { 
  PageContainer, 
  Section, 
  ContentGrid, 
  GridItem, 
  Spacer, 
  FlexContainer 
} from '@/components/ui/layout-redesigned';

const DesignSystem = () => {
  const [inputValue, setInputValue] = useState('');
  const [hasError, setHasError] = useState(false);

  return (
    <PageShell
      title="Design System"
      description="LearnSpark AI Design System & Component Library"
      icon={<Palette className="h-6 w-6 text-blue-600" />}
    >
      <PageContainer>
        <Tabs defaultValue="foundations" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="foundations">Foundations</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
          </TabsList>

          {/* Foundations Tab */}
          <TabsContent value="foundations" className="space-y-8">
            <Section>
              <SectionHeader>Color Palette</SectionHeader>
              
              <div className="space-y-6">
                <div>
                  <SubsectionHeader>Primary Colors</SubsectionHeader>
                  <ContentGrid cols={4}>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#2563eb] rounded-lg"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Primary</BodyText>
                        <CaptionText>#2563eb</CaptionText>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#1d4ed8] rounded-lg"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Primary Hover</BodyText>
                        <CaptionText>#1d4ed8</CaptionText>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#dbeafe] rounded-lg border"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Primary Light</BodyText>
                        <CaptionText>#dbeafe</CaptionText>
                      </div>
                    </div>
                  </ContentGrid>
                </div>

                <div>
                  <SubsectionHeader>Semantic Colors</SubsectionHeader>
                  <ContentGrid cols={4}>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#10b981] rounded-lg"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Success</BodyText>
                        <CaptionText>#10b981</CaptionText>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#f59e0b] rounded-lg"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Warning</BodyText>
                        <CaptionText>#f59e0b</CaptionText>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#ef4444] rounded-lg"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Danger</BodyText>
                        <CaptionText>#ef4444</CaptionText>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 bg-[#6b7280] rounded-lg"></div>
                      <div className="text-center">
                        <BodyText className="font-medium">Neutral</BodyText>
                        <CaptionText>#6b7280</CaptionText>
                      </div>
                    </div>
                  </ContentGrid>
                </div>
              </div>
            </Section>

            <Section>
              <SectionHeader>Spacing Scale</SectionHeader>
              <div className="space-y-4">
                {[
                  { name: 'xs', size: '4px', class: 'w-1' },
                  { name: 'sm', size: '8px', class: 'w-2' },
                  { name: 'md', size: '16px', class: 'w-4' },
                  { name: 'lg', size: '24px', class: 'w-6' },
                  { name: 'xl', size: '32px', class: 'w-8' },
                  { name: '2xl', size: '48px', class: 'w-12' },
                  { name: '3xl', size: '64px', class: 'w-16' },
                ].map((space) => (
                  <FlexContainer key={space.name} align="center" gap="md">
                    <div className={`${space.class} h-4 bg-blue-500 rounded`}></div>
                    <BodyText className="font-medium w-16">{space.name}</BodyText>
                    <CaptionText>{space.size}</CaptionText>
                  </FlexContainer>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-8">
            <Section>
              <SectionHeader>Typography Hierarchy</SectionHeader>
              <div className="space-y-6">
                <div>
                  <PageTitle>Page Title (text-3xl font-bold)</PageTitle>
                  <CaptionText>Used for main page headings</CaptionText>
                </div>
                <div>
                  <SectionHeader>Section Header (text-2xl font-semibold)</SectionHeader>
                  <CaptionText>Used for major section divisions</CaptionText>
                </div>
                <div>
                  <SubsectionHeader>Subsection Header (text-xl font-medium)</SubsectionHeader>
                  <CaptionText>Used for subsection headings</CaptionText>
                </div>
                <div>
                  <BodyText>Body Text (text-base) - This is the standard text used for content, descriptions, and general reading material throughout the application.</BodyText>
                  <CaptionText>Standard content text</CaptionText>
                </div>
                <div>
                  <HelpText>Help Text (text-sm text-gray-500) - Used for supplementary information and guidance.</HelpText>
                  <CaptionText>Secondary information</CaptionText>
                </div>
                <div>
                  <CaptionText>Caption Text (text-xs text-gray-400) - Used for labels, timestamps, and minor details.</CaptionText>
                </div>
              </div>
            </Section>
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-8">
            <Section>
              <SectionHeader>Button Variants</SectionHeader>
              <div className="space-y-6">
                <div>
                  <SubsectionHeader>Primary Buttons</SubsectionHeader>
                  <FlexContainer gap="md">
                    <ButtonRedesigned variant="primary" size="sm">Small Primary</ButtonRedesigned>
                    <ButtonRedesigned variant="primary" size="md">Medium Primary</ButtonRedesigned>
                    <ButtonRedesigned variant="primary" size="lg">Large Primary</ButtonRedesigned>
                  </FlexContainer>
                </div>
                
                <div>
                  <SubsectionHeader>Secondary Buttons</SubsectionHeader>
                  <FlexContainer gap="md">
                    <ButtonRedesigned variant="secondary" size="sm">Small Secondary</ButtonRedesigned>
                    <ButtonRedesigned variant="secondary" size="md">Medium Secondary</ButtonRedesigned>
                    <ButtonRedesigned variant="secondary" size="lg">Large Secondary</ButtonRedesigned>
                  </FlexContainer>
                </div>

                <div>
                  <SubsectionHeader>Ghost Buttons</SubsectionHeader>
                  <FlexContainer gap="md">
                    <ButtonRedesigned variant="ghost" size="sm">Small Ghost</ButtonRedesigned>
                    <ButtonRedesigned variant="ghost" size="md">Medium Ghost</ButtonRedesigned>
                    <ButtonRedesigned variant="ghost" size="lg">Large Ghost</ButtonRedesigned>
                  </FlexContainer>
                </div>

                <div>
                  <SubsectionHeader>Danger Buttons</SubsectionHeader>
                  <FlexContainer gap="md">
                    <ButtonRedesigned variant="danger" size="sm">Small Danger</ButtonRedesigned>
                    <ButtonRedesigned variant="danger" size="md">Medium Danger</ButtonRedesigned>
                    <ButtonRedesigned variant="danger" size="lg">Large Danger</ButtonRedesigned>
                  </FlexContainer>
                </div>

                <div>
                  <SubsectionHeader>Disabled States</SubsectionHeader>
                  <FlexContainer gap="md">
                    <ButtonRedesigned variant="primary" disabled>Disabled Primary</ButtonRedesigned>
                    <ButtonRedesigned variant="secondary" disabled>Disabled Secondary</ButtonRedesigned>
                    <ButtonRedesigned variant="ghost" disabled>Disabled Ghost</ButtonRedesigned>
                    <ButtonRedesigned variant="danger" disabled>Disabled Danger</ButtonRedesigned>
                  </FlexContainer>
                </div>
              </div>
            </Section>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-8">
            <Section>
              <SectionHeader>Form Components</SectionHeader>
              <ContentGrid cols={2}>
                <div>
                  <SubsectionHeader>Standard Form Fields</SubsectionHeader>
                  <div className="space-y-4">
                    <FormFieldRedesigned label="Email Address" required>
                      <InputRedesigned
                        type="email"
                        placeholder="teacher@school.edu"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        helpText="We'll use this for login and communications"
                      />
                    </FormFieldRedesigned>

                    <FormFieldRedesigned label="Password">
                      <InputRedesigned
                        type="password"
                        placeholder="Enter your password"
                      />
                    </FormFieldRedesigned>

                    <FormFieldRedesigned label="Message">
                      <TextareaRedesigned
                        placeholder="Enter your message here..."
                        helpText="Maximum 500 characters"
                      />
                    </FormFieldRedesigned>
                  </div>
                </div>

                <div>
                  <SubsectionHeader>Error States</SubsectionHeader>
                  <div className="space-y-4">
                    <FormFieldRedesigned label="Email Address" required>
                      <InputRedesigned
                        type="email"
                        placeholder="teacher@school.edu"
                        error={true}
                        helpText="Please enter a valid email address"
                      />
                    </FormFieldRedesigned>

                    <FormFieldRedesigned label="Required Field" required>
                      <InputRedesigned
                        type="text"
                        placeholder="This field is required"
                        error={true}
                        helpText="This field cannot be empty"
                      />
                    </FormFieldRedesigned>

                    <FormFieldRedesigned label="Comments">
                      <TextareaRedesigned
                        placeholder="Add your comments..."
                        error={true}
                        helpText="Comments must be at least 10 characters long"
                      />
                    </FormFieldRedesigned>
                  </div>
                </div>
              </ContentGrid>
            </Section>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-8">
            <Section>
              <SectionHeader>Card Components</SectionHeader>
              <ContentGrid cols={2}>
                <CardRedesigned>
                  <CardHeaderRedesigned>
                    <CardTitleRedesigned>Student Performance Overview</CardTitleRedesigned>
                    <CardDescriptionRedesigned>
                      Track individual student progress and achievements
                    </CardDescriptionRedesigned>
                  </CardHeaderRedesigned>
                  <CardContentRedesigned>
                    <BodyText>
                      This card demonstrates the standard layout with a header containing a title and description,
                      followed by the main content area with proper spacing and typography.
                    </BodyText>
                    <Spacer size="md" />
                    <HelpText>
                      Cards automatically include hover effects with subtle shadow increases to provide
                      visual feedback during user interaction.
                    </HelpText>
                  </CardContentRedesigned>
                  <CardFooterRedesigned>
                    <FlexContainer justify="end" gap="sm">
                      <ButtonRedesigned variant="secondary" size="sm">View Details</ButtonRedesigned>
                      <ButtonRedesigned variant="primary" size="sm">Edit</ButtonRedesigned>
                    </FlexContainer>
                  </CardFooterRedesigned>
                </CardRedesigned>

                <CardRedesigned>
                  <CardHeaderRedesigned>
                    <CardTitleRedesigned>Quick Actions</CardTitleRedesigned>
                  </CardHeaderRedesigned>
                  <CardContentRedesigned>
                    <div className="space-y-3">
                      <ButtonRedesigned variant="primary" className="w-full">Add New Student</ButtonRedesigned>
                      <ButtonRedesigned variant="secondary" className="w-full">Import Class Roster</ButtonRedesigned>
                      <ButtonRedesigned variant="secondary" className="w-full">Create Assessment</ButtonRedesigned>
                      <ButtonRedesigned variant="ghost" className="w-full">View Reports</ButtonRedesigned>
                    </div>
                  </CardContentRedesigned>
                </CardRedesigned>
              </ContentGrid>
            </Section>
          </TabsContent>

          {/* Layouts Tab */}
          <TabsContent value="layouts" className="space-y-8">
            <Section>
              <SectionHeader>Layout Patterns</SectionHeader>
              
              <div className="space-y-8">
                <div>
                  <SubsectionHeader>Content Grids</SubsectionHeader>
                  <div className="space-y-4">
                    <BodyText>2-Column Grid:</BodyText>
                    <ContentGrid cols={2}>
                      <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CaptionText>Column 1</CaptionText>
                      </div>
                      <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CaptionText>Column 2</CaptionText>
                      </div>
                    </ContentGrid>

                    <BodyText>3-Column Grid:</BodyText>
                    <ContentGrid cols={3}>
                      <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CaptionText>Column 1</CaptionText>
                      </div>
                      <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CaptionText>Column 2</CaptionText>
                      </div>
                      <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CaptionText>Column 3</CaptionText>
                      </div>
                    </ContentGrid>

                    <BodyText>4-Column Grid:</BodyText>
                    <ContentGrid cols={4}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CaptionText>Column {i}</CaptionText>
                        </div>
                      ))}
                    </ContentGrid>
                  </div>
                </div>

                <div>
                  <SubsectionHeader>Flex Containers</SubsectionHeader>
                  <div className="space-y-4">
                    <BodyText>Horizontal Layout with Center Alignment:</BodyText>
                    <FlexContainer align="center" justify="between" className="p-4 bg-gray-50 rounded-lg">
                      <BodyText>Left Content</BodyText>
                      <ButtonRedesigned variant="secondary" size="sm">Action</ButtonRedesigned>
                      <BodyText>Right Content</BodyText>
                    </FlexContainer>

                    <BodyText>Vertical Layout:</BodyText>
                    <FlexContainer direction="col" gap="md" className="p-4 bg-gray-50 rounded-lg">
                      <BodyText>Item 1</BodyText>
                      <BodyText>Item 2</BodyText>
                      <BodyText>Item 3</BodyText>
                    </FlexContainer>
                  </div>
                </div>

                <div>
                  <SubsectionHeader>Spacing Controls</SubsectionHeader>
                  <div className="space-y-2">
                    <FlexContainer gap="xs" className="p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-200 rounded"></div>
                      <BodyText>Extra Small Gap (xs)</BodyText>
                    </FlexContainer>
                    <FlexContainer gap="sm" className="p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-200 rounded"></div>
                      <BodyText>Small Gap (sm)</BodyText>
                    </FlexContainer>
                    <FlexContainer gap="md" className="p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-200 rounded"></div>
                      <BodyText>Medium Gap (md)</BodyText>
                    </FlexContainer>
                    <FlexContainer gap="lg" className="p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-200 rounded"></div>
                      <BodyText>Large Gap (lg)</BodyText>
                    </FlexContainer>
                    <FlexContainer gap="xl" className="p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-200 rounded"></div>
                      <BodyText>Extra Large Gap (xl)</BodyText>
                    </FlexContainer>
                  </div>
                </div>
              </div>
            </Section>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </PageShell>
  );
};

export default DesignSystem;
