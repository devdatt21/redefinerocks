'use client';

import { useState, useEffect } from 'react';

interface UseLikeProps {
  type: 'QUESTION' | 'ANSWER';
  refId: string;
  initialCount?: number;
  currentUserId?: string;
}

export const useLike = ({ type, refId, initialCount = 0, currentUserId }: UseLikeProps) => {
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already liked this item
    const checkLikeStatus = async () => {
      if (!currentUserId) return;
      
      try {
        const response = await fetch(`/api/likes/check?type=${type}&refId=${refId}`);
        if (response.ok) {
          const { liked } = await response.json();
          setIsLiked(liked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [type, refId, currentUserId]);

  const toggleLike = async () => {
    if (loading || !currentUserId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, refId }),
      });

      if (response.ok) {
        const { liked } = await response.json();
        setIsLiked(liked);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    likeCount,
    isLiked,
    loading,
    toggleLike,
  };
};
