import React, { useEffect } from 'react';
import { Button, Flex, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import SectionCard from '~/components/SectionCard';
import DispositionForm from './DispositionForm';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useDispositionBuilderStore } from './dispositionStore';
import { useDispositionFlowsByCampaignPath } from '~/queries/dispositionFlowQueries';
import { notifications } from '@mantine/notifications';
import DispositionViewer from './DispositionViewer';
import useDispositionLabel from '~/hooks/useDispositionLabel';

const DispositionSection: React.FC = () => {
	const { selectedCampaign, setRightComponent } = useCampaignsStore();
	const dispositionLabel = useDispositionLabel();

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
							message: dispositionLabel('Outcome flow saved successfully.'),
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
			title={dispositionLabel('Outcome Configuration')}
			headerActions={
				<Flex>
					{hasFlow ? (
						<Button
							onClick={() => handleOpenModal(true)}
							loading={isLoadingCurrentFlow}
						>
							{dispositionLabel('Edit outcome')}
						</Button>
					) : (
						<Button onClick={() => handleOpenModal(false)}>
							{dispositionLabel('Add outcome')}
						</Button>
					)}
				</Flex>
			}
			description={dispositionLabel(
				'Set up call outcomes for this campaign. Drag items from the catalog to build your outcome structure.'
			)}
		>
			{currentDispositionFlow ? (
				<DispositionViewer flow={currentDispositionFlow} />
			) : (
				<Text>{dispositionLabel('No outcome flow found.')}</Text>
			)}
		</SectionCard>
	);
};

export default DispositionSection;
