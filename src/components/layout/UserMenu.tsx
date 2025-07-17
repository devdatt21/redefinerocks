'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Settings } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100/50 transition-all duration-200 border border-transparent hover:border-gray-200/50 hover:shadow-sm backdrop-blur-sm"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">
            {session.user.name}
          </div>
          <div className="text-xs text-gray-600">
            {session.user.email}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-2 z-50">
          <div className="px-5 py-3 border-b border-gray-100/50">
            <div className="flex items-center space-x-3">
              {/* <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div> */}
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-600">
                  {session.user.email}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-5 py-3 text-left hover:bg-gray-50/50 flex items-center space-x-3 text-sm text-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full px-5 py-3 text-left hover:bg-red-50/50 flex items-center space-x-3 text-sm text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
