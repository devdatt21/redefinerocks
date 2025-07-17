'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.endsWith('@redefinesolutions.com')) {
      toast.error('Only @redefinesolutions.com email addresses are allowed');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials. Please check your email and password.');
      } else {
        toast.success('Welcome to Q&A Hub!');
        router.push('/');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="bg-white/50 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Welcome to Q&A Hub
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Connect, ask questions, and share knowledge with your team at <span className="font-semibold text-blue-600">Redefine Solutions</span> ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address 📧"
            type="email"
            placeholder="your.name@redefinesolutions.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password 🔑"
            type="password"
            placeholder="Enter company password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </div>
            ) : (
              '🚀 Sign In'
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 p-5 rounded-xl mb-4 backdrop-blur-sm">
            <div className="text-center text-sm text-blue-800">
              <p className="font-semibold mb-3 flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Authentication Details:
              </p>
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Only @redefinesolutions.com emails are allowed
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Use the shared company password
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Contact admin if you need access
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 bg-gray-50/50 backdrop-blur-sm p-4 rounded-xl">
            <p className="mb-3 font-semibold flex items-center justify-center">
              <span className="mr-2">🎯</span>
              Features you&apos;ll get access to:
            </p>
            <ul className="text-left space-y-2 text-xs">
              <li className="flex items-center">
                <span className="mr-2">❓</span>
                Ask questions to your team
              </li>
              <li className="flex items-center">
                <span className="mr-2">🎤</span>
                Answer with text or voice
              </li>
              <li className="flex items-center">
                <span className="mr-2">📁</span>
                Organize questions by groups
              </li>
              <li className="flex items-center">
                <span className="mr-2">🔍</span>
                Search and discover knowledge
              </li>
              <li className="flex items-center">
                <span className="mr-2">❤️</span>
                Like and interact with content
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
