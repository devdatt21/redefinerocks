'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Group, CreateQuestionData } from '@/types';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupId?: string;
  onQuestionCreated?: () => void;
}

export const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
  isOpen,
  onClose,
  selectedGroupId,
  onQuestionCreated,
}) => {
  const [formData, setFormData] = useState<CreateQuestionData>({
    text: '',
    groupId: selectedGroupId || '',
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      if (selectedGroupId) {
        setFormData(prev => ({ ...prev, groupId: selectedGroupId }));
      }
    }
  }, [isOpen, selectedGroupId]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question');
      }

      setFormData({ text: '', groupId: selectedGroupId || '' });
      onClose();
      // Trigger refresh instead of reloading the page
      if (onQuestionCreated) {
        onQuestionCreated();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ text: '', groupId: selectedGroupId || '' });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="💭 Ask a Question" size="full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            placeholder="What would you like to ask? 🤔"
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 resize-none text-gray-900"
            rows={12}
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Take your time to write a detailed question. The more specific you are, the better answers you&apos;ll get!
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Group *
          </label>
          <select
            value={formData.groupId}
            onChange={(e) => setFormData(prev => ({ ...prev, groupId: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-gray-900"
            required
          >
            <option value="">Select a group 📁</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.text.trim() || !formData.groupId}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </div>
            ) : (
              '📝 Post Question'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
