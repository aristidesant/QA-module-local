import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Stack, Select, Group, Button } from '@mantine/core';
import { CampaignPredefinedParam } from '../../../campaigns/CampaignsForm/useCampaignsPredefinedParams';
import { useTranslation } from 'react-i18next';

interface CampaignPredefinedParamsModalProps {
	opened: boolean;
	onClose: () => void;
	predefinedParams: CampaignPredefinedParam[];
	initialSelectionName: string | null;
	onApply: (param: CampaignPredefinedParam) => void;
}

const CampaignPredefinedParamsModal: React.FC<
	CampaignPredefinedParamsModalProps
> = ({ opened, onClose, predefinedParams, initialSelectionName, onApply }) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const [selectionName, setSelectionName] = useState<string | null>(
		initialSelectionName
	);

	useEffect(() => {
		if (opened) {
			setSelectionName(initialSelectionName);
		}
	}, [opened, initialSelectionName]);

	const selectedParam = useMemo(() => {
		if (!selectionName) {
			return null;
		}

		return (
			predefinedParams.find((param) => param.name === selectionName) ?? null
		);
	}, [selectionName, predefinedParams]);

	const previewConfig = useMemo(() => {
		return (
			selectedParam?.params?.conversationConfig ??
			selectedParam?.params?.platformSettings ??
			null
		);
	}, [selectedParam]);

	const handleApply = () => {
		if (
			selectedParam?.params?.conversationConfig ||
			selectedParam?.params?.platformSettings
		) {
			onApply(selectedParam);
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.agent.behavior.modal.title')}
			centered
			size='xs'
		>
			<Stack gap='md'>
				<Select
					label={t('form.agent.behavior.modal.label')}
					placeholder={t('form.agent.behavior.modal.placeholder')}
					data={predefinedParams.map((param) => ({
						value: param.name,
						label:
							param.behaviorType === 'BACKUP' || param.isBackup
								? `${param.name} (${t('form.agent.behavior.modal.backupSuffix')})`
								: param.name,
					}))}
					value={selectionName}
					onChange={setSelectionName}
					searchable
					clearable
				/>

				<Group justify='flex-end' gap='sm'>
					<Button variant='default' onClick={onClose}>
						{t('form.agent.behavior.modal.actions.cancel')}
					</Button>
					<Button onClick={handleApply} disabled={!previewConfig}>
						{t('form.agent.behavior.modal.actions.apply')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default CampaignPredefinedParamsModal;
