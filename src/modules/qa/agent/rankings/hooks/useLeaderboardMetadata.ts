import { useMemo } from 'react';
import { currentLeaderboard } from '~/modules/qa/dashboard/mockData';
import type { LeaderboardMetadata } from '../types/leaderboard';

interface UseLeaderboardMetadataResult {
  metadata: LeaderboardMetadata;
  isCompleted: boolean;
  daysRemaining: number;
  isWinnerSelected: boolean;
}

export const useLeaderboardMetadata = (): UseLeaderboardMetadataResult => {
  return useMemo(() => {
    const now = new Date();
    const endDate = new Date(currentLeaderboard.endDate);
    const startDate = new Date(currentLeaderboard.startDate);

    const isCompleted = now >= endDate;
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isWinnerSelected = currentLeaderboard.winnerId !== null;

    return {
      metadata: currentLeaderboard,
      isCompleted,
      daysRemaining: Math.max(0, daysRemaining),
      isWinnerSelected,
    };
  }, []);
};

export default useLeaderboardMetadata;
