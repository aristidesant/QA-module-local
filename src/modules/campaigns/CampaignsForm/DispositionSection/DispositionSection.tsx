import React, { useEffect } from 'react';
import {
	Button,
	Paper,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import DispositionForm from './DispositionForm';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useDispositionBuilderStore } from './dispositionStore';
import { useDispositionFlowsByCampaignPath } from '~/queries/dispositionFlowQueries';
import { notifications } from '@mantine/notifications';
import DispositionSummaryCard from './DispositionSummaryCard';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import styles from './DispositionSection.module.css';
import OutcomeSetupExperience from './OutcomeSetupExperience';

const DispositionSection: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.outcomes',
		'campaign.detail',
		'common',
	]);
	const campaignId = useCampaignId();
	const { setRightComponent } = useCampaignsStore();

	const {
		data: currentDispositionFlow,
		isLoading: isLoadingCurrentFlow,
		isError: isCurrentFlowError,
		error: currentFlowError,
		refetch: refetchCurrentFlow,
	} = useDispositionFlowsByCampaignPath(campaignId);

	const { setDispositionFlow, setFlowJson, setCampaignId, setSelectedCatalog } =
		useDispositionBuilderStore((s) => s);

	useEffect(() => {
		return () => {
			setRightComponent(null);
		};
	}, []);

	const handleOpenModal = (isEdit: boolean) => {
		if (isEdit) {
			if (currentDispositionFlow?.id) {
				setDispositionFlow(currentDispositionFlow);
				setFlowJson(currentDispositionFlow.flowJson || {});
			}
			setCampaignId(campaignId);
		} else {
			setDispositionFlow({});
			setFlowJson({});
			setSelectedCatalog(null);
			setCampaignId(campaignId);
		}

		modals.open({
			modalId: 'disposition-form',
			size: '100vw',
			fullScreen: true,
			withCloseButton: false,
			closeOnEscape: false,
			closeOnClickOutside: false,
			padding: 0,
			onClose: () => {
				setCampaignId(undefined);
				setDispositionFlow({});
				setFlowJson({});
				setSelectedCatalog(null);
			},
			children: (
				<DispositionForm
					onCancel={() => modals.close('disposition-form')}
					onComplete={() => {
						refetchCurrentFlow();
						modals.close('disposition-form');
						notifications.show({
							title: t('success', { ns: 'common' }),
							message: t('disposition.saveSuccess'),
							color: 'green',
						});
					}}
				/>
			),
		});
	};

	const hasFlow = Boolean(
		(currentDispositionFlow?.flowJson?.dispositionNodes?.length || 0) > 0
	);

	return (
		<SectionCard
			title={t('disposition.title')}
			actions={
				hasFlow
					? {
							primary: {
								kind: 'edit',
								label: t('disposition.editOutcome'),
								onClick: () => handleOpenModal(true),
								loading: isLoadingCurrentFlow,
							},
						}
					: undefined
			}
			description={t('disposition.description')}
		>
			{isLoadingCurrentFlow ? (
				<Stack gap='md'>
					<Paper withBorder className={styles.loadingState} p='md' radius='md'>
						<SimpleGrid cols={{ base: 2, sm: 4 }}>
							{Array.from({ length: 4 }).map((_, i) => (
								<Stack key={i} gap={6} p='xs'>
									<Skeleton height={26} width='45%' radius='sm' />
									<Skeleton height={9} width='65%' radius='sm' />
								</Stack>
							))}
						</SimpleGrid>
					</Paper>
					<Skeleton height={220} radius='md' />
				</Stack>
			) : isCurrentFlowError ? (
				<Paper withBorder className={styles.errorState} p='xl' radius='md'>
					<Stack align='center' gap='xs'>
						<Text size='sm' fw={500} c='red'>
							{t('status.error', { ns: 'common', defaultValue: 'Error' })}
						</Text>
						<Text size='xs' c='dimmed' ta='center' maw={460}>
							{currentFlowError?.message ?? t('disposition.noFlowDescription')}
						</Text>
						<Button
							variant='light'
							color='red'
							size='xs'
							leftSection={<IconRefresh size={15} />}
							onClick={() => refetchCurrentFlow()}
						>
							{t('disposition.tree.retry')}
						</Button>
					</Stack>
				</Paper>
			) : hasFlow ? (
				<DispositionSummaryCard flow={currentDispositionFlow!} />
			) : (
				<OutcomeSetupExperience
					campaignId={campaignId}
					onCreate={() => handleOpenModal(false)}
					onCopied={async () => {
						await refetchCurrentFlow();
					}}
				/>
			)}
		</SectionCard>
	);
};

export default DispositionSection;
