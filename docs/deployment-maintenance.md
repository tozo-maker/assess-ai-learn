# LearnSpark AI - Deployment & Maintenance Guide

## Overview

This guide covers deployment strategies, monitoring, maintenance procedures, and operational best practices for LearnSpark AI in production environments.

## Deployment Architecture

### Production Environment Structure

```
Production Stack:
├── Frontend (React/Vite)
│   ├── Lovable Platform (Primary)
│   ├── CDN Distribution
│   └── Custom Domain (Optional)
├── Backend (Supabase)
│   ├── Database (PostgreSQL)
│   ├── Edge Functions (Deno)
│   ├── Authentication
│   ├── Storage
│   └── Real-time subscriptions
└── External Services
    ├── OpenAI (AI Analysis)
    ├── Anthropic (Backup AI)
    └── Resend (Email delivery)
```

## Pre-Deployment Checklist

### Code Quality & Security

- [ ] All TypeScript errors resolved
- [ ] Security validation implemented for all inputs
- [ ] Rate limiting configured for API endpoints
- [ ] Environment variables properly configured
- [ ] Error handling and logging in place
- [ ] Performance optimizations applied

### Database Preparation

- [ ] All migrations tested and applied
- [ ] RLS policies verified and tested
- [ ] Database indexes optimized
- [ ] Backup strategy configured
- [ ] Connection limits appropriate for load

### Supabase Configuration

- [ ] Production database configured
- [ ] API keys and secrets set
- [ ] Edge functions deployed and tested
- [ ] Storage buckets created (if needed)
- [ ] Real-time features configured

## Deployment Process

### 1. Frontend Deployment (Lovable)

LearnSpark AI is deployed through the Lovable platform, which provides:

- Automatic builds from code changes
- CDN distribution for optimal performance
- SSL certificates and security
- Built-in monitoring and analytics

#### Custom Domain Setup

1. **Purchase Domain**: Acquire your custom domain
2. **Configure DNS**: Point domain to Lovable infrastructure
3. **SSL Setup**: Automatic SSL certificate provisioning
4. **Domain Verification**: Verify ownership and activation

```bash
# Example DNS configuration
CNAME   www.yourschool.com   yourproject.lovable.app
A       yourschool.com       [Lovable IP Address]
```

### 2. Backend Deployment (Supabase)

#### Edge Functions Deployment

Edge functions are automatically deployed when code is updated:

```typescript
// supabase/functions/analyze-student-assessment/index.ts
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Function code automatically deployed on commit
```

#### Database Migrations

```sql
-- Apply production migrations
-- These are executed through the lov-supabase-migration tool

-- Example: Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for teachers to view their audit logs
CREATE POLICY "Teachers can view their audit logs" ON audit_logs
FOR SELECT USING (auth.uid() = user_id);
```

### 3. External Service Configuration

#### OpenAI Integration

```typescript
// Configured through Supabase secrets
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Usage tracking and rate limiting
const OPENAI_RATE_LIMIT = 100; // requests per hour
```

#### Email Service (Resend)

```typescript
// Email configuration through Supabase secrets
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = 'noreply@learnspark.ai';
```

## Environment Configuration

### Production Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://etlkxmgdmzzysmgkbudx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[Service Role Key]

# AI Services
OPENAI_API_KEY=[OpenAI API Key]
ANTHROPIC_API_KEY=[Anthropic API Key]

# Email Service
RESEND_API_KEY=[Resend API Key]

# Application Settings
NODE_ENV=production
APP_NAME=LearnSpark AI
APP_VERSION=1.0.0
```

### Security Configuration

```typescript
// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourschool.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

// Rate limiting configuration
const rateLimits = {
  api: { limit: 1000, window: 3600 }, // 1000 requests per hour
  ai: { limit: 100, window: 3600 },   // 100 AI requests per hour
  auth: { limit: 10, window: 900 }    // 10 auth attempts per 15 minutes
};
```

## Monitoring & Analytics

### Application Monitoring

```typescript
// Production monitoring setup
import { analyticsService } from '@/services/analytics-service';

