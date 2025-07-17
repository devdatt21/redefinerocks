'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Question } from '@/types';
import { Button } from '../ui/Button';
import { Heart, MessageCircle, User as UserIcon, Share2, Check, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { EditQuestionModal } from './EditQuestionModal';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';

interface QuestionCardProps {
  question: Question;
  currentUserId?: string;
  onAnswerClick?: (question: Question) => void;
  onQuestionClick?: (question: Question) => void;
  onQuestionChange?: () => void;
  searchQuery?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentUserId,
  onAnswerClick,
  onQuestionClick,
  onQuestionChange,
  searchQuery,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = currentUserId === question.createdBy;

  // Helper function to highlight search matches
  const highlightSearchMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 font-medium px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  // Check if user name matches search query
  const isUserMatch = searchQuery && question.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering question click
    const questionUrl = `${window.location.origin}/question/${question.id}`;
    
    try {
      await navigator.clipboard.writeText(questionUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = questionUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      const response = await fetch(`/api/questions?id=${question.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onQuestionChange?.();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-200 backdrop-blur-sm overflow-hidden">
      {/* Clickable area for question details */}
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50/30 transition-all duration-200"
        onClick={() => onQuestionClick?.(question)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-white" />
              </div>
              <span className={cn(
                "font-medium text-gray-700",
                isUserMatch && "bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full border border-yellow-300"
              )}>
                {searchQuery ? highlightSearchMatch(question.user?.name || '', searchQuery) : question.user?.name}
              </span>
              {isUserMatch && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                  👤 User Match
                </span>
              )}
              <span>•</span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200/50">
                📁 {question.group?.name}
              </span>
            </div>

            <p className="text-gray-900 text-lg mb-4 leading-relaxed font-medium whitespace-pre-wrap">
              {searchQuery ? highlightSearchMatch(question.text, searchQuery) : question.text}
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-gray-600">
                <Heart className="w-4 h-4" />
                <span className="font-medium">{question._count?.likes || 0} likes</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{question._count?.answers || 0} answers</span>
              </div>
              <div className="text-blue-600 font-medium">
                <span>Click to view details →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons bar */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="font-medium">Share</span>
              </>
            )}
          </button>

          {/* Owner actions */}
          {isOwner && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
              >
                <Edit className="w-4 h-4" />
                <span className="font-medium">Edit</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete</span>
              </button>
            </>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAnswerClick?.(question);
          }}
        >
          💬 Answer
        </Button>
      </div>

      {/* Render modals using portals to ensure they appear at the root level */}
      {typeof window !== 'undefined' && showEditModal && createPortal(
        <EditQuestionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          question={question}
          onUpdate={onQuestionChange || (() => {})}
        />,
        document.body
      )}

      {typeof window !== 'undefined' && showDeleteModal && createPortal(
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteQuestion}
          title="Delete Question"
          message="Are you sure you want to delete this question?"
          itemName={question.text.length > 50 ? question.text.substring(0, 50) + '...' : question.text}
        />,
        document.body
      )}
    </div>
  );
};
