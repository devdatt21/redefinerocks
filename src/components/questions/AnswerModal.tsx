'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Question, Answer, CreateAnswerData } from '@/types';
import { Mic, MicOff, User, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

export const AnswerModal: React.FC<AnswerModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);

  const fetchAnswers = useCallback(async () => {
    try {
      const response = await fetch(`/api/questions/${question.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  }, [question.id]);

  useEffect(() => {
    if (isOpen) {
      fetchAnswers();
      
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition || (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTextAnswer(prev => prev + ' ' + finalTranscript);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [isOpen, fetchAnswers]);

  const toggleRecording = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim()) return;

    setLoading(true);
    setError('');

    try {
      const answerData: CreateAnswerData = {
        text: textAnswer.trim(),
        questionId: question.id,
      };

      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answer');
      }

      setTextAnswer('');
      fetchAnswers(); // Refresh answers
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTextAnswer('');
    setError('');
    if (isRecording && recognition) {
      recognition.stop();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="💬 Answer Question" size="lg">
      <div className="space-y-6">
        {/* Question Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm backdrop-blur-sm">
          <h3 className="font-semibold text-gray-900 mb-3 text-lg">{question.text}</h3>
          <div className="text-sm text-blue-700 flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Asked by <span className="font-medium">{question.user?.name}</span> in <span className="font-medium">{question.group?.name}</span></span>
          </div>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Answer ✨
            </label>
            <div className="relative">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Share your knowledge and help others... 🧠💡"
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 resize-none text-gray-900"
                rows={4}
              />
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  'absolute right-3 top-3 p-2 rounded-xl transition-all duration-200 transform hover:scale-105',
                  isRecording
                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-600 shadow-lg'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-blue-100 hover:to-blue-200 hover:text-blue-600'
                )}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
            {isRecording && (
              <p className="text-sm text-red-600 mt-2 animate-pulse flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                Recording... Speak now 🎤
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !textAnswer.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                '🚀 Submit Answer'
              )}
            </Button>
          </div>
        </form>

        {/* Existing Answers */}
        {answers.length > 0 && (
          <div className="border-t border-gray-200/50 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Answers ({answers.length}) 💭
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {answers.map((answer) => (
                <div key={answer.id} className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">{answer.user?.name}</span>
                      <span>•</span>
                      <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">{answer._count?.likes || 0}</span>
                    </div>
                  </div>
                  <p className="text-gray-900 leading-relaxed">{answer.text}</p>
                  {answer.audioUrl && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg border border-gray-200">
                      <audio controls className="w-full">
                        <source src={answer.audioUrl} type="audio/mpeg" />
                        <source src={answer.audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
