import { Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

/** Toast with an Undo button, for reversible actions such as archiving a message. */
export const notifyWithUndo = (
	message: string,
	undoLabel: string,
	onUndo: () => void
) => {
	const id = `inbox-undo-${Date.now()}`;
	notifications.show({
		id,
		autoClose: 6000,
		message: (
			<Group justify='space-between' wrap='nowrap' gap='sm'>
				<Text size='sm'>{message}</Text>
				<Button
					variant='subtle'
					size='compact-xs'
					onClick={() => {
						onUndo();
						notifications.hide(id);
					}}
				>
					{undoLabel}
				</Button>
			</Group>
		),
	});
};
