import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Group,
	Stack,
	Box,
	Text,
	Modal,
	Center,
	Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconNetwork } from '@tabler/icons-react';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import { useDispositionBuilderStore } from '~/modules/campaigns/CampaignsForm/DispositionSection/dispositionStore';
import DispositionForm from '~/modules/campaigns/CampaignsForm/DispositionSection/DispositionForm';
import DispositionViewer from '~/modules/campaigns/CampaignsForm/DispositionSection/DispositionViewer';
import {
	useDispositionFlow,
	useDeleteDispositionFlow,
	useDispositionFlowsByCampaignPath,
} from '~/queries/dispositionFlowQueries';
import { useSetCampaignDraft } from '~/queries/campaignsQueries';
import useDispositionLabel from '~/hooks/useDispositionLabel';
import styles from './StepThreeOutcomes.module.css';
import sharedStyles from '../CampaignWizard.module.css';
import { FlowSummary, type FlowOrigin } from './components/FlowSummary';
import OutcomeSetupExperience, {
	type OutcomeCopyResult,
} from '~/modules/campaigns/CampaignsForm/DispositionSection/OutcomeSetupExperience';
import type { DispositionNode } from '~/models/DispositionNodeModel';

interface StepThreeOutcomesProps {
	onNext: () => void;
}

