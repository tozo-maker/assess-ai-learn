
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

// Helper components for legacy redirects with parameters
export const StudentRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/students/${id}`} replace />;
};

export const StudentAssessmentsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/students/${id}/assessments`} replace />;
};

export const StudentInsightsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/students/${id}/insights`} replace />;
};

export const StudentGoalsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/students/${id}/goals`} replace />;
};

export const AssessmentRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/assessments/${id}`} replace />;
};

export const AssessmentAnalysisRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/assessments/${id}/analysis`} replace />;
};

export const AssessmentResponsesRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/assessments/${id}/responses`} replace />;
};