// Initialize monitoring in production
if (process.env.NODE_ENV === 'production') {
  // Performance monitoring
  analyticsService.trackPageView(window.location.pathname);
  
  // Error tracking
  window.addEventListener('error', (event) => {
    analyticsService.trackCustomError(event.error, {
      page: window.location.pathname,
      timestamp: Date.now()
    });
  });
  
  // User behavior tracking
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.matches('[data-track]')) {
      analyticsService.trackClick(
        target.getAttribute('data-track') || 'unknown',
        window.location.pathname
      );
    }
  });
}
```

### Database Monitoring

```sql
-- Create monitoring views
CREATE OR REPLACE VIEW system_health AS
SELECT 
  'database_connections' as metric,
  count(*) as value,
  now() as timestamp
FROM pg_stat_activity
WHERE state = 'active'

UNION ALL

SELECT 
  'average_response_time' as metric,
  AVG(response_time_ms) as value,
  now() as timestamp
FROM system_performance_logs 
WHERE created_at > now() - interval '1 hour';

-- Monitor slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 -- Queries taking more than 1 second
ORDER BY mean_exec_time DESC;
```

### Performance Metrics

Key metrics to monitor in production:

1. **Response Times**
   - Page load times
   - API response times
   - Database query performance

2. **Error Rates**
   - JavaScript errors
   - API error rates
   - Database connection errors

3. **User Engagement**
   - Active users
   - Feature usage
   - Session duration

4. **Resource Utilization**
   - Database connections
   - Edge function execution time
   - Storage usage

## Maintenance Procedures

### Daily Maintenance

```bash
#!/bin/bash
# Daily maintenance script

echo "Starting daily maintenance..."

# Check system health
curl -f https://etlkxmgdmzzysmgkbudx.supabase.co/health || echo "Database health check failed"

# Monitor error rates
psql $DATABASE_URL -c "
SELECT 
  DATE(created_at) as date,
  COUNT(*) as error_count
FROM system_performance_logs 
WHERE status_code >= 400 
  AND created_at > CURRENT_DATE
GROUP BY DATE(created_at);
"

# Check disk usage
psql $DATABASE_URL -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"

echo "Daily maintenance completed"
```

### Weekly Maintenance

```sql
-- Weekly database maintenance
BEGIN;

-- Update table statistics
ANALYZE;

-- Clean up old performance logs (keep 30 days)
DELETE FROM system_performance_logs 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Clean up old analytics data (keep 90 days)
-- This would be done in the analytics service

-- Vacuum full on large tables (if needed)
-- VACUUM FULL large_table_name;

-- Check for unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
ORDER BY schemaname, tablename;

COMMIT;
```

### Monthly Maintenance

1. **Performance Review**
   - Analyze response time trends
   - Review error patterns
   - Optimize slow queries

2. **Security Audit**
   - Review access logs
   - Update dependencies
   - Check for security vulnerabilities

3. **Capacity Planning**
   - Review storage usage growth
   - Plan for user growth
   - Optimize resource allocation

4. **Backup Verification**
   - Test backup restoration
   - Verify backup integrity
   - Update disaster recovery procedures

## Backup & Disaster Recovery

### Automated Backups

Supabase provides automated backups:

- **Daily backups** retained for 7 days
- **Weekly backups** retained for 4 weeks
- **Monthly backups** retained for 12 months

### Manual Backup Procedures

```bash
#!/bin/bash
# Manual backup script

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/learnspark"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/database_$BACKUP_DATE.sql

# Compress backup
gzip $BACKUP_DIR/database_$BACKUP_DATE.sql

# Upload to secure storage (if configured)
# aws s3 cp $BACKUP_DIR/database_$BACKUP_DATE.sql.gz s3://backup-bucket/

echo "Backup completed: database_$BACKUP_DATE.sql.gz"
```

### Disaster Recovery Plan

#### Recovery Time Objectives (RTO)
- **Database**: < 1 hour
- **Application**: < 30 minutes
- **User data**: < 2 hours

#### Recovery Procedures

1. **Database Corruption**
   ```bash
   # Restore from latest backup
   psql $DATABASE_URL < backup_file.sql
   
   # Verify data integrity
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM students;"
   ```

2. **Application Failure**
   ```bash
   # Redeploy application
   # Lovable handles automatic redeployment
   
   # Verify services
   curl -f https://yourapp.lovable.app/health
   ```

3. **Data Loss Scenarios**
   - Point-in-time recovery using Supabase backups
   - Restore specific tables if needed
   - Verify user authentication still works

## Security Hardening

### Production Security Checklist

- [ ] HTTPS enforced for all connections
- [ ] API rate limiting configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection enabled
- [ ] XSS protection headers configured
- [ ] CSRF protection implemented
- [ ] Regular security updates applied

### Access Control

```sql
-- Implement principle of least privilege
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Grant specific permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON assessments TO authenticated;

