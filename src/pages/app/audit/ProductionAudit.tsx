
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProductionReadinessAudit from '@/components/audit/ProductionReadinessAudit';
import RealTimeMonitoringDashboard from '@/components/monitoring/RealTimeMonitoringDashboard';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductionAudit = () => {
  return (
    <AppLayout>
      <Breadcrumbs />
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audit">Production Audit</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit">
          <ProductionReadinessAudit />
        </TabsContent>
        
        <TabsContent value="monitoring">
          <RealTimeMonitoringDashboard />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default ProductionAudit;
