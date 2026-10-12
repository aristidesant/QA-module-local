import { Button, Group } from '@mantine/core';
import { IconBan, IconNote } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export interface CustomerActionsProps {
	size?: 'xs' | 'sm';
	doNotCall: boolean;
	onAddNote: () => void;
	onToggleDnc: () => void;
}

/** Add note is the everyday action; the Do-Not-Call flag stays quiet beside it. */
export function CustomerActions({
	size = 'sm',
	doNotCall,
	onAddNote,
	onToggleDnc,
}: CustomerActionsProps) {
	const { t } = useTranslation('qa.customers');
	return (
		<Group gap='xs' wrap='nowrap'>
			<Button
				size={size}
				leftSection={<IconNote size={16} />}
				onClick={onAddNote}
			>
				{t('header.actions.addNote')}
			</Button>
			<Button
				size={size}
				variant='default'
				leftSection={<IconBan size={16} />}
				onClick={onToggleDnc}
			>
				{t(doNotCall ? 'header.actions.unflagDnc' : 'header.actions.flagDnc')}
			</Button>
		</Group>
	);
}
