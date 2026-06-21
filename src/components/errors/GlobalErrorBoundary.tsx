'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { classifyError, toSentryLevel, type SentryComponent, type SentrySeverity, type SentryUserImpact } from '@/lib/sentry/errorClassification';
import { ErrorFallback } from './ErrorFallback';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  component?: SentryComponent;
  severity?: SentrySeverity;
  userImpact?: SentryUserImpact;
}

interface GlobalErrorBoundaryState {
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const classification = classifyError(error, {
      component: this.props.component,
      severity: this.props.severity,
      userImpact: this.props.userImpact,
    });

    Sentry.withScope((scope) => {
      scope.setLevel(toSentryLevel(classification.severity));
      scope.setTags({
        severity: classification.severity,
        component: classification.component,
        user_impact: classification.userImpact,
      });
      if (errorInfo.componentStack) {
        scope.setContext('component_stack', { stack: errorInfo.componentStack });
      }
      Sentry.captureException(error);
    });
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
