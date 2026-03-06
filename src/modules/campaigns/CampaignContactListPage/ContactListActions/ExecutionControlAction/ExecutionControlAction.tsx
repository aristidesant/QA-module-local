import { ActionIcon, Tooltip } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import classes from '../ContactListActions.module.css';

interface ExecutionControlActionProps {
	tooltip: string;
	icon: TablerIcon;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
	color?: string;
}

const ExecutionControlAction = ({
	tooltip,
	icon: Icon,
	onClick,
	loading = false,
	disabled = false,
	color = 'blue',
}: ExecutionControlActionProps) => (
	<Tooltip label={tooltip} disabled={!tooltip} withArrow>
		<span>
			<ActionIcon
				size='lg'
				variant='light'
				color={color}
				onClick={onClick}
				loading={loading}
				disabled={disabled}
				aria-label={tooltip}
				className={classes.actionButton}
			>
				<Icon size={16} />
			</ActionIcon>
		</span>
	</Tooltip>
);

export default ExecutionControlAction;