export const StepThreeOutcomes: React.FC<StepThreeOutcomesProps> = ({
	onNext,
}) => {
	const { t } = useTranslation([
		'campaigns.wizard',
		'campaign.form.shared',
		'common',
	]);
	const { createdCampaign, setHasOutcomeFlow } = useCampaignWizardStore();

	const [modalOpened, setModalOpened] = useState(false);
	const [previewModalOpened, setPreviewModalOpened] = useState(false);
	const [previewFlowId, setPreviewFlowId] = useState<number | null>(null);
	const [hasCreatedFlow, setHasCreatedFlow] = useState(false);
	const [flowOrigin, setFlowOrigin] = useState<FlowOrigin | null>(null);
	const [importSourceCampaignName, setImportSourceCampaignName] =
		useState<string>('');
	const [copiedFlowId, setCopiedFlowId] = useState<number | null>(null);
	const queryClient = useQueryClient();
	const deleteDispositionFlow = useDeleteDispositionFlow();
	const { data: previewFlow, isLoading: isLoadingPreviewFlow } =
		useDispositionFlow(previewFlowId ?? undefined);
	const dispositionLabel = useDispositionLabel();

	// Check for existing flow
	const {
		data: existingFlow,
		isLoading: isLoadingExistingFlow,
		refetch: refetchExistingFlow,
	} = useDispositionFlowsByCampaignPath(createdCampaign?.id);

	const { mutateAsync: setDraft } = useSetCampaignDraft();

	React.useEffect(() => {
		if (existingFlow?.id) {
			setHasCreatedFlow(true);
			setHasOutcomeFlow(true);

			// If we land on this step and the flow already exists in this campaign,
			// we should not display it as an imported flow.
			setFlowOrigin((prev) => prev ?? 'existing');
		}
	}, [existingFlow, setHasOutcomeFlow]);

	const {
		flowJson,
		setDispositionFlow,
		setFlowJson,
		setCampaignId,
		setSelectedCatalog,
	} = useDispositionBuilderStore();

	const handleOpenModal = () => {
		setSelectedCatalog(null);
		if (existingFlow?.id) {
			setDispositionFlow(existingFlow);
			setFlowJson(existingFlow.flowJson ?? {});
		} else {
			setDispositionFlow({});
			setFlowJson({});
		}
		setCampaignId(createdCampaign?.id);
		setModalOpened(true);
	};

	const handleCloseModal = () => {
		setModalOpened(false);
		setSelectedCatalog(null);
	};

	const handleFlowComplete = () => {
		setHasCreatedFlow(true);
		setHasOutcomeFlow(true); // Sync with wizard store
		setFlowOrigin('created');
		setImportSourceCampaignName('');
		setCopiedFlowId(null);
		setModalOpened(false);
		void refetchExistingFlow();
		notifications.show({
			title: t('wizard.steps.outcomes.successCreatedTitle'),
			message: t('wizard.steps.outcomes.successCreatedMessage'),
			color: 'green',
		});
	};

	const handleCopiedFlow = async (result: OutcomeCopyResult) => {
		setCopiedFlowId(result.flowId);
		setPreviewFlowId(result.flowId);
		setFlowOrigin('imported');
		setImportSourceCampaignName(result.sourceCampaignName);
		setHasCreatedFlow(true);
		setHasOutcomeFlow(true);
		await refetchExistingFlow();
	};

	const handlePreviewFlow = (flowId: number) => {
		setPreviewFlowId(flowId);
		setPreviewModalOpened(true);
	};

	// Handle start over - remove the campaign flow (imported or created)
	const handleStartOver = async () => {
		if (!createdCampaign?.id) return;

		let flowIdToDelete = copiedFlowId ?? existingFlow?.id ?? null;
		if (!flowIdToDelete) {
			const result = await refetchExistingFlow();
			flowIdToDelete = result.data?.id ?? null;
		}

		if (flowIdToDelete) {
			try {
				await deleteDispositionFlow.mutateAsync(flowIdToDelete);
				notifications.show({
					title: t('wizard.steps.outcomes.flowRemovedTitle'),
					message:
						copiedFlowId || flowOrigin === 'imported'
							? t('wizard.steps.outcomes.flowRemovedImported')
							: t('wizard.steps.outcomes.flowRemovedCreated'),
					color: 'blue',
				});

				// Ensure campaign-path query reflects removal immediately
				queryClient.setQueryData(
					['dispositionFlows', 'campaignPath', createdCampaign.id],
					null
				);
				queryClient.invalidateQueries({
					queryKey: ['dispositionFlows', 'campaignPath', createdCampaign.id],
				});
			} catch (error) {
				notifications.show({
					title: t('common:status.error'),
					message:
						copiedFlowId || flowOrigin === 'imported'
							? t('wizard.steps.outcomes.errorRemoveImportedFailed')
							: t('wizard.steps.outcomes.errorRemoveFailed'),
					color: 'red',
				});
				return;
			}
		} else {
			notifications.show({
				title: t('wizard.steps.outcomes.noFlowFoundTitle'),
				message: t('wizard.steps.outcomes.noFlowFoundMessage'),
				color: 'orange',
			});
		}

		setHasCreatedFlow(false);
		setHasOutcomeFlow(false); // Sync with wizard store
		setFlowOrigin(null);
		setImportSourceCampaignName('');
		setCopiedFlowId(null);
		setPreviewFlowId(null);
	};

	const handleSubmit = async () => {
		if (!createdCampaign?.id) {
			notifications.show({
				title: t('common:status.error'),
				message: t('wizard.steps.outcomes.errorCampaignNotFound'),
				color: 'red',
			});
			return;
		}

		// Simplified check: If we have flagged that a flow is created, we trust it.
		// The checking of flowJson is handled by the modal saving process.
		if (!hasCreatedFlow && !existingFlow?.id) {
			notifications.show({
				title: t('wizard.steps.outcomes.noOutcomeFlowTitle'),
				message: t('wizard.steps.outcomes.noOutcomeFlowMessage'),
				color: 'orange',
			});
			return;
		}

		// Proceed to next step directly as the flow is already saved in the DB
		// by either the Modal (Create) or the Import logic.

		// Save draft step as 3 (Parameters Step)
		await setDraft({
			campaignId: String(createdCampaign.id),
			data: { isDraft: true, draftStep: 3 },
		}).catch(() => undefined);

		onNext();
	};

	const countTerminalOutcomes = (nodes: DispositionNode[] = []): number =>
		nodes.reduce(
			(total, node) =>
				total +
				(node.children?.length ? countTerminalOutcomes(node.children) : 1),
			0
		);
	const summaryNodes =
		existingFlow?.flowJson.dispositionNodes ?? flowJson.dispositionNodes ?? [];
	const nodeCount = countTerminalOutcomes(summaryNodes);

	// Loading state check
	if (!createdCampaign) {
		return (
			<Center py='xl'>
				<Stack align='center' gap='md'>
					<Loader size='lg' />
					<Text c='dimmed'>{t('wizard.steps.outcomes.loading')}</Text>
				</Stack>
			</Center>
		);
	}
	return (
		<>
			<Stack gap='xl' className={sharedStyles.stepSurface}>
				<Box className={sharedStyles.stepHeaderCard}>
					<Text className={sharedStyles.stepEyebrow}>
						{t('wizard.steps.outcomes.eyebrow')}
					</Text>
					<Text className={sharedStyles.stepTitle}>
						{t('wizard.steps.outcomes.title')}
					</Text>
					<Text className={sharedStyles.stepDescriptionText}>
						{t('wizard.steps.outcomes.intro')}
					</Text>
				</Box>

				{/* Outcomes Configuration Section */}
				<Box className={styles.sectionCard}>
					<div className={styles.sectionHeader}>
						<IconNetwork size={20} className={styles.sectionIcon} />
						<h3 className={styles.sectionTitle}>
							{t('wizard.steps.outcomes.configTitle')}
						</h3>
					</div>
					<Text className={styles.sectionDescription}>
						{dispositionLabel(t('wizard.steps.outcomes.configDesc'))}
					</Text>

					{hasCreatedFlow ? (
						// Show summary of created/imported flow
						<FlowSummary
							origin={flowOrigin ?? 'created'}
							nodeCount={nodeCount}
							importSourceCampaignName={importSourceCampaignName}
							canPreviewImported={!!copiedFlowId}
							onPreviewImported={
								copiedFlowId ? () => handlePreviewFlow(copiedFlowId) : undefined
							}
							onEditCreated={handleOpenModal}
							onStartOver={handleStartOver}
							isDeleting={deleteDispositionFlow.isPending}
						/>
					) : (
						// Show create/import flow interface
						<OutcomeSetupExperience
							campaignId={createdCampaign.id}
							onCreate={handleOpenModal}
							onCopied={handleCopiedFlow}
						/>
					)}
				</Box>
			</Stack>

			<Group className={sharedStyles.actions} justify='flex-end'>
				<Button
					type='button'
					loading={isLoadingExistingFlow}
					disabled={!hasCreatedFlow}
					onClick={handleSubmit} // Unified handler
				>
					{t('wizard.steps.outcomes.submit')}
				</Button>
			</Group>

			{/* Disposition Form Modal */}
			<Modal
				opened={modalOpened}
				onClose={handleCloseModal}
				size='100vw'
				fullScreen
				withCloseButton={false}
				padding={0}
				closeOnEscape={false}
				closeOnClickOutside={false}
			>
				<DispositionForm
					onCancel={handleCloseModal}
					onComplete={handleFlowComplete}
				/>
			</Modal>

			{/* Preview Flow Modal */}
			<Modal
				opened={previewModalOpened}
				onClose={() => setPreviewModalOpened(false)}
				size='xl'
				title={t('wizard.steps.outcomes.previewTitle')}
				centered
				data-testid='modal-outcome-flow-preview'
				closeButtonProps={{ ['data-testid' as string]: 'modal-close-btn' }}
			>
				<Stack gap='md'>
					{isLoadingPreviewFlow ? (
						<Center py='xl'>
							<Loader size='md' />
						</Center>
					) : previewFlow ? (
						<DispositionViewer flow={previewFlow} />
					) : (
						<Center py='xl'>
							<Text c='dimmed'>{t('wizard.steps.outcomes.noFlowData')}</Text>
						</Center>
					)}
				</Stack>
			</Modal>
		</>
	);
};
