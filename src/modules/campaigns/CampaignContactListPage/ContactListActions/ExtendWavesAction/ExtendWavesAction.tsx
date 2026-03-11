import { ActionIcon, Tooltip } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';
import classes from '../ContactListActions.module.css';

interface ExtendWavesActionProps {
	tooltip: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
}

const ExtendWavesAction = ({
	tooltip,
	onClick,
	loading = false,
	disabled = false,
}: ExtendWavesActionProps) => (
	<Tooltip label={tooltip} withArrow>
		<span>
			<ActionIcon
				size='lg'
				variant='light'
				color='blue'
				onClick={onClick}
				loading={loading}
				disabled={disabled}
				aria-label={tooltip}
				className={classes.actionButton}
			>
				<IconRepeat size={16} />
			</ActionIcon>
		</span>
	</Tooltip>
);

export default ExtendWavesAction;
