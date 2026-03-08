import React, { useEffect } from 'react';
import { Paper, Stack, Text, ThemeIcon } from '@mantine/core';
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

const DispositionSection: React.FC = () => {
	const { t } = useTranslation(['campaigns', 'campaign.detail', 'common']);
	const { selectedCampaign, setRightComponent } = useCampaignsStore();

	const {
		data: currentDispositionFlow,
		isLoading: isLoadingCurrentFlow,
		refetch: refetchCurrentFlow,
	} = useDispositionFlowsByCampaignPath(selectedCampaign?.id);

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
			setCampaignId(selectedCampaign?.id);
		} else {
			setDispositionFlow({});
			setFlowJson({});
			setCampaignId(selectedCampaign?.id);
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
							title: 'Success',
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
					loading: hasFlow ? isLoadingCurrentFlow : false,
				},
			}}
			description={t('disposition.description')}
		>
			{currentDispositionFlow ? (
				<DispositionViewer flow={currentDispositionFlow} />
			) : (
				<Paper
					withBorder
					p='xl'
					radius='md'
					bg='var(--mantine-color-gray-0)'
					style={{ borderStyle: 'dashed' }}
				>
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
