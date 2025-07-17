'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QuestionList } from '@/components/questions/QuestionList';
import { CreateGroupModal } from '@/components/layout/CreateGroupModal';
import { CreateQuestionModal } from '@/components/layout/CreateQuestionModal';
import { SimpleAnswerModal } from '@/components/questions/SimpleAnswerModal';
import { QuestionDetailModal } from '@/components/questions/QuestionDetailModal';
import { Question } from '@/types';

interface MainAppProps {
  initialQuestionId?: string;
}

export const MainApp: React.FC<MainAppProps> = ({ initialQuestionId }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showQuestionDetailModal, setShowQuestionDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [refreshGroups, setRefreshGroups] = useState(0);
  const [refreshQuestions, setRefreshQuestions] = useState(0);

  // Handle initial question ID from URL
  useEffect(() => {
    if (initialQuestionId) {
      // Fetch the question details and open the modal
      fetchQuestionById(initialQuestionId);
    }
  }, [initialQuestionId]);

  const fetchQuestionById = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`);
      if (response.ok) {
        const question = await response.json();
        setSelectedQuestion(question);
        setShowQuestionDetailModal(true);
      } else {
        console.error('Question not found');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleGroupSelect = (groupId?: string) => {
    setSelectedGroupId(groupId);
  };

  const handleGroupCreated = () => {
    setShowCreateGroupModal(false);
    setRefreshGroups(prev => prev + 1); // Trigger sidebar refresh
  };

  const handleQuestionCreated = () => {
    setShowCreateQuestionModal(false);
    setRefreshQuestions(prev => prev + 1); // Trigger question list refresh
  };

  const handleAnswerClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswerModal(true);
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowQuestionDetailModal(true);
  };

  const handleAnswerModalClose = (answerSubmitted = false) => {
    setShowAnswerModal(false);
    setSelectedQuestion(null);
    if (answerSubmitted) {
      setRefreshQuestions(prev => prev + 1); // Only refresh if answer was submitted
    }
  };

  const handleQuestionDetailModalClose = () => {
    setShowQuestionDetailModal(false);
    setSelectedQuestion(null);
    // No need to refresh questions when just viewing details
  };

  return (
    <div className="h-screen bg-white flex">
      <div className="w-64 fixed left-0 top-0 h-full z-10">
        <Sidebar
          selectedGroupId={selectedGroupId}
          onGroupSelect={handleGroupSelect}
          onCreateGroupClick={() => setShowCreateGroupModal(true)}
          refreshTrigger={refreshGroups}
        />
      </div>
      
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <div className="sticky top-0 z-20 bg-white">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onCreateQuestionClick={() => setShowCreateQuestionModal(true)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <QuestionList
            searchQuery={searchQuery}
            sortBy={sortBy}
            selectedGroupId={selectedGroupId}
            refreshTrigger={refreshQuestions}
            onAnswerClick={handleAnswerClick}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>

      {/* Full screen Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Full screen Create Question Modal */}
      <CreateQuestionModal
        isOpen={showCreateQuestionModal}
        onClose={() => setShowCreateQuestionModal(false)}
        selectedGroupId={selectedGroupId}
        onQuestionCreated={handleQuestionCreated}
      />

      {/* Full screen Answer Modal */}
      {selectedQuestion && (
        <SimpleAnswerModal
          isOpen={showAnswerModal}
          onClose={handleAnswerModalClose}
          question={selectedQuestion}
        />
      )}

      {/* Full screen Question Detail Modal */}
      {selectedQuestion && (
        <QuestionDetailModal
          isOpen={showQuestionDetailModal}
          onClose={handleQuestionDetailModalClose}
          question={selectedQuestion}
          onAnswerClick={() => {
            setShowQuestionDetailModal(false);
            setShowAnswerModal(true);
          }}
        />
      )}
    </div>
  );
};
