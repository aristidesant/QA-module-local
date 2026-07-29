import React from 'react';
import { Chip, Group } from '@mantine/core';
import type { DemoHealth } from '../../mockData';
import { DEMO_HEALTH_COLORS, DEMO_HEALTH_LABELS } from '../../demoBadgeColors';

export type EvaluationHealthFilter = DemoHealth | 'all';

const HEALTH_ORDER: DemoHealth[] = ['healthy', 'atRisk', 'critical'];

const CHIP_COLORS: Record<EvaluationHealthFilter, string> = {
	all: 'gray',
	...DEMO_HEALTH_COLORS,
};

interface EvaluationFilterChipsProps {
	value: EvaluationHealthFilter;
	onChange: (value: EvaluationHealthFilter) => void;
}

const EvaluationFilterChips: React.FC<EvaluationFilterChipsProps> = ({
	value,
	onChange,
}) => {
	return (
		<Chip.Group
			multiple={false}
			value={value}
			onChange={(next) => onChange((next as EvaluationHealthFilter) || 'all')}
		>
			<Group gap='xs'>
				<Chip value='all' color={CHIP_COLORS.all} variant='light' size='sm'>
					All
				</Chip>
				{HEALTH_ORDER.map((health) => (
					<Chip
						key={health}
						value={health}
						color={CHIP_COLORS[health]}
						variant='light'
						size='sm'
					>
						{DEMO_HEALTH_LABELS[health]}
					</Chip>
				))}
			</Group>
		</Chip.Group>
	);
};

export default EvaluationFilterChips;
