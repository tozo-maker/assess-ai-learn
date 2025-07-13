# LearnSpark AI - API Documentation

## Overview

LearnSpark AI provides a comprehensive API for managing educational data, assessments, and analytics. The API is built on Supabase and follows RESTful principles with Row Level Security (RLS) for data protection.

## Authentication

All API requests require authentication using Supabase Auth. Users must be logged in to access any protected resources.

### Authentication Headers

```javascript
const headers = {
  'Authorization': `Bearer ${supabaseToken}`,
  'apikey': 'your-supabase-anon-key',
  'Content-Type': 'application/json'
}
```

## Base URL

```
https://etlkxmgdmzzysmgkbudx.supabase.co/rest/v1/
```

## Core Entities

### Students

Manage student records and information.

#### Create Student

```typescript
POST /students

interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  grade_level: string;
  student_id?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  learning_goals?: string;
  special_considerations?: string;
  class_id?: string;
}

// Example
const response = await supabase
  .from('students')
  .insert({
    first_name: 'John',
    last_name: 'Doe',
    grade_level: '5th Grade',
    parent_email: 'parent@example.com'
  })
```

#### Get Students

```typescript
GET /students

// Get all students for authenticated teacher
const { data: students } = await supabase
  .from('students')
  .select('*')
  .order('last_name', { ascending: true })

// Get student with performance data
const { data: student } = await supabase
  .from('students')
  .select(`
    *,
    student_performance(*),
    goals(*)
  `)
  .eq('id', studentId)
  .single()
```

#### Update Student

```typescript
PATCH /students/{id}

const { data } = await supabase
  .from('students')
  .update({
    parent_email: 'newemail@example.com',
    special_considerations: 'Updated notes'
  })
  .eq('id', studentId)
```

#### Delete Student

```typescript
DELETE /students/{id}

const { error } = await supabase
  .from('students')
  .delete()
  .eq('id', studentId)
```

### Assessments

Manage assessments and student responses.

#### Create Assessment

```typescript
POST /assessments

interface CreateAssessmentRequest {
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  assessment_type: string;
  max_score: number;
  assessment_date?: string;
  standards_covered?: string[];
  is_draft?: boolean;
}

const { data: assessment } = await supabase
  .from('assessments')
  .insert({
    title: 'Math Quiz 1',
    subject: 'Mathematics',
    grade_level: '5th Grade',
    assessment_type: 'Quiz',
    max_score: 100
  })
  .select()
  .single()
```

#### Add Assessment Items

```typescript
POST /assessment_items

interface AssessmentItem {
  assessment_id: string;
  item_number: number;
  question_text: string;
  max_score: number;
  knowledge_type: string;
  difficulty_level: string;
  standard_reference?: string;
}

const { data } = await supabase
  .from('assessment_items')
  .insert([
    {
      assessment_id: assessmentId,
      item_number: 1,
      question_text: 'What is 5 + 3?',
      max_score: 10,
      knowledge_type: 'procedural',
      difficulty_level: 'easy'
    }
  ])
```

#### Record Student Responses

```typescript
POST /student_responses

interface StudentResponse {
  student_id: string;
  assessment_id: string;
  assessment_item_id: string;
  score: number;
  error_type?: string;
  teacher_notes?: string;
}

const { data } = await supabase
  .from('student_responses')
  .insert([
    {
      student_id: studentId,
      assessment_id: assessmentId,
      assessment_item_id: itemId,
      score: 8,
      error_type: 'calculation'
    }
  ])
```

### Goals

Manage student learning goals and track progress.

#### Create Goal

```typescript
POST /goals

interface CreateGoalRequest {
  student_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status?: 'active' | 'completed' | 'paused';
}

const { data: goal } = await supabase
  .from('goals')
  .insert({
    student_id: studentId,
    title: 'Improve multiplication facts',
    description: 'Master 1-12 multiplication tables',
    target_date: '2024-12-31'
  })
  .select()
  .single()
```

#### Track Goal Progress

```typescript
POST /goal_progress_history

const { data } = await supabase
  .from('goal_progress_history')
  .insert({
    goal_id: goalId,
    progress_percentage: 75,
    notes: 'Student showing good improvement'
  })

// Update goal progress
const { data: updatedGoal } = await supabase
  .from('goals')
  .update({ progress_percentage: 75 })
  .eq('id', goalId)
```

