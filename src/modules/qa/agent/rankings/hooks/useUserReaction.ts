import { useState, useCallback } from 'react';
import { userReactions } from '~/modules/qa/dashboard/mockData';
import type { UserReactionType } from '../types/leaderboard';

interface UseUserReactionResult {
  currentReaction: UserReactionType | null;
  setReaction: (reaction: UserReactionType | null) => void;
}

export const useUserReaction = (agentId: string): UseUserReactionResult => {
  const [currentReaction, setCurrentReaction] = useState<UserReactionType | null>(
    userReactions[agentId] || null
  );

  const setReaction = useCallback((reaction: UserReactionType | null) => {
    // In real app, this would call an API
    setCurrentReaction(reaction);
    // Update mock data
    userReactions[agentId] = reaction;
  }, [agentId]);

  return { currentReaction, setReaction };
};

export default useUserReaction;
