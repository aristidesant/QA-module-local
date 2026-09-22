import type { TablerIcon } from '@tabler/icons-react';
import {
	IconConfetti,
	IconFlame,
	IconHeart,
	IconThumbUp,
} from '@tabler/icons-react';
import { UserReactionType } from './types/leaderboard';

/**
 * Tabler icon for each reaction — the single rendering used by the table
 * chips, the drawer's give-a-reaction control and the drawer's breakdown.
 * The enum's own emoji values stay as-is (they're the persisted keys in
 * `rankingsStore`); this map only decides what gets drawn on screen.
 */
export const REACTION_ICON: Record<UserReactionType, TablerIcon> = {
	[UserReactionType.THUMBS_UP]: IconThumbUp,
	[UserReactionType.CLAPPING_HANDS]: IconConfetti,
	[UserReactionType.HEART]: IconHeart,
	[UserReactionType.FIRE]: IconFlame,
};

export const REACTION_ORDER: UserReactionType[] = [
	UserReactionType.THUMBS_UP,
	UserReactionType.CLAPPING_HANDS,
	UserReactionType.HEART,
	UserReactionType.FIRE,
];
