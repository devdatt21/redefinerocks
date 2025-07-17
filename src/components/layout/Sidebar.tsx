'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Group } from '@/types';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';
import { EditGroupModal } from './EditGroupModal';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';

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
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);

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

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    try {
      const response = await fetch(`/api/groups?id=${deletingGroup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // If the deleted group was selected, clear selection
        if (selectedGroupId === deletingGroup.id) {
          onGroupSelect(undefined);
        }
        fetchGroups();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete group');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
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
              <div
                key={group.id}
                className={cn(
                  'rounded-xl transition-all duration-200 border',
                  selectedGroupId === group.id
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200/50'
                    : 'border-transparent hover:bg-gray-100/50'
                )}
              >
                <button
                  onClick={() => onGroupSelect(group.id)}
                  className="w-full text-left px-4 py-3"
                >
                  <div>
                    <div className={cn(
                      "font-semibold",
                      selectedGroupId === group.id ? "text-blue-700" : "text-gray-900"
                    )}>
                      {group.name}
                    </div>
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
                
                <div className="px-4 pb-3 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title="Edit group"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingGroup(group);
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Delete group"
                  >
                    Delete
                  </button>
                </div>
              </div>
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

      {/* Render modals using portals to ensure they appear at the root level */}
      {typeof window !== 'undefined' && editingGroup && createPortal(
        <EditGroupModal
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup}
          onUpdate={fetchGroups}
        />,
        document.body
      )}

      {typeof window !== 'undefined' && deletingGroup && createPortal(
        <DeleteConfirmModal
          isOpen={!!deletingGroup}
          onClose={() => setDeletingGroup(null)}
          onConfirm={handleDeleteGroup}
          title="Delete Group"
          message="Are you sure you want to delete this group?"
          itemName={deletingGroup.name}
        />,
        document.body
      )}
    </div>
  );
};
