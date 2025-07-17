'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Question, Answer } from '@/types';
import { Heart, MessageCircle, User as UserIcon, Clock, Share2, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuestionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  onAnswerClick?: () => void;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  isOpen,
  onClose,
  question,
  onAnswerClick,
}) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(question._count?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchQuestionDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${question.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data.answers || []);
        setLikeCount(data._count?.likes || 0);
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
    } finally {
      setLoading(false);
    }
  }, [question.id]);

  useEffect(() => {
    if (isOpen) {
      fetchQuestionDetails();
    }
  }, [isOpen, question.id, fetchQuestionDetails]);

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'QUESTION',
          refId: question.id,
        }),
      });

      if (response.ok) {
        const { liked } = await response.json();
        setIsLiked(liked);
        setLikeCount((prev: number) => liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error liking question:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleAnswerLike = async (answerId: string) => {
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ANSWER',
          refId: answerId,
        }),
      });

      if (response.ok) {
        const { liked } = await response.json();
        setAnswers((prev: Answer[]) => prev.map((answer: Answer) => 
          answer.id === answerId 
            ? { 
                ...answer, 
                _count: { 
                  ...answer._count, 
                  likes: liked 
                    ? (answer._count?.likes || 0) + 1 
                    : Math.max((answer._count?.likes || 0) - 1, 0)
                } 
              }
            : answer
        ));
      }
    } catch (error) {
      console.error('Error liking answer:', error);
    }
  };

  const handleShare = async () => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📖 Question Details" size="full">
      <div className="space-y-6">
        {/* Question Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-xl border border-blue-100 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4 text-sm text-blue-700">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-900">{question.user?.name}</div>
                <div className="flex items-center space-x-3 text-blue-600 mt-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{new Date(question.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50">
                    📁 {question.group?.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-200"
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

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onAnswerClick?.();
                }}
                className="shrink-0 px-6 py-3 text-base font-semibold"
              >
                💬 Answer This Question
              </Button>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-relaxed whitespace-pre-wrap">{question.text}</h2>

          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={liking}
              className={cn(
                'flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 font-medium text-base',
                isLiked
                  ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 border border-red-200/50 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50 hover:shadow-sm border border-transparent'
              )}
            >
              <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
              <span>{likeCount} likes</span>
            </button>

            <div className="flex items-center space-x-3 text-gray-600 px-4 py-3 bg-white/30 rounded-xl">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-base">{answers.length} answers</span>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
              Answers ({answers.length}) 💭
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-4 text-gray-600">
                <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Loading answers...</span>
              </div>
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-200">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h4 className="text-xl font-medium text-gray-600 mb-3">No answers yet</h4>
              <p className="text-gray-500 mb-6 text-lg">Be the first to share your knowledge!</p>
              <Button
                variant="primary"
                onClick={() => {
                  onAnswerClick?.();
                }}
                className="mx-auto px-8 py-3 text-lg font-semibold"
              >
                💬 Write First Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div key={answer.id} className="bg-gradient-to-r from-white to-gray-50/50 p-6 sm:p-8 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 text-base">{answer.user?.name}</span>
                        <div className="flex items-center space-x-3 text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                          {index === 0 && (
                            <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-medium border border-green-200/50">
                              ✨ First Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAnswerLike(answer.id)}
                      className="flex items-center space-x-2 text-pink-600 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full transition-all duration-200 border border-pink-200/50 font-medium"
                    >
                      <Heart className="w-5 h-5" />
                      <span>{answer._count?.likes || 0}</span>
                    </button>
                  </div>

                  <p className="text-gray-900 leading-relaxed mb-4 text-base sm:text-lg whitespace-pre-wrap">{answer.text}</p>

                  {answer.audioUrl && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3 text-blue-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.795l-4-3.2A1 1 0 014 13V7a1 1 0 01.383-.924l4-3.2zM16 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Audio Answer</span>
                      </div>
                      <audio controls className="w-full h-10">
                        <source src={answer.audioUrl} type="audio/mpeg" />
                        <source src={answer.audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
