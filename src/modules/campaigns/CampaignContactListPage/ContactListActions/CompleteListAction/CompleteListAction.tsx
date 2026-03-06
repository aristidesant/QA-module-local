import { ActionIcon, Tooltip } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import classes from '../ContactListActions.module.css';

interface CompleteListActionProps {
	tooltip: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
}

const CompleteListAction = ({
	tooltip,
	onClick,
	loading = false,
	disabled = false,
}: CompleteListActionProps) => (
	<Tooltip label={tooltip} withArrow>
		<span>
			<ActionIcon
				size='lg'
				variant='light'
				color='green'
				onClick={onClick}
				loading={loading}
				disabled={disabled}
				aria-label={tooltip}
				className={classes.actionButton}
			>
				<IconCircleCheck size={16} />
			</ActionIcon>
		</span>
	</Tooltip>
);

export default CompleteListAction;
