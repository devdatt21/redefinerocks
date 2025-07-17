'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Signin':
        return 'Sign in failed. Please try again.';
      case 'OAuthSignin':
        return 'OAuth sign in failed. Please try again.';
      case 'OAuthCallback':
        return 'OAuth callback failed. Please try again.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account. Please try again.';
      case 'EmailCreateAccount':
        return 'Could not create account. Please try again.';
      case 'Callback':
        return 'Callback URL error. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'Account already exists with different provider.';
      case 'EmailSignin':
        return 'Email sign in failed. Please try again.';
      case 'CredentialsSignin':
        return 'Credentials sign in failed. Please check your details.';
      case 'SessionRequired':
        return 'You must be signed in to access this page.';
      case 'AccessDenied':
        return 'Access denied. Only @redefinesolutions.com emails are allowed.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getErrorMessage()}
          </p>

          {error === 'AccessDenied' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only employees with @redefinesolutions.com email addresses can access this application.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button variant="primary" className="w-full">
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="secondary" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait while we process your request.</p>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
