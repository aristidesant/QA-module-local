export interface LeaderboardMetadata {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  scoreType: string; // e.g., "Sentiment & Emotion"
  winnerId: string | null; // agentId of winner
  createdBy: string; // supervisor id
  status: 'active' | 'completed'; // auto-set based on endDate
}

export enum UserReactionType {
  THUMBS_UP = '👍',
  CLAPPING_HANDS = '👏',
  HEART = '❤️',
  FIRE = '🔥',
}

export interface UserReactionMap {
  [agentId: string]: UserReactionType | null;
}

export interface LeaderboardState {
  metadata: LeaderboardMetadata;
  userReactions: UserReactionMap;
}
