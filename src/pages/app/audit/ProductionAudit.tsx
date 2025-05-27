
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProductionReadinessAudit from '@/components/audit/ProductionReadinessAudit';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const ProductionAudit = () => {
  return (
    <AppLayout>
      <Breadcrumbs />
      <ProductionReadinessAudit />
    </AppLayout>
  );
};

export default ProductionAudit;
