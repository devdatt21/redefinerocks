'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Group } from '@/types';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onUpdate: () => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  onClose,
  group,
  onUpdate,
}) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Group name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: group.id,
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (response.ok) {
        onUpdate();
        onClose();
        setName('');
        setDescription('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update group');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(group.name);
    setDescription(group.description || '');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Group" size="full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
            Group Name *
          </label>
          <input
            id="groupName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter group name..."
            required
          />
        </div>

        <div>
          <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="groupDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Enter group description..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={loading || !name.trim()}
          >
            {loading ? 'Updating...' : 'Update Group'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
