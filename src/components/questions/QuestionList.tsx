'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '@/types';
import { QuestionCard } from './QuestionCard';

interface QuestionListProps {
  searchQuery: string;
  sortBy: string;
  selectedGroupId?: string;
  refreshTrigger?: number;
  onAnswerClick?: (question: Question) => void;
  onQuestionClick?: (question: Question) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  searchQuery,
  sortBy,
  selectedGroupId,
  refreshTrigger,
  onAnswerClick,
  onQuestionClick,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      if (selectedGroupId) params.append('groupId', selectedGroupId);

      const response = await fetch(`/api/questions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, selectedGroupId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-blue-300 mx-auto opacity-20"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading questions...</p>
          <p className="text-gray-500 text-sm mt-1">Fetching the latest discussions</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">🤔</span>
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">No questions found</div>
          <div className="text-gray-600 max-w-md mx-auto">
            {searchQuery 
              ? "Try adjusting your search terms or exploring different groups" 
              : "Be the first to ask a question and start the conversation!"
            }
          </div>
          <div className="mt-4 text-sm text-gray-500">
            💡 Tip: Use the search bar or create a new question to get started
          </div>
        </div>
      </div>
    );
  }    return (
      <div className="flex-1 p-6">
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🔍 Search Results for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-blue-700 text-sm">
              Showing results from questions, answers, and user names • {questions.length} result{questions.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              onAnswerClick={onAnswerClick}
              onQuestionClick={onQuestionClick}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    );
};
