import React from 'react';
import { useSEO } from '@/hooks/useSEO';

const SystemOverview: React.FC = () => {
  useSEO({
    title: 'System Overview | LearnSpark AI',
    description: 'Architecture and quality audit overview for LearnSpark AI.',
    canonicalPath: '/app/help/system-overview'
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
          <p className="text-muted-foreground mt-2">High-level product map and audit links for LearnSpark AI.</p>
        </div>
      </header>
      <section className="max-w-7xl mx-auto px-4 py-8 grid gap-6">
        <article className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground">Core Modules</h2>
          <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-1">
            <li>Students and Classes management</li>
            <li>Assessments and AI analysis</li>
            <li>Insights and Recommendations</li>
            <li>Goals and Progress tracking</li>
            <li>Reports and Communications</li>
          </ul>
        </article>
        <article className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground">Quality & Security</h2>
          <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-1">
            <li>Run Testing Suite: /app/testing</li>
            <li>Audit: /app/audit and /app/audit/comprehensive</li>
            <li>Verification: /app/verification</li>
          </ul>
        </article>
      </section>
    </main>
  );
};

export default SystemOverview;
