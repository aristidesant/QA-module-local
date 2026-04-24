import React, { useEffect } from 'react';
import { Group, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconSitemap } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import DispositionForm from './DispositionForm';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useDispositionBuilderStore } from './dispositionStore';
import { useDispositionFlowsByCampaignPath } from '~/queries/dispositionFlowQueries';
import { notifications } from '@mantine/notifications';
import DispositionViewer from './DispositionViewer';
import { useCampaignId } from '~/modules/campaigns/campaignFormFunctions';
import styles from './DispositionSection.module.css';

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

	const { setDispositionFlow, setFlowJson, setCampaignId } =
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
			setCampaignId(campaignId);
		}

		modals.open({
			modalId: 'disposition-form',
			size: '100vw',
			fullScreen: true,
			onClose: () => {
				setCampaignId(undefined);
				setDispositionFlow({});
				setFlowJson({});
			},
			children: (
				<DispositionForm
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
			actions={{
				primary: {
					kind: hasFlow ? 'edit' : 'add',
					label: hasFlow
						? t('disposition.editOutcome')
						: t('disposition.addOutcome'),
					onClick: () => handleOpenModal(hasFlow),
					loading: isLoadingCurrentFlow,
				},
			}}
			description={t('disposition.description')}
		>
			{isLoadingCurrentFlow ? (
				<Paper withBorder className={styles.loadingState} p='xl' radius='md'>
					<Stack gap='md'>
						<Group justify='space-between' align='center'>
							<Stack gap={6} style={{ flex: 1 }}>
								<Skeleton height={16} width='28%' radius='sm' />
								<Skeleton height={10} width='52%' radius='sm' />
							</Stack>
							<Skeleton height={32} width={104} radius='sm' />
						</Group>
						<Skeleton height={220} radius='md' />
						<Group grow>
							<Skeleton height={68} radius='md' />
							<Skeleton height={68} radius='md' />
						</Group>
					</Stack>
				</Paper>
			) : isCurrentFlowError ? (
				<Paper withBorder className={styles.errorState} p='xl' radius='md'>
					<Stack align='center' gap='xs'>
						<Text size='sm' fw={500} c='red'>
							{t('status.error', { ns: 'common', defaultValue: 'Error' })}
						</Text>
						<Text size='xs' c='dimmed' ta='center' maw={460}>
							{currentFlowError?.message ?? t('disposition.noFlowDescription')}
						</Text>
					</Stack>
				</Paper>
			) : currentDispositionFlow ? (
				<DispositionViewer flow={currentDispositionFlow} />
			) : (
				<Paper withBorder className={styles.emptyState} p='xl' radius='md'>
					<Stack align='center' gap='xs'>
						<ThemeIcon size={48} radius='xl' color='gray' variant='light'>
							<IconSitemap size={24} />
						</ThemeIcon>
						<Text size='sm' fw={500} c='dimmed'>
							{t('disposition.noFlowConfigured')}
						</Text>
						<Text size='xs' c='dimmed' ta='center' maw={400}>
							{t('disposition.noFlowDescription')}
						</Text>
					</Stack>
				</Paper>
			)}
		</SectionCard>
	);
};

export default DispositionSection;
