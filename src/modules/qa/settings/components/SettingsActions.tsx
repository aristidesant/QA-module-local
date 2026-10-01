import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group } from '@mantine/core';

interface SettingsActionsProps {
	dirty: boolean;
	/** Blocks Save while the form has validation errors. */
	invalid?: boolean;
	onSave: () => void;
	onDiscard: () => void;
	onReset: () => void;
}

/** Footer shared by every Settings tab. Reset only fills the form; nothing changes until Save. */
export const SettingsActions: React.FC<SettingsActionsProps> = ({
	dirty,
	invalid = false,
	onSave,
	onDiscard,
	onReset,
}) => {
	const { t } = useTranslation('qa.settings');

	return (
		<Group justify='flex-end' gap='sm'>
			<Button variant='subtle' onClick={onReset}>
				{t('actions.reset')}
			</Button>
			<Button variant='default' disabled={!dirty} onClick={onDiscard}>
				{t('actions.discard')}
			</Button>
			<Button disabled={!dirty || invalid} onClick={onSave}>
				{t('actions.save')}
			</Button>
		</Group>
	);
};

export default SettingsActions;
