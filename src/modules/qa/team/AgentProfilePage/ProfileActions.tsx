import { Button, Group, Menu } from '@mantine/core';
import {
	IconBook,
	IconCalendarEvent,
	IconChevronDown,
	IconSend,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export interface ProfileActionsProps {
	size?: 'xs' | 'sm';
	onScheduleCoaching: () => void;
	onAssignLms: () => void;
	onSendMessage: () => void;
}

/** One primary action; the other two live in a quiet menu. */
export function ProfileActions({
	size = 'sm',
	onScheduleCoaching,
	onAssignLms,
	onSendMessage,
}: ProfileActionsProps) {
	const { t } = useTranslation('qa.team');
	return (
		<Group gap='xs' wrap='nowrap'>
			<Button
				size={size}
				leftSection={<IconCalendarEvent size={16} />}
				onClick={onScheduleCoaching}
			>
				{t('header.actions.scheduleCoaching')}
			</Button>
			<Menu position='bottom-end' withinPortal>
				<Menu.Target>
					<Button
						size={size}
						variant='default'
						rightSection={<IconChevronDown size={14} />}
					>
						{t('header.more')}
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Item leftSection={<IconBook size={14} />} onClick={onAssignLms}>
						{t('header.actions.assignLms')}
					</Menu.Item>
					<Menu.Item
						leftSection={<IconSend size={14} />}
						onClick={onSendMessage}
					>
						{t('header.actions.sendMessage')}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
}
