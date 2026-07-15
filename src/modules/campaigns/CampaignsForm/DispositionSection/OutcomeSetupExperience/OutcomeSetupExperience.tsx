import React, { useMemo, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Skeleton,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconAlertCircle,
	IconCopy,
	IconEye,
	IconFolderPlus,
	IconRefresh,
	IconSearch,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AppDrawer from '~/components/AppDrawer';
import type { CampaignWithDispositionFlow } from '~/api/dispositionFlowApi';
import {
	useCampaignsWithDispositionFlow,
	useCopyDispositionFlow,
	useDispositionFlow,
} from '~/queries/dispositionFlowQueries';
import DispositionViewer from '../DispositionViewer';
import styles from './OutcomeSetupExperience.module.css';

export type OutcomeSetupMode = 'create' | 'copy';

export interface OutcomeCopyResult {
	flowId: number;
	sourceCampaignName: string;
}

interface OutcomeSetupExperienceProps {
	campaignId?: number;
	onCreate: () => void;
	onCopied?: (result: OutcomeCopyResult) => void | Promise<void>;
}

const getCampaignFlowId = (
	campaign: CampaignWithDispositionFlow
): number | null => campaign.flowId ?? campaign.dispositionFlow?.id ?? null;

const OutcomeSetupExperience: React.FC<OutcomeSetupExperienceProps> = ({
	campaignId,
	onCreate,
	onCopied,
}) => {
	const { t } = useTranslation(['campaign.form.outcomes', 'common']);
	const [mode, setMode] = useState<OutcomeSetupMode>('create');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
		null
	);
	const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
	const isCompact = useMediaQuery('(max-width: 64em)');
	const {
		data: campaigns = [],
		isLoading,
		isFetching,
		isError,
		refetch,
	} = useCampaignsWithDispositionFlow(mode === 'copy');
	const copyMutation = useCopyDispositionFlow();

	const availableCampaigns = useMemo(
		() =>
			campaigns
				.filter((campaign) => getCampaignFlowId(campaign) !== null)
				.filter((campaign) => campaign.id !== campaignId)
				.filter((campaign) =>
					campaign.name
						.toLocaleLowerCase()
						.includes(searchQuery.toLocaleLowerCase().trim())
				),
		[campaignId, campaigns, searchQuery]
	);
	const selectedCampaign = campaigns.find(
		(campaign) => campaign.id === selectedCampaignId
	);
	const selectedFlowId = selectedCampaign
		? getCampaignFlowId(selectedCampaign)
		: null;
	const {
		data: previewFlow,
		isLoading: isPreviewLoading,
		isError: isPreviewError,
		refetch: refetchPreview,
	} = useDispositionFlow(selectedFlowId ?? undefined);

	const handleSelectCampaign = (campaign: CampaignWithDispositionFlow) => {
		setSelectedCampaignId(campaign.id);
		if (isCompact) setPreviewDrawerOpen(true);
	};

	const handleCopy = async () => {
		if (!campaignId || !selectedCampaign || !selectedFlowId) {
			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('disposition.setup.copyMissingSelection'),
				color: 'red',
			});
			return;
		}

		try {
			const response = await copyMutation.mutateAsync({
				sourceFlowId: selectedFlowId,
				targetCampaignId: campaignId,
			});
			notifications.show({
				title: t('disposition.setup.copySuccessTitle'),
				message: t('disposition.setup.copySuccessDescription', {
					name: selectedCampaign.name,
				}),
				color: 'green',
			});
			setPreviewDrawerOpen(false);
			await onCopied?.({
				flowId: response.flow.id,
				sourceCampaignName: selectedCampaign.name,
			});
		} catch {
			notifications.show({
				title: t('disposition.setup.copyErrorTitle'),
				message: t('disposition.setup.copyErrorDescription'),
				color: 'red',
			});
		}
	};

	const previewContent = (
		<div className={styles.previewContent}>
			{!selectedCampaign ? (
				<div className={styles.previewPlaceholder}>
					<ThemeIcon size={44} radius='xl' variant='light' color='gray'>
						<IconEye size={21} />
					</ThemeIcon>
					<Text fw={600}>{t('disposition.setup.previewEmptyTitle')}</Text>
					<Text size='sm' c='dimmed' ta='center' maw={360}>
						{t('disposition.setup.previewEmptyDescription')}
					</Text>
				</div>
			) : isPreviewLoading ? (
				<Stack gap='xs' p='sm'>
					<Skeleton height={32} width='48%' />
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} height={42} />
					))}
				</Stack>
			) : isPreviewError ? (
				<Alert
					icon={<IconAlertCircle size={18} />}
					title={t('disposition.setup.previewErrorTitle')}
					color='red'
				>
					<Stack gap='sm'>
						<Text size='sm'>
							{t('disposition.setup.previewErrorDescription')}
						</Text>
						<Button
							variant='light'
							color='red'
							size='xs'
							onClick={() => refetchPreview()}
						>
							{t('disposition.tree.retry')}
						</Button>
					</Stack>
				</Alert>
			) : previewFlow ? (
				<Stack gap='sm'>
					<div className={styles.previewHeader}>
						<div>
							<Text fw={650}>{selectedCampaign.name}</Text>
							<Text size='xs' c='dimmed'>
								{selectedCampaign.dispositionFlow?.name ??
									t('disposition.setup.flowFallbackName')}
							</Text>
						</div>
						{selectedCampaign.dispositionCatalog?.type && (
							<Badge variant='light' color='blue' radius='sm'>
								{selectedCampaign.dispositionCatalog.type}
							</Badge>
						)}
					</div>
					<div className={styles.previewTree}>
						<DispositionViewer
							flow={previewFlow}
							interactive={false}
							showHeader={false}
						/>
					</div>
					<Button
						color='green'
						leftSection={<IconCopy size={16} />}
						onClick={handleCopy}
						loading={copyMutation.isPending}
					>
						{t('disposition.setup.copyFlow')}
					</Button>
				</Stack>
			) : null}
		</div>
	);

	return (
		<div className={styles.setup}>
			<div
				className={styles.modeSelector}
				role='radiogroup'
				aria-label={t('disposition.setup.modeAria')}
			>
				<button
					type='button'
					role='radio'
					aria-checked={mode === 'create'}
					className={styles.modeOption}
					data-selected={mode === 'create' ? 'true' : 'false'}
					onClick={() => setMode('create')}
				>
					<ThemeIcon variant='light' color='green' size='lg'>
						<IconFolderPlus size={19} />
					</ThemeIcon>
					<span className={styles.modeCopy}>
						<Text component='span' fw={650}>
							{t('disposition.setup.createTitle')}
						</Text>
						<Text component='span' size='xs' c='dimmed'>
							{t('disposition.setup.createDescription')}
						</Text>
					</span>
				</button>
				<button
					type='button'
					role='radio'
					aria-checked={mode === 'copy'}
					className={styles.modeOption}
					data-selected={mode === 'copy' ? 'true' : 'false'}
					onClick={() => setMode('copy')}
				>
					<ThemeIcon variant='light' color='blue' size='lg'>
						<IconCopy size={19} />
					</ThemeIcon>
					<span className={styles.modeCopy}>
						<Text component='span' fw={650}>
							{t('disposition.setup.copyTitle')}
						</Text>
						<Text component='span' size='xs' c='dimmed'>
							{t('disposition.setup.copyDescription')}
						</Text>
					</span>
				</button>
			</div>

			{mode === 'create' ? (
				<div className={styles.createPanel}>
					<div>
						<Text fw={650}>{t('disposition.setup.createPanelTitle')}</Text>
						<Text size='sm' c='dimmed' maw={620}>
							{t('disposition.setup.createPanelDescription')}
						</Text>
					</div>
					<Button
						color='green'
						leftSection={<IconFolderPlus size={16} />}
						onClick={onCreate}
					>
						{t('disposition.setup.openBuilder')}
					</Button>
				</div>
			) : (
				<div className={styles.copyWorkspace}>
					<div className={styles.sourcePane}>
						<Group gap='xs' wrap='nowrap'>
							<TextInput
								leftSection={<IconSearch size={15} />}
								placeholder={t('disposition.setup.searchCampaigns')}
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.currentTarget.value)}
								className={styles.searchInput}
							/>
							<Button
								variant='default'
								size='sm'
								leftSection={<IconRefresh size={15} />}
								loading={isFetching}
								onClick={() => refetch()}
							>
								{t('disposition.setup.refresh')}
							</Button>
						</Group>

						{isLoading ? (
							<Stack gap='xs' mt='sm'>
								{Array.from({ length: 5 }).map((_, index) => (
									<Skeleton key={index} height={58} />
								))}
							</Stack>
						) : isError ? (
							<Alert
								icon={<IconAlertCircle size={18} />}
								title={t('disposition.setup.listErrorTitle')}
								color='red'
								mt='sm'
							>
								{t('disposition.setup.listErrorDescription')}
							</Alert>
						) : availableCampaigns.length === 0 ? (
							<div className={styles.listEmpty}>
								<Text fw={600}>
									{searchQuery
										? t('disposition.setup.noMatchesTitle')
										: t('disposition.setup.noCampaignsTitle')}
								</Text>
								<Text size='sm' c='dimmed' ta='center'>
									{searchQuery
										? t('disposition.setup.noMatchesDescription')
										: t('disposition.setup.noCampaignsDescription')}
								</Text>
							</div>
						) : (
							<div className={styles.sourceList}>
								{availableCampaigns.map((campaign) => (
									<button
										type='button'
										key={campaign.id}
										className={styles.sourceRow}
										data-selected={
											selectedCampaignId === campaign.id ? 'true' : 'false'
										}
										onClick={() => handleSelectCampaign(campaign)}
									>
										<span className={styles.sourceIdentity}>
											<Text component='span' size='sm' fw={600} lineClamp={1}>
												{campaign.name}
											</Text>
											<Text component='span' size='xs' c='dimmed' lineClamp={1}>
												{campaign.dispositionFlow?.name ??
													t('disposition.setup.flowFallbackName')}
											</Text>
										</span>
										<Group gap={4} wrap='nowrap'>
											{campaign.dispositionCatalog?.type && (
												<Badge size='xs' variant='light' color='blue'>
													{campaign.dispositionCatalog.type}
												</Badge>
											)}
											<IconEye size={16} aria-hidden='true' />
										</Group>
									</button>
								))}
							</div>
						)}
					</div>
					<div className={styles.desktopPreview}>{previewContent}</div>
				</div>
			)}

			<AppDrawer
				opened={Boolean(isCompact && previewDrawerOpen)}
				onClose={() => setPreviewDrawerOpen(false)}
				title={selectedCampaign?.name ?? t('disposition.setup.previewTitle')}
				size='xl'
			>
				{previewContent}
			</AppDrawer>
		</div>
	);
};

export default OutcomeSetupExperience;
