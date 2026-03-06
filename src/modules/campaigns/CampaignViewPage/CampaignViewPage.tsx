import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
	Alert,
	Flex,
	Loader,
	Stack,
	ActionIcon,
	Tooltip,
	Text,
	Group,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconEdit,
	IconListDetails,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactSection } from '../CampaignsForm/ContactSection';
import CampaignHealth from '../CampaignHealth';
import CampaignReportExport from './CampaignReportExport';
import ContactListDetails from '../CampaignsForm/ContactSection/ContactListDetails';
import styles from './CampaignViewPage.module.css';
import AppDrawer from '~/components/AppDrawer';

const CampaignViewPage = () => {
	const { t } = useTranslation(['campaign.view', 'common']);
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { canPerformAction } = usePermissions();

	const {
		selectCampaign,
		resetView,
		selectedContactList,
		isContactListDrawerOpen,
		closeContactListDrawer,
	} = useCampaignsStore((state) => state);

	const {
		data: campaign,
		isLoading,
		isError,
		error,
	} = useGetCampaign(campaignId ?? '');

	useEffect(() => {
		return () => {
			resetView();
		};
	}, [resetView]);

	useEffect(() => {
		if (campaign) {
			selectCampaign(campaign);
		}
	}, [campaign, selectCampaign]);

	if (!campaignId) {
		return (
			<ContentContainer
				title={t('index.title')}
				description={t('index.description')}
				showBackButton
				onBackClick={() => navigate('/campaigns')}
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title={t('index.missingId.title')}
					color='red'
					variant='light'
				>
					{t('index.missingId.message')}
				</Alert>
			</ContentContainer>
		);
	}

	if (isLoading) {
		return (
			<ContentContainer
				title={t('index.loading.title')}
				description={t('index.loading.description')}
				showBackButton
				onBackClick={() => navigate('/campaigns')}
			>
				<Flex justify='center' align='center' style={{ minHeight: '400px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	if (isError || !campaign) {
		return (
			<ContentContainer
				title={t('index.unavailable.title')}
				description={t('index.unavailable.description')}
				showBackButton
				onBackClick={() => navigate('/campaigns')}
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title={t('status.error', { ns: 'common' })}
					color='red'
					variant='light'
				>
					{error instanceof Error
						? error.message
						: t('index.unavailable.error.defaultMessage')}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<>
			<ContentContainer
				title={campaign.name}
				description={t('index.description')}
				showBackButton
				onBackClick={() => navigate('/campaigns')}
				titleRight={
					<Group gap='xs'>
						<CampaignReportExport campaignId={campaign.id} />
						{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE) ? (
							<Tooltip label={t('index.actions.edit')} withArrow>
								<ActionIcon
									variant='light'
									size='lg'
									aria-label={t('index.actions.edit')}
									onClick={() => navigate(`/campaign/${campaign.id}`)}
								>
									<IconEdit size={20} />
								</ActionIcon>
							</Tooltip>
						) : null}
					</Group>
				}
			>
				<Stack gap='sm' className={styles.contentStack}>
					<div className={styles.contactsSection}>
						<ContactSection />
					</div>
				</Stack>
			</ContentContainer>
			<AppDrawer
				opened={isContactListDrawerOpen && Boolean(selectedContactList)}
				onClose={closeContactListDrawer}
				size='lg'
				title={t('drawer.title')}
				description={t('drawer.description')}
				icon={<IconListDetails size={18} />}
			>
				{selectedContactList && (
					<Stack gap='sm' className={styles.drawerContent}>
						<CampaignHealth campaignId={`${campaign.id}`} />
						<ContactListDetails
							contactGroup={selectedContactList}
							onUpdateComplete={() => {
								void queryClient.invalidateQueries({
									queryKey: ['contactGroups'],
								});
							}}
							objectiveId={campaign.objectiveId}
							campaignId={campaign.id}
						/>
					</Stack>
				)}
				{!selectedContactList && (
					<Text size='sm' c='dimmed'>
						{t('drawer.empty')}
					</Text>
				)}
			</AppDrawer>
		</>
	);
};

export default CampaignViewPage;
