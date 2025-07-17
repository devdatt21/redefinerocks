'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { QuestionList } from '@/components/questions/QuestionList';
import { CreateGroupModal } from '@/components/layout/CreateGroupModal';
import { CreateQuestionModal } from '@/components/layout/CreateQuestionModal';
import { SimpleAnswerModal } from '@/components/questions/SimpleAnswerModal';
import { QuestionDetailModal } from '@/components/questions/QuestionDetailModal';
import { Question } from '@/types';

export const MainApp: React.FC = () => {
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex">
      <Sidebar
        selectedGroupId={selectedGroupId}
        onGroupSelect={handleGroupSelect}
        onCreateGroupClick={() => setShowCreateGroupModal(true)}
        refreshTrigger={refreshGroups}
      />
      
      <div className="flex-1 flex flex-col">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedGroupId={selectedGroupId}
          onCreateQuestionClick={() => setShowCreateQuestionModal(true)}
        />
        
        <QuestionList
          searchQuery={searchQuery}
          sortBy={sortBy}
          selectedGroupId={selectedGroupId}
          refreshTrigger={refreshQuestions}
          onAnswerClick={handleAnswerClick}
          onQuestionClick={handleQuestionClick}
        />
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
