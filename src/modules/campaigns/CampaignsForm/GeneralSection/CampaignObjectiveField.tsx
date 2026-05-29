import { useMemo, useState, type ReactNode } from 'react';
import { ActionIcon, Modal, Select, Text, Tooltip, Stack } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconTarget } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CampaignObjectivesForm } from '~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesForm/CampaignObjectivesForm';
import {
	useGetCampaignObjectiveById,
	useGetCampaignObjectivesAll,
} from '~/queries/campaignObjectivesQueries';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import { toObjectiveSelectItem } from './GeneralSection.helpers';
import styles from './GeneralSection.module.css';

const CampaignObjectiveField = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();
	const queryClient = useQueryClient();
	const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
	const {
		data: objectives = [],
		isLoading: objectivesLoading,
		error: loadError,
	} = useGetCampaignObjectivesAll();

	const objectiveId = form.values.objectiveId;
	const { data: selectedObjective } = useGetCampaignObjectiveById(
		Number(objectiveId || 0),
		Boolean(objectiveId)
	);

	const objectiveSelectData = useMemo(() => {
		const objectivesById = new Map(
			objectives.map((objective) => [
				objective.id,
				toObjectiveSelectItem(objective),
			])
		);

		if (selectedObjective && !objectivesById.has(selectedObjective.id)) {
			objectivesById.set(
				selectedObjective.id,
				toObjectiveSelectItem(selectedObjective)
			);
		}

		const grouped = new Map<string, { value: string; label: string }[]>();
		Array.from(objectivesById.values()).forEach((objective) => {
			const groupName =
				objective.categoryName || t('general.uncategorizedObjectives');
			const groupItems = grouped.get(groupName) ?? [];
			groupItems.push({
				value: String(objective.id),
				label: objective.name || t('general.unnamedObjective'),
			});
			grouped.set(groupName, groupItems);
		});

		return Array.from(grouped.entries()).map(([group, items]) => ({
			group,
			items,
		}));
	}, [objectives, selectedObjective, t]);

	const objectiveError =
		(form.errors.objectiveId as ReactNode) ||
		(loadError ? t('general.failedToLoadObjectives') : undefined);

	const handleObjectiveChange = (value: string | null) => {
		form.setFieldValue('objectiveId', value ? Number(value) : undefined);
	};

	const handleObjectiveCreated = () => {
		setIsObjectiveModalOpen(false);
		void queryClient.invalidateQueries({
			queryKey: ['campaign-objectives-all'],
		});
	};

	return (
		<>
			<Stack gap='xs' className={styles.assignmentBlock}>
				<div className={styles.assignmentHeader}>
					<Text className={styles.assignmentTitle}>
						{t('general.campaignObjective')}
					</Text>
					<Text size='xs' c='dimmed' className={styles.assignmentHint}>
						{t('general.campaignObjectiveDesc')}
					</Text>
				</div>

				<div className={styles.objectiveField}>
					<Select
						placeholder={
							objectivesLoading
								? t('general.loadingObjectives')
								: t('general.selectObjective')
						}
						data={objectiveSelectData}
						value={form.values.objectiveId?.toString() || null}
						onChange={handleObjectiveChange}
						leftSection={<IconTarget size={16} />}
						searchable
						clearable
						disabled={objectivesLoading}
						error={objectiveError}
						size='sm'
					/>
					<Tooltip label={t('general.createNewObjective')} withArrow>
						<ActionIcon
							variant='light'
							color='orange'
							size='lg'
							onClick={() => setIsObjectiveModalOpen(true)}
							aria-label={t('general.createNewObjective')}
							className={styles.objectiveAction}
						>
							<IconPlus size={18} />
						</ActionIcon>
					</Tooltip>
				</div>
			</Stack>

			<Modal
				opened={isObjectiveModalOpen}
				onClose={() => setIsObjectiveModalOpen(false)}
				title={t('general.createObjectiveTitle')}
				centered
			>
				<CampaignObjectivesForm
					onSuccess={handleObjectiveCreated}
					onCancel={() => setIsObjectiveModalOpen(false)}
				/>
			</Modal>
		</>
	);
};

export default CampaignObjectiveField;
