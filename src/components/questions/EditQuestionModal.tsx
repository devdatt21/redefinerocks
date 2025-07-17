'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Question } from '@/types';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onUpdate: () => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  onUpdate,
}) => {
  const [text, setText] = useState(question.text);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      alert('Question text is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: question.id,
          text: text.trim(),
        }),
      });

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText(question.text);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Question" size="full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <textarea
            id="questionText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="text-gray-900 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Enter your question here..."
            required
          />
          <p className="text-sm text-gray-600 mt-2">
            💡 Be clear and specific to get better answers from the community
          </p>
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
            disabled={loading || !text.trim()}
          >
            {loading ? 'Updating...' : 'Update Question'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
