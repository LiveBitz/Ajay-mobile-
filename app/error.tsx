'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('[ERROR_BOUNDARY]', {
      timestamp: new Date().toISOString(),
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-2.414-2.414a1 1 0 00-.707-.293h-3.172a2 2 0 00-2 2v2m0 0H7a2 2 0 00-2 2v2.586a1 1 0 00.293.707l2.414-2.414A1 1 0 009 9h6z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900">
            Oops! Something went wrong
          </h1>
          <p className="text-zinc-600">
            We're sorry for the inconvenience. An unexpected error occurred while processing your request.
          </p>
        </div>

        {/* Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-xs font-mono text-red-800 break-all">
              {error.message || 'Unknown error'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={reset}
            className="flex-1"
            variant="default"
          >
            Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-xs text-zinc-500 pt-4 border-t">
          <p>
            If this problem persists, please contact our support team at{' '}
            <a href="mailto:support@souled.com" className="text-brand hover:underline">
              support@souled.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
