'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserMenu } from './UserMenu';
import { SearchIcon } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onCreateQuestionClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onCreateQuestionClick,
}) => {

  return (
    <div className="bg-gradient-to-r from-white to-gray-50/50 border-b border-gray-200/50 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search questions, answers, or users..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 text-gray-900 bg-white/70 border-gray-200 focus:bg-white focus:border-blue-300 transition-all duration-200"
            />
            {searchQuery && (
              <div className="absolute top-full left-0 mt-1 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200 shadow-sm">
                💡 Tip: Search by question text, answer content, or user names
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-gray-700 font-medium"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Liked</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="primary"
            onClick={onCreateQuestionClick}
          >
            Add Question
          </Button>
          
          <UserMenu />
        </div>
      </div>
    </div>
  );
};