-- Create read-only user for reporting
CREATE ROLE reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;
```

### Audit Logging

```typescript
// Implement comprehensive audit logging
export const auditLogger = {
  logAction: async (userId: string, action: string, resource: string, resourceId?: string) => {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resource,
      resource_id: resourceId,
      timestamp: new Date().toISOString(),
      metadata: {
        ip_address: getClientIP(),
        user_agent: navigator.userAgent
      }
    });
  }
};

// Usage example
await auditLogger.logAction(
  userId, 
  'CREATE', 
  'student', 
  newStudent.id
);
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_students_teacher_grade 
ON students(teacher_id, grade_level);

CREATE INDEX CONCURRENTLY idx_assessments_teacher_date 
ON assessments(teacher_id, assessment_date);

CREATE INDEX CONCURRENTLY idx_student_responses_assessment 
ON student_responses(assessment_id, student_id);

-- Optimize frequently used queries
CREATE MATERIALIZED VIEW student_performance_summary AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.grade_level,
  sp.average_score,
  sp.assessment_count,
  sp.needs_attention
FROM students s
LEFT JOIN student_performance sp ON s.id = sp.student_id;

-- Refresh materialized view nightly
SELECT cron.schedule(
  'refresh-performance-summary',
  '0 2 * * *', -- 2 AM daily
  'REFRESH MATERIALIZED VIEW CONCURRENTLY student_performance_summary;'
);
```

### Application Performance

```typescript
// Implement caching strategies
const cache = new Map();

export const getCachedStudents = async (teacherId: string) => {
  const cacheKey = `students_${teacherId}`;
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    
    // Cache for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('teacher_id', teacherId);
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};
```

## Troubleshooting Guide

### Common Issues

1. **Slow Page Loading**
   ```typescript
   // Check performance metrics
   const metrics = analyticsService.getPerformanceMetrics();
   
   // Optimize large queries
   const students = await supabase
     .from('students')
     .select('id, first_name, last_name, grade_level') // Only select needed fields
     .limit(50); // Implement pagination
   ```

2. **Database Connection Issues**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Kill long-running queries
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE state = 'active' 
     AND query_start < now() - interval '5 minutes';
   ```

3. **High Error Rates**
   ```typescript
   // Review error logs
   const errors = await supabase
     .from('system_performance_logs')
     .select('*')
     .gte('status_code', 400)
     .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
   
   // Group by error type
   const errorsByType = errors.reduce((acc, error) => {
     acc[error.status_code] = (acc[error.status_code] || 0) + 1;
     return acc;
   }, {});
   ```

### Emergency Procedures

1. **Database Emergency**
   - Contact Supabase support immediately
   - Switch to read-only mode if possible
   - Implement emergency maintenance page

2. **Application Down**
   - Check Lovable platform status
   - Review recent deployments
   - Implement rollback if necessary

3. **Data Corruption**
   - Stop all write operations
   - Assess corruption scope
   - Restore from backup
   - Communicate with affected users

## Support & Documentation

### Internal Documentation

- **Architecture diagrams** - Keep system architecture up to date
- **API documentation** - Maintain current API specifications
- **Deployment procedures** - Document all deployment steps
- **Troubleshooting guides** - Common issues and solutions

### User Support

1. **Help Documentation** - Comprehensive user guides
2. **Video Tutorials** - Key feature demonstrations
3. **FAQ Section** - Common user questions
4. **Support Ticket System** - User issue tracking

### Development Team Resources

- **Code review checklists**
- **Testing procedures**
- **Performance benchmarks**
- **Security guidelines**

This comprehensive deployment and maintenance guide ensures LearnSpark AI operates reliably and securely in production environments while providing clear procedures for ongoing maintenance and troubleshooting.