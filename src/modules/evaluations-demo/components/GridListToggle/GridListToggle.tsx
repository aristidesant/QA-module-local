import React from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconLayoutGrid, IconLayoutList } from '@tabler/icons-react';

export type DemoViewMode = 'grid' | 'list';

interface GridListToggleProps {
	value: DemoViewMode;
	onChange: (value: DemoViewMode) => void;
}

const GridListToggle: React.FC<GridListToggleProps> = ({ value, onChange }) => {
	return (
		<ActionIcon.Group>
			<Tooltip label='Grid view' withArrow>
				<ActionIcon
					variant={value === 'grid' ? 'filled' : 'default'}
					color='green'
					size='lg'
					aria-label='Grid view'
					onClick={() => onChange('grid')}
				>
					<IconLayoutGrid size={18} />
				</ActionIcon>
			</Tooltip>
			<Tooltip label='List view' withArrow>
				<ActionIcon
					variant={value === 'list' ? 'filled' : 'default'}
					color='green'
					size='lg'
					aria-label='List view'
					onClick={() => onChange('list')}
				>
					<IconLayoutList size={18} />
				</ActionIcon>
			</Tooltip>
		</ActionIcon.Group>
	);
};

export default GridListToggle;
