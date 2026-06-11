import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	Alert,
	Flex,
	Loader,
	Stack,
	ActionIcon,
	Tooltip,
	Group,
} from '@mantine/core';
import { IconAlertCircle, IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import { useGetCampaign } from '~/queries/campaignsQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { ContactSection } from '../CampaignsForm/ContactSection/ContactSection';
import styles from './CampaignViewPage.module.css';

const CampaignViewPage = () => {
	const { t } = useTranslation([
		'campaign.view',
		'campaign.form.dashboards',
		'common',
	]);
	const { campaignId } = useParams<{ campaignId: string }>();
	const navigate = useNavigate();
	const { canPerformAction } = usePermissions();

	const { selectCampaign, resetView } = useCampaignsStore((state) => state);

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

	const titleRight = useMemo(() => {
		return (
			<Group gap='xs'>
				{canPerformAction(ModuleEnum.CAMPAIGNS, PermissionEnum.UPDATE) ? (
					<Tooltip label={t('index.actions.edit')} withArrow>
						<ActionIcon
							variant='light'
							size='lg'
							aria-label={t('index.actions.edit')}
							onClick={() => navigate(`/campaign/${campaign?.id}`)}
						>
							<IconEdit size={20} />
						</ActionIcon>
					</Tooltip>
				) : null}
			</Group>
		);
	}, [canPerformAction, navigate, campaign?.id, t]);

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
		<ContentContainer
			title={campaign.name}
			description={t('index.description')}
			showBackButton
			onBackClick={() => navigate('/campaigns')}
			titleRight={titleRight}
		>
			<Stack gap='sm' className={styles.contentStack}>
				<div className={styles.contactsSection}>
					<ContactSection />
				</div>
			</Stack>
		</ContentContainer>
	);
};

export default CampaignViewPage;
