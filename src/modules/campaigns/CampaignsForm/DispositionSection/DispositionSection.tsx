import React, { useEffect } from 'react';
import {
	Button,
	Group,
	Paper,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { IconPlus, IconSitemap } from '@tabler/icons-react';
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

interface DispositionEmptyStateProps {
	onAdd: () => void;
}

const DispositionEmptyState: React.FC<DispositionEmptyStateProps> = ({
	onAdd,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes']);
	const steps = [
		t('disposition.emptyState.step1'),
		t('disposition.emptyState.step2'),
		t('disposition.emptyState.step3'),
	];

	return (
		<Paper withBorder className={styles.emptyState} p='xl' radius='md'>
			<div className={styles.emptyGrid}>
				<Stack gap='md'>
					<ThemeIcon size={48} radius='xl' color='gray' variant='light'>
						<IconSitemap size={24} />
					</ThemeIcon>
					<Stack gap={4}>
						<Text size='sm' fw={700}>
							{t('disposition.emptyState.heading')}
						</Text>
						<Text size='sm' c='dimmed' lh={1.55}>
							{t('disposition.emptyState.body')}
						</Text>
					</Stack>
				</Stack>
				<Stack gap='md' justify='space-between'>
					<Stack gap='sm'>
						{steps.map((step, i) => (
							<Group key={i} gap='sm' align='flex-start' wrap='nowrap'>
								<Text
									component='span'
									size='xs'
									fw={700}
									className={styles.stepNumber}
								>
									{i + 1}
								</Text>
								<Text size='xs' c='dimmed' lh={1.5}>
									{step}
								</Text>
							</Group>
						))}
					</Stack>
					<div>
						<Button
							leftSection={<IconPlus size={15} />}
							onClick={onAdd}
							size='sm'
						>
							{t('disposition.addOutcome')}
						</Button>
					</div>
				</Stack>
			</div>
		</Paper>
	);
};

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
					</Stack>
				</Paper>
			) : hasFlow ? (
				<DispositionSummaryCard flow={currentDispositionFlow!} />
			) : (
				<DispositionEmptyState onAdd={() => handleOpenModal(false)} />
			)}
		</SectionCard>
	);
};

export default DispositionSection;
