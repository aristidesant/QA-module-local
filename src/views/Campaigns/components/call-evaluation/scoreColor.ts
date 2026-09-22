export { getScoreBandColor as getScoreColor } from '~/modules/qa/constants/badgeColors';

export const formatDuration = (seconds: number): string => {
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
};