## Analytics and Insights

### Assessment Analysis

Get AI-powered assessment analysis for students.

```typescript
// Get analysis for specific student assessment
const { data: analysis } = await supabase
  .from('assessment_analysis')
  .select('*')
  .eq('student_id', studentId)
  .eq('assessment_id', assessmentId)
  .single()

// Analysis includes:
interface AssessmentAnalysis {
  strengths: string[];
  growth_areas: string[];
  patterns_observed: string[];
  recommendations: string[];
  overall_summary: string;
  analysis_json: any;
}
```

### Performance Metrics

```typescript
// Get student performance summary
const { data: performance } = await supabase
  .from('student_performance')
  .select('*')
  .eq('student_id', studentId)
  .single()

interface StudentPerformance {
  assessment_count: number;
  average_score: number;
  last_assessment_date: string;
  needs_attention: boolean;
  performance_level: string;
}
```

### Skill Mastery Tracking

```typescript
// Get student skill mastery
const { data: skills } = await supabase
  .from('student_skills')
  .select(`
    *,
    skills(name, description, subject)
  `)
  .eq('student_id', studentId)

// Get skill mastery history
const { data: history } = await supabase
  .from('skill_mastery_history')
  .select('*')
  .eq('student_id', studentId)
  .eq('skill_id', skillId)
  .order('date_recorded', { ascending: false })
```

## Edge Functions

### AI Assessment Analysis

Analyze student assessment data using AI.

```typescript
POST /functions/v1/analyze-student-assessment

interface AnalysisRequest {
  student_id: string;
  assessment_id: string;
  responses: StudentResponse[];
}

const response = await supabase.functions.invoke('analyze-student-assessment', {
  body: {
    student_id: studentId,
    assessment_id: assessmentId,
    responses: studentResponses
  }
})
```

### Generate Progress Reports

Create PDF progress reports for parent communication.

```typescript
POST /functions/v1/generate-progress-pdf

interface ProgressReportRequest {
  student_id: string;
  report_type: 'comprehensive' | 'summary' | 'goals';
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

const response = await supabase.functions.invoke('generate-progress-pdf', {
  body: {
    student_id: studentId,
    report_type: 'comprehensive'
  }
})
```

### Send Parent Communications

Send automated or manual communications to parents.

```typescript
POST /functions/v1/send-parent-communication

interface CommunicationRequest {
  student_id: string;
  communication_type: 'progress_report' | 'behavior_update' | 'general_update';
  subject: string;
  content: string;
  include_pdf?: boolean;
}

const response = await supabase.functions.invoke('send-parent-communication', {
  body: {
    student_id: studentId,
    communication_type: 'progress_report',
    subject: 'Monthly Progress Update',
    content: 'Your child has made excellent progress...',
    include_pdf: true
  }
})
```

## Error Handling

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  }
}

// Example error response
{
  "error": {
    "message": "Student not found",
    "details": "No student with ID 123 exists for this teacher",
    "code": "PGRST116"
  }
}
```

### Common Error Codes

- `PGRST116` - Resource not found
- `PGRST301` - Row Level Security violation
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42501` - Insufficient privilege

## Rate Limiting

API requests are rate limited to ensure fair usage:

- **Standard requests**: 1000 requests per hour per user
- **AI analysis requests**: 100 requests per hour per user
- **File generation**: 50 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

Large datasets are paginated using range-based pagination:

```typescript
// Get paginated results
const { data, count } = await supabase
  .from('students')
  .select('*', { count: 'exact' })
  .range(0, 9) // First 10 records
  .order('created_at', { ascending: false })

// Pagination metadata
const pagination = {
  total: count,
  page: 1,
  limit: 10,
  hasNext: count > 10,
  hasPrev: false
}
```

## Filtering and Sorting

### Filtering Examples

```typescript
// Filter by grade level
const { data } = await supabase
  .from('students')
  .select('*')
  .eq('grade_level', '5th Grade')

// Filter by date range
const { data } = await supabase
  .from('assessments')
  .select('*')
  .gte('assessment_date', '2024-01-01')
  .lte('assessment_date', '2024-12-31')

// Text search
const { data } = await supabase
  .from('students')
  .select('*')
  .ilike('first_name', '%john%')

// Multiple conditions
const { data } = await supabase
  .from('student_performance')
  .select('*')
  .eq('needs_attention', true)
  .lt('average_score', 70)
```

