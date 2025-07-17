'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MainApp } from '@/components/MainApp';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center bg-white/50 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-300 mx-auto opacity-20"></div>
          </div>
          <p className="text-gray-700 font-medium text-lg">✨ Loading your workspace...</p>
          <p className="text-gray-500 text-sm mt-2">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return <MainApp />;
}
