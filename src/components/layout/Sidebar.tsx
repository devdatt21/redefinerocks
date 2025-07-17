'use client';

import React, { useState, useEffect } from 'react';
import { Group } from '@/types';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';

interface SidebarProps {
  selectedGroupId?: string;
  onGroupSelect: (groupId?: string) => void;
  onCreateGroupClick: () => void;
  refreshTrigger?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedGroupId,
  onGroupSelect,
  onCreateGroupClick,
  refreshTrigger,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, [refreshTrigger]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/50 h-screen flex flex-col backdrop-blur-sm shadow-lg">
      <div className="p-6 border-b border-gray-200/50">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Redefine Rocks
          </h2>
          <p className="text-xs text-gray-600 mt-1">Q&A Platform</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={onCreateGroupClick}
        >
          New Group
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <button
            onClick={() => onGroupSelect(undefined)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium',
              !selectedGroupId
                ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm border border-blue-200/50'
                : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
            )}
          >
            📝 All Questions
          </button>
        </div>

        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading groups...</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onGroupSelect(group.id)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl transition-all duration-200',
                  selectedGroupId === group.id
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-sm border border-blue-200/50'
                    : 'text-gray-700 hover:bg-gray-100/50 hover:shadow-sm'
                )}
              >
                <div>
                  <div className="font-semibold text-gray-900">{group.name}</div>
                  {group.description && (
                    <div className="text-sm text-gray-600 truncate mt-1">
                      {group.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    {group._count?.questions || 0} questions
                  </div>
                </div>
              </button>
            ))}
            {groups.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-gray-600 text-sm">No groups yet</p>
                <p className="text-gray-500 text-xs">Create your first group to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