### Sorting Examples

```typescript
// Sort by name
const { data } = await supabase
  .from('students')
  .select('*')
  .order('last_name', { ascending: true })
  .order('first_name', { ascending: true })

// Sort by date (newest first)
const { data } = await supabase
  .from('assessments')
  .select('*')
  .order('created_at', { ascending: false })
```

## Real-time Subscriptions

Subscribe to real-time updates for collaborative features:

```typescript
// Subscribe to student updates
const subscription = supabase
  .channel('student-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'students'
    },
    (payload) => {
      console.log('Student updated:', payload)
      // Update UI accordingly
    }
  )
  .subscribe()

// Subscribe to goal progress updates
const goalSubscription = supabase
  .channel('goal-progress')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'goal_progress_history'
    },
    (payload) => {
      console.log('Goal progress updated:', payload)
    }
  )
  .subscribe()

// Cleanup subscription
subscription.unsubscribe()
```

## Best Practices

### Performance Optimization

1. **Use selective queries** - Only fetch required fields
2. **Implement pagination** - Don't load all records at once
3. **Use indexes** - Filter on indexed columns when possible
4. **Batch operations** - Group multiple inserts/updates
5. **Cache frequently accessed data** - Use local state or cache

### Security Best Practices

1. **Validate all inputs** - Use the security service validation
2. **Sanitize data** - Clean user inputs before storage
3. **Use RLS policies** - Ensure data isolation between teachers
4. **Audit sensitive operations** - Log important actions
5. **Rate limit requests** - Prevent abuse

### Error Handling

1. **Provide meaningful error messages** - Help users understand issues
2. **Implement retry logic** - Handle temporary failures gracefully
3. **Log errors for debugging** - Track issues for resolution
4. **Fallback gracefully** - Degrade functionality rather than breaking
5. **Validate responses** - Check data integrity

## Code Examples

### Complete Student Management

```typescript
import { supabase } from '@/integrations/supabase/client'
import { validateStudentData } from '@/services/security-service'

class StudentService {
  async createStudent(studentData: any) {
    try {
      // Validate and sanitize input
      const validatedData = validateStudentData(studentData)
      
      // Create student
      const { data: student, error } = await supabase
        .from('students')
        .insert(validatedData)
        .select()
        .single()
      
      if (error) throw error
      
      // Initialize performance record
      await supabase
        .from('student_performance')
        .insert({
          student_id: student.id,
          assessment_count: 0,
          needs_attention: false
        })
      
      return student
    } catch (error) {
      console.error('Failed to create student:', error)
      throw error
    }
  }
  
  async getStudentWithDetails(studentId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        student_performance(*),
        goals(*),
        student_skills(
          *,
          skills(name, subject)
        )
      `)
      .eq('id', studentId)
      .single()
    
    if (error) throw error
    return data
  }
}
```

### Assessment Workflow

```typescript
class AssessmentService {
  async createCompleteAssessment(assessmentData: any, items: any[]) {
    try {
      // Create assessment
      const { data: assessment } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single()
      
      // Add assessment items
      const assessmentItems = items.map((item, index) => ({
        ...item,
        assessment_id: assessment.id,
        item_number: index + 1
      }))
      
      const { data: createdItems } = await supabase
        .from('assessment_items')
        .insert(assessmentItems)
        .select()
      
      return { assessment, items: createdItems }
    } catch (error) {
      console.error('Failed to create assessment:', error)
      throw error
    }
  }
  
  async recordStudentResponses(responses: any[]) {
    const { data, error } = await supabase
      .from('student_responses')
      .insert(responses)
      .select()
    
    if (error) throw error
    
    // Trigger AI analysis
    await supabase.functions.invoke('analyze-student-assessment', {
      body: {
        student_id: responses[0].student_id,
        assessment_id: responses[0].assessment_id,
        responses
      }
    })
    
    return data
  }
}
```

This API documentation provides comprehensive coverage of the LearnSpark AI API, including authentication, CRUD operations, analytics, and best practices for integration.