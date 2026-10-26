import { Group, Text, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RolePlayDifficulty } from '~/models/qa';
import { ROLE_PLAY_DIFFICULTY_META } from '../constants';
import classes from './DifficultyDots.module.css';

const LEVEL: Record<RolePlayDifficulty, number> = {
	EASY: 1,
	MEDIUM: 2,
	HARD: 3,
};

/** Difficulty as a three-step scale; the word is beside it and in the tooltip. */
export function DifficultyDots({
	difficulty,
}: {
	difficulty: RolePlayDifficulty;
}) {
	const { t } = useTranslation('qa.lms');
	const label = t(ROLE_PLAY_DIFFICULTY_META[difficulty].labelKey);
	return (
		<Tooltip label={label} withArrow>
			<Group gap={6} wrap='nowrap'>
				<span className={classes.dots} role='img' aria-label={label}>
					{[1, 2, 3].map((n) => (
						<span
							key={n}
							className={`${classes.dot} ${n <= LEVEL[difficulty] ? classes.on : ''}`}
						/>
					))}
				</span>
				<Text size='xs' c='dimmed'>
					{label}
				</Text>
			</Group>
		</Tooltip>
	);
}
