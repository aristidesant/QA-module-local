import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Group,
	Stack,
	Switch,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconBuildingStore } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import type { CampaignTypeEntry } from '../types';

interface CampaignTypeDrawerProps {
	opened: boolean;
	onClose: () => void;
	/** Editing an existing entry; omitted when creating. */
	entry?: CampaignTypeEntry;
	existingCodes: string[];
	onSave: (entry: CampaignTypeEntry) => void;
}

const EMPTY: CampaignTypeEntry = {
	code: '',
	name: '',
	description: null,
	status: 'ACTIVE',
	updatedAt: '',
};

const normaliseCode = (value: string) =>
	value
		.toUpperCase()
		.replace(/[^A-Z0-9_]/g, '_')
		.replace(/_+/g, '_');

/** Create or edit one campaign type; the code is fixed once the entry exists. */
export const CampaignTypeDrawer: React.FC<CampaignTypeDrawerProps> = ({
	opened,
	onClose,
	entry,
	existingCodes,
	onSave,
}) => {
	const { t } = useTranslation('qa.globalConfig');
	const [draft, setDraft] = useState<CampaignTypeEntry>(entry ?? EMPTY);

	useEffect(() => {
		if (opened) setDraft(entry ?? EMPTY);
	}, [opened, entry]);

	const isEdit = Boolean(entry);
	const duplicate = !isEdit && existingCodes.includes(draft.code);
	const invalid =
		draft.code.trim() === '' || draft.name.trim() === '' || duplicate;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='md'
			icon={<IconBuildingStore size={20} />}
			title={t(
				isEdit
					? 'campaignTypes.drawer.editTitle'
					: 'campaignTypes.drawer.createTitle'
			)}
			description={t('campaignTypes.drawer.description')}
		>
			<Stack gap='md'>
				<TextInput
					label={t('campaignTypes.drawer.code')}
					description={t('campaignTypes.drawer.codeHelp')}
					value={draft.code}
					onChange={(event) =>
						setDraft({
							...draft,
							code: normaliseCode(event.currentTarget.value),
						})
					}
					disabled={isEdit}
					error={duplicate ? t('campaignTypes.drawer.duplicate') : undefined}
					required
				/>
				<TextInput
					label={t('campaignTypes.drawer.name')}
					value={draft.name}
					onChange={(event) =>
						setDraft({ ...draft, name: event.currentTarget.value })
					}
					required
				/>
				<Textarea
					label={t('campaignTypes.drawer.descriptionField')}
					value={draft.description ?? ''}
					onChange={(event) =>
						setDraft({
							...draft,
							description: event.currentTarget.value || null,
						})
					}
					autosize
					minRows={2}
				/>
				<Switch
					color='gray'
					label={t('common.active')}
					checked={draft.status === 'ACTIVE'}
					onChange={(event) =>
						setDraft({
							...draft,
							status: event.currentTarget.checked ? 'ACTIVE' : 'INACTIVE',
						})
					}
				/>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('common.cancel')}
					</Button>
					<Button
						disabled={invalid}
						onClick={() => {
							onSave(draft);
							onClose();
						}}
					>
						{t('common.save')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default CampaignTypeDrawer;
