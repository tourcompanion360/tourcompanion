/**
 * Error Handler Hook
 * Provides error handling utilities for React components
 */

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  errorHandler,
  AppError,
  ErrorType,
  ErrorSeverity,
  createError as createErrorFactory,
} from '@/utils/errorHandler';
import { ERROR_MESSAGES } from '@/config';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: AppError) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { toast } = useToast();
  const {
    showToast = true,
    logError = true,
    onError,
  } = options;

  const handleError = React.useCallback((
    error: any,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
    }
  ) => {
    // Handle error through global error handler
    const appError = logError 
      ? errorHandler.handleError(error, context)
      : error;

    // Show toast notification
    if (showToast) {
      toast({
        title: 'Error',
        description: appError.userMessage || appError.message || ERROR_MESSAGES.unknown,
        variant: 'destructive',
      });
    }

    // Call custom error handler
    if (onError) {
      onError(appError);
    }

    return appError;
  }, [toast, showToast, logError, onError]);

  const handleSuccess = React.useCallback((message: string) => {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
    });
  }, [toast]);

  const handleAsync = React.useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
    }
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  const createCustomError = React.useCallback((
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) => {
    return new AppError(message, type, severity);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleAsync,
    createError: createCustomError,
    // Convenience methods for common error types
    handleNetworkError: (error?: any, context?: any) =>
      handleError(error ?? createErrorFactory.network(), context),
    handleAuthError: (error?: any, context?: any) =>
      handleError(error ?? createErrorFactory.auth(), context),
    handleValidationError: (error?: any, context?: any) =>
      handleError(error ?? createErrorFactory.validation(), context),
    handleNotFoundError: (error?: any, context?: any) =>
      handleError(error ?? createErrorFactory.notFound(), context),
    handleServerError: (error?: any, context?: any) =>
      handleError(error ?? createErrorFactory.server(), context),
  };
};

export default useErrorHandler;

