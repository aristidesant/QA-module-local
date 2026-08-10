import { Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface ConnectionTestButtonProps {
	loading: boolean;
	tested: boolean;
	onClick: () => void;
}

export default function ConnectionTestButton({
	loading,
	tested,
	onClick,
}: ConnectionTestButtonProps) {
	return (
		<Button
			onClick={onClick}
			loading={loading}
			fullWidth
			variant={tested ? 'light' : 'outline'}
			color={tested ? 'green' : 'blue'}
			leftSection={tested ? <IconCheck size={16} /> : undefined}
		>
			{tested ? 'Connected ✓' : 'Test Connection'}
		</Button>
	);
}
