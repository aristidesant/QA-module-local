import { ActionIcon, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import classes from '../ContactListActions.module.css';

interface ReloadActionProps {
	tooltip: string;
	onClick: () => void;
	disabled?: boolean;
}

const ReloadAction = ({
	tooltip,
	onClick,
	disabled = false,
}: ReloadActionProps) => (
	<Tooltip label={tooltip} withArrow>
		<span>
			<ActionIcon
				size='lg'
				variant='light'
				color='gray'
				onClick={onClick}
				disabled={disabled}
				aria-label={tooltip}
				className={classes.actionButton}
			>
				<IconRefresh size={16} />
			</ActionIcon>
		</span>
	</Tooltip>
);

export default ReloadAction;
