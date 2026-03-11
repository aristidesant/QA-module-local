import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';
import classes from '../ContactListActions.module.css';

interface ResumeWaitingNowActionProps {
	tooltip: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
}

const ResumeWaitingNowAction = ({
	tooltip,
	onClick,
	loading = false,
	disabled = false,
}: ResumeWaitingNowActionProps) => (
	<Tooltip label={tooltip} withArrow>
		<span>
			<ActionIcon
				size='lg'
				variant='light'
				color='orange'
				onClick={onClick}
				loading={loading}
				disabled={disabled}
				aria-label={tooltip}
				className={classes.actionButton}
			>
				<IconPlayerPlay size={16} />
			</ActionIcon>
		</span>
	</Tooltip>
);

export default ResumeWaitingNowAction;
