
import { AuditCategory, AuditResult, ComprehensiveAuditReport } from '@/types/audit';
import { runDatabaseAudit } from './audit/database-audit';
import { runSecurityAudit } from './audit/security-audit';
import { runMonitoringAudit } from './audit/monitoring-audit';
import { runConfigurationAudit } from './audit/configuration-audit';
import { functionalityAudit } from './audit/functionality-audit';
import { runPerformanceAudit } from './audit/performance-audit';

export class ComprehensiveAuditService {
  
  async runCompleteAudit(): Promise<ComprehensiveAuditReport> {
    console.log('🚀 Starting Comprehensive Application Audit...');
    
    const categories: AuditCategory[] = [
      {
        id: 'database',
        name: 'Database',
        description: 'Database connectivity, performance, and data integrity',
        checks: [],
        score: 0
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Authentication, authorization, and security policies',
        checks: [],
        score: 0
      },
      {
        id: 'functionality',
        name: 'Functionality',
        description: 'Core application features and user workflows',
        checks: [],
        score: 0
      },
      {
        id: 'performance',
        name: 'Performance',
        description: 'Application speed, responsiveness, and optimization',
        checks: [],
        score: 0
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        description: 'Error tracking, logging, and observability',
        checks: [],
        score: 0
      },
      {
        id: 'configuration',
        name: 'Configuration',
        description: 'Build settings, environment, and deployment readiness',
        checks: [],
        score: 0
      }
    ];

    // Run all audit categories
    try {
      await Promise.all([
        runDatabaseAudit(categories[0]),
        runSecurityAudit(categories[1]),
        // functionalityAudit runs separately
        runPerformanceAudit(categories[3]),
        runMonitoringAudit(categories[4]),
        runConfigurationAudit(categories[5])
      ]);
    } catch (error) {
      console.error('Audit execution failed:', error);
    }

    // Calculate overall score
    const totalChecks = categories.reduce((acc, cat) => acc + cat.checks.length, 0);
    const passedChecks = categories.reduce((acc, cat) => 
      acc + cat.checks.filter(check => check.status === 'pass').length, 0
    );
    const overallScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    // Identify critical issues
    const criticalIssues = categories
      .flatMap(cat => cat.checks)
      .filter(check => check.status === 'fail');

    // Generate recommendations
    const recommendations = this.generateRecommendations(categories, criticalIssues);

    const report: ComprehensiveAuditReport = {
      timestamp: new Date().toISOString(),
      categories,
      overallScore: Math.round(overallScore * 100) / 100,
      criticalIssues,
      recommendations
    };

    this.logAuditSummary(report);
    return report;
  }

  private generateRecommendations(categories: AuditCategory[], criticalIssues: AuditResult[]): string[] {
    const recommendations: string[] = [];

    // Critical issue recommendations
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical issues immediately`);
      
      const criticalByCategory = criticalIssues.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(criticalByCategory).forEach(([category, count]) => {
        recommendations.push(`Fix ${count} critical ${category} issue${count > 1 ? 's' : ''}`);
      });
    }

    // Category-specific recommendations
    categories.forEach(category => {
      const warnings = category.checks.filter(check => check.status === 'warning');
      if (warnings.length > 0) {
        recommendations.push(`Review ${warnings.length} warning${warnings.length > 1 ? 's' : ''} in ${category.name.toLowerCase()}`);
      }

      if (category.score < 80) {
        recommendations.push(`Improve ${category.name.toLowerCase()} score (currently ${Math.round(category.score)}%)`);
      }
    });

    // General recommendations based on audit results
    const functionalityCategory = categories.find(c => c.name === 'Functionality');
    const performanceCategory = categories.find(c => c.name === 'Performance');

    if (functionalityCategory && functionalityCategory.score < 90) {
      recommendations.push('Test all core workflows with sample data');
      recommendations.push('Verify CRUD operations across all features');
    }

    if (performanceCategory && performanceCategory.score < 80) {
      recommendations.push('Optimize database queries and implement caching');
      recommendations.push('Consider code splitting and bundle optimization');
    }

    // API key recommendations
    const hasApiKeyIssues = categories.some(cat => 
      cat.checks.some(check => 
        check.message.includes('API_KEY') || check.recommendation?.includes('API_KEY')
      )
    );

    if (hasApiKeyIssues) {
      recommendations.push('Configure required API keys: ANTHROPIC_API_KEY for AI features, RESEND_API_KEY for emails');
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  private logAuditSummary(report: ComprehensiveAuditReport): void {
    console.log('\n📊 COMPREHENSIVE AUDIT REPORT');
    console.log('=====================================');
    console.log(`Overall Score: ${report.overallScore.toFixed(1)}%`);
    console.log(`Critical Issues: ${report.criticalIssues.length}`);
    console.log(`Total Checks: ${report.categories.reduce((acc, cat) => acc + cat.checks.length, 0)}`);

    console.log('\n📈 CATEGORY SCORES:');
    report.categories.forEach(category => {
      const icon = category.score >= 90 ? '🟢' : category.score >= 70 ? '🟡' : '🔴';
      console.log(`${icon} ${category.name}: ${category.score.toFixed(1)}% (${category.checks.filter(c => c.status === 'pass').length}/${category.checks.length} passed)`);
    });

    if (report.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      report.criticalIssues.forEach(issue => {
        console.log(`- ${issue.category.toUpperCase()}: ${issue.check} - ${issue.message}`);
      });
    }

    console.log('\n💡 TOP RECOMMENDATIONS:');
    report.recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    if (report.overallScore >= 90) {
      console.log('\n🎉 EXCELLENT! Your application is production-ready.');
    } else if (report.overallScore >= 80) {
      console.log('\n✅ GOOD! Address the critical issues to achieve production readiness.');
    } else if (report.overallScore >= 70) {
      console.log('\n⚠️  NEEDS IMPROVEMENT! Several areas require attention before production.');
    } else {
      console.log('\n🔧 SIGNIFICANT WORK NEEDED! Major improvements required for production readiness.');
    }

    console.log('=====================================\n');
  }
}

export const comprehensiveAuditService = new ComprehensiveAuditService();
