import {
	Alert,
	Badge,
	Box,
	Button,
	Group,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
	IconAlertTriangle,
	IconArrowLeft,
	IconArrowRight,
	IconPlayerPlay,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type { BaseTableColumnDef } from '~/components/BaseTable';
import { Modal as FormModal } from '@mantine/core';
import {
	PROVIDER_COLORS,
	TRANSCRIPTION_STATUS_COLORS,
} from '~/modules/qa/constants/badgeColors';
import type {
	Agent,
	Campaign,
	Conversation,
	EvaluatorAgent,
	EvaluatorType,
	QaForm,
} from '~/models/qa';
import { useAgentQuery, useAgentsQuery } from '~/queries/qa/agentsQueries';
import {
	useCampaignConversationsQuery,
	useCampaignsQuery,
} from '~/queries/qa/campaignsQueries';
import { useCreateAiEvaluationMutation } from '~/queries/qa/conversationsQueries';
import { useCreateEvaluationMutation } from '~/queries/qa/evaluationsQueries';
import { useEvaluatorAgentsQuery } from '~/queries/qa/evaluatorAgentsQueries';
import { useFormsQuery } from '~/queries/qa/formsQueries';
import { useSessionStore } from '~/stores/sessionStore';
import {
	getAgentDisplayName,
	isAutoMigratedAgent,
} from '~/modules/qa/utils/agent';
import { notifyError } from '~/modules/qa/utils/notifications';
import { PAGE_SIZE } from './NewEvaluationModal.constants';
import type {
	NewEvaluationModalProps,
	StepKey,
} from './NewEvaluationModal.types';
import classes from './NewEvaluationModal.module.css';
import PickerStep from './components/PickerStep';
import StepRail from './components/StepRail';

export default function NewEvaluationModal({
	opened,
	onClose,
	initialCampaignId,
	initialAgentId,
}: NewEvaluationModalProps) {
	const { t } = useTranslation('qa.evaluations');
	const navigate = useNavigate();
	const user = useSessionStore((state) => state.user);

	const [evaluationType, setEvaluationType] = useState<EvaluatorType>('HUMAN');
	const isAi = evaluationType === 'AI';
	const [activeStep, setActiveStep] = useState(0);

	const [selectedForm, setSelectedForm] = useState<QaForm | null>(null);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
		initialCampaignId ?? null
	);
	const [selectedConversation, setSelectedConversation] =
		useState<Conversation | null>(null);
	const [selectedEvaluator, setSelectedEvaluator] =
		useState<EvaluatorAgent | null>(null);

	const [formSearch, setFormSearch] = useState('');
	const [debouncedFormSearch] = useDebouncedValue(formSearch, 300);
	const [formPage, setFormPage] = useState(1);
	const [agentSearch, setAgentSearch] = useState('');
	const [debouncedAgentSearch] = useDebouncedValue(agentSearch, 300);
	const [agentPage, setAgentPage] = useState(1);
	const [conversationSearch, setConversationSearch] = useState('');
	const [debouncedConversationSearch] = useDebouncedValue(
		conversationSearch,
		300
	);
	const [conversationPage, setConversationPage] = useState(1);
	const [evaluatorSearch, setEvaluatorSearch] = useState('');
	const [debouncedEvaluatorSearch] = useDebouncedValue(evaluatorSearch, 300);
	const [evaluatorPage, setEvaluatorPage] = useState(1);

	const initialAgentQuery = useAgentQuery(
		initialAgentId ? Number(initialAgentId) : NaN
	);

	const createEvaluationMutation = useCreateEvaluationMutation();
	const createAiEvaluationMutation = useCreateAiEvaluationMutation(
		selectedConversation?.id ?? NaN
	);

	const formsQuery = useFormsQuery(useMemo(() => ({ pagination: false }), []));
	const campaignsQuery = useCampaignsQuery(
		useMemo(
			() => ({
				pagination: false,
				status: 'ACTIVE' as const,
				sortBy: 'createdAt' as const,
				orderBy: 'DESC' as const,
			}),
			[]
		)
	);
	const agentsQuery = useAgentsQuery({
		limit: PAGE_SIZE,
		offset: (agentPage - 1) * PAGE_SIZE,
		q: debouncedAgentSearch,
		sortBy: 'createdAt',
		orderBy: 'DESC',
	});
	const campaignId = selectedCampaignId ? Number(selectedCampaignId) : NaN;
	const conversationsQuery = useCampaignConversationsQuery(campaignId, {
		pagination: true,
		limit: PAGE_SIZE,
		offset: (conversationPage - 1) * PAGE_SIZE,
		q: debouncedConversationSearch.trim() || undefined,
		sortBy: 'createdAt',
		orderBy: 'DESC',
	});
	const evaluatorAgentsQuery = useEvaluatorAgentsQuery(
		{
			limit: PAGE_SIZE,
			offset: (evaluatorPage - 1) * PAGE_SIZE,
			q: debouncedEvaluatorSearch,
			isActive: true,
			sortBy: 'createdAt',
			orderBy: 'DESC',
		},
		isAi
	);

	// Forms endpoint has no server-side search; filter + paginate the active
	// forms client-side.
	const activeForms = useMemo(
		() => (formsQuery.data?.data ?? []).filter((form) => form.isActive),
		[formsQuery.data]
	);
	const filteredForms = useMemo(() => {
		const term = debouncedFormSearch.trim().toLowerCase();
		if (!term) return activeForms;
		return activeForms.filter(
			(form) =>
				form.name.toLowerCase().includes(term) ||
				(form.category ?? '').toLowerCase().includes(term)
		);
	}, [activeForms, debouncedFormSearch]);
	const formTotalPages = Math.max(
		1,
		Math.ceil(filteredForms.length / PAGE_SIZE)
	);
	const pagedForms = filteredForms.slice(
		(formPage - 1) * PAGE_SIZE,
		formPage * PAGE_SIZE
	);

	const agents = useMemo(
		() =>
			(agentsQuery.data?.data ?? []).filter(
				(agent) => !isAutoMigratedAgent(agent)
			),
		[agentsQuery.data]
	);
	const agentTotalPages = Math.max(
		1,
		Math.ceil((agentsQuery.data?.total ?? 0) / PAGE_SIZE)
	);

	const activeCampaigns = campaignsQuery.data?.data ?? [];
	const conversations = conversationsQuery.data?.data ?? [];
	const conversationTotalPages = Math.max(
		1,
		Math.ceil((conversationsQuery.data?.total ?? 0) / PAGE_SIZE)
	);

	const evaluatorAgents = evaluatorAgentsQuery.data?.data ?? [];
	const evaluatorTotalPages = Math.max(
		1,
		Math.ceil((evaluatorAgentsQuery.data?.total ?? 0) / PAGE_SIZE)
	);

	const transcriptReady =
		selectedConversation?.transcriptionStatus === 'COMPLETED';

	const conversationValue = selectedConversation
		? selectedConversation.externalRef ||
			t('modal.conversationIdentifier', { id: selectedConversation.id })
		: null;

	// The type toggle lives in the summary rail, so it is no longer a step.
	const stepKeys: StepKey[] = isAi
		? ['form', 'agent', 'conversation', 'evaluator']
		: ['form', 'agent', 'conversation'];
	const lastStepIndex = stepKeys.length - 1;
	const activeKey = stepKeys[activeStep] ?? 'form';
	const isLastStep = activeStep === lastStepIndex;

	const stepValues: Record<StepKey, string | null> = {
		form: selectedForm?.name ?? null,
		agent: selectedAgent ? getAgentDisplayName(selectedAgent) : null,
		conversation: conversationValue,
		evaluator: selectedEvaluator?.name ?? null,
	};
	const stepComplete: Record<StepKey, boolean> = {
		form: Boolean(selectedForm),
		agent: Boolean(selectedAgent),
		conversation: Boolean(selectedConversation),
		evaluator: Boolean(selectedEvaluator),
	};

	const canSubmit = Boolean(
		selectedForm &&
		selectedAgent &&
		selectedConversation &&
		(!isAi || (selectedEvaluator && transcriptReady))
	);
	const isSubmitting =
		createEvaluationMutation.isPending || createAiEvaluationMutation.isPending;
	const transcriptBlocking = Boolean(
		isAi && selectedConversation && !transcriptReady
	);

	// Reset all state whenever the modal is (re)opened.
	useEffect(() => {
		if (!opened) return;
		setEvaluationType('HUMAN');
		setActiveStep(0);
		setSelectedForm(null);
		setSelectedAgent(null);
		setSelectedCampaignId(initialCampaignId ?? null);
		setSelectedConversation(null);
		setSelectedEvaluator(null);
		setFormSearch('');
		setFormPage(1);
		setAgentSearch('');
		setAgentPage(1);
		setConversationSearch('');
		setConversationPage(1);
		setEvaluatorSearch('');
		setEvaluatorPage(1);
	}, [opened, initialCampaignId]);

	// Keep the active step within range when the step count changes with type.
	useEffect(() => {
		setActiveStep((step) => Math.min(step, isAi ? 3 : 2));
	}, [isAi]);

	// Preselect the agent when the modal is deep-linked from an agent profile.
	useEffect(() => {
		if (opened && initialAgentQuery.data) {
			setSelectedAgent(initialAgentQuery.data);
		}
	}, [opened, initialAgentQuery.data]);

	const goNext = () =>
		setActiveStep((step) => Math.min(step + 1, lastStepIndex));
	const goBack = () => setActiveStep((step) => Math.max(step - 1, 0));

	const submit = async () => {
		if (!selectedForm || !selectedAgent || !selectedConversation) return;

		try {
			if (isAi) {
				if (!selectedEvaluator) return;
				const result = await createAiEvaluationMutation.mutateAsync({
					formId: selectedForm.id,
					agentId: selectedAgent.id,
					evaluatorAgentId: selectedEvaluator.id,
					campaignId: selectedConversation.campaignId,
					interactionRef: selectedConversation.externalRef ?? undefined,
				});
				onClose();
				navigate(`/qa/evaluations/${result.evaluationId}`);
				return;
			}

			const evaluation = await createEvaluationMutation.mutateAsync({
				formId: selectedForm.id,
				agentId: selectedAgent.id,
				evaluatorType: 'HUMAN',
				evaluatorUserId: user?.id,
				interactionRef: selectedConversation.externalRef ?? undefined,
				interactionId: selectedConversation.id,
				campaignId: selectedConversation.campaignId,
			});
			onClose();
			navigate(`/qa/evaluations/${evaluation.id}`);
		} catch (error) {
			notifyError(error);
		}
	};

	const formColumns: BaseTableColumnDef<QaForm>[] = [
		{
			id: 'name',
			enableSorting: false,
			header: t('modal.columns.form'),
			cell: ({ row: { original: form } }) => (
				<Stack gap={2}>
					<Text fw={600} size='sm'>
						{form.name}
					</Text>
					{form.category ? (
						<Text c='dimmed' size='xs'>
							{form.category}
						</Text>
					) : null}
				</Stack>
			),
		},
	];

	const agentColumns: BaseTableColumnDef<Agent>[] = [
		{
			id: 'name',
			enableSorting: false,
			header: t('modal.columns.agent'),
			cell: ({ row: { original: agent } }) => (
				<Text fw={600} size='sm'>
					{getAgentDisplayName(agent)}
				</Text>
			),
		},
		{
			id: 'employeeId',
			enableSorting: false,
			header: t('modal.columns.employeeId'),
			cell: ({ row: { original: agent } }) => (
				<Text c='dimmed' size='sm'>
					{agent.employeeId}
				</Text>
			),
		},
	];

	const conversationColumns: BaseTableColumnDef<Conversation>[] = [
		{
			id: 'reference',
			enableSorting: false,
			header: t('modal.columns.reference'),
			cell: ({ row: { original: conversation } }) => (
				<Text fw={600} size='sm'>
					{conversation.externalRef || t('modal.noReference')}
				</Text>
			),
		},
		{
			id: 'transcription',
			enableSorting: false,
			header: t('modal.columns.transcription'),
			cell: ({ row: { original: conversation } }) =>
				conversation.transcriptionStatus ? (
					<Badge
						color={
							TRANSCRIPTION_STATUS_COLORS[conversation.transcriptionStatus]
						}
						size='sm'
						variant='light'
					>
						{t(
							`transcription.${conversation.transcriptionStatus.toLowerCase()}`
						)}
					</Badge>
				) : (
					<Text c='dimmed' size='xs'>
						{t('transcription.none')}
					</Text>
				),
		},
	];

	const evaluatorColumns: BaseTableColumnDef<EvaluatorAgent>[] = [
		{
			id: 'name',
			enableSorting: false,
			header: t('modal.columns.evaluator'),
			cell: ({ row: { original: agent } }) => (
				<Text fw={600} size='sm'>
					{agent.name}
				</Text>
			),
		},
		{
			id: 'provider',
			enableSorting: false,
			header: t('modal.columns.provider'),
			cell: ({ row: { original: agent } }) => (
				<Badge
					color={PROVIDER_COLORS[agent.provider]}
					size='sm'
					variant='light'
				>
					{agent.provider}
				</Badge>
			),
		},
		{
			id: 'model',
			enableSorting: false,
			header: t('modal.columns.model'),
			cell: ({ row: { original: agent } }) => (
				<Text ff='monospace' size='xs'>
					{agent.model}
				</Text>
			),
		},
	];

	return (
		<FormModal
			onClose={onClose}
			opened={opened}
			size='min(1080px, 94vw)'
			title={t('modal.title')}
		>
			<div className={classes.layout}>
				<StepRail
					activeStep={activeStep}
					evaluationType={evaluationType}
					isAi={isAi}
					onStepClick={setActiveStep}
					onTypeChange={setEvaluationType}
					stepComplete={stepComplete}
					stepKeys={stepKeys}
					stepValues={stepValues}
				/>

				<div className={classes.content}>
					<Box className={classes.stepBody}>
						{activeKey === 'form' ? (
							<PickerStep
								columns={formColumns}
								data={pagedForms}
								emptyTitle={t('modal.empty.forms')}
								getRowKey={(form) => String(form.id)}
								isLoading={formsQuery.isLoading}
								onPageChange={setFormPage}
								onSearchChange={(next) => {
									setFormSearch(next);
									setFormPage(1);
								}}
								onSelect={setSelectedForm}
								page={formPage}
								search={formSearch}
								selectedKey={selectedForm ? String(selectedForm.id) : null}
								total={filteredForms.length}
								totalPages={formTotalPages}
							/>
						) : null}

						{activeKey === 'agent' ? (
							<PickerStep
								columns={agentColumns}
								data={agents}
								emptyTitle={t('modal.empty.agents')}
								getRowKey={(agent) => String(agent.id)}
								isLoading={agentsQuery.isLoading}
								onPageChange={setAgentPage}
								onSearchChange={(next) => {
									setAgentSearch(next);
									setAgentPage(1);
								}}
								onSelect={setSelectedAgent}
								page={agentPage}
								search={agentSearch}
								selectedKey={selectedAgent ? String(selectedAgent.id) : null}
								total={agentsQuery.data?.total ?? 0}
								totalPages={agentTotalPages}
							/>
						) : null}

						{activeKey === 'conversation' ? (
							<Stack gap='sm'>
								<Select
									data={activeCampaigns.map((campaign: Campaign) => ({
										label: campaign.name,
										value: String(campaign.id),
									}))}
									label={t('modal.campaignLabel')}
									onChange={(value) => {
										setSelectedCampaignId(value);
										setSelectedConversation(null);
										setConversationPage(1);
									}}
									placeholder={t('modal.campaignPlaceholder')}
									searchable
									size='sm'
									value={selectedCampaignId}
								/>
								{selectedCampaignId ? (
									<PickerStep
										columns={conversationColumns}
										data={conversations}
										emptyTitle={t('modal.empty.conversations')}
										getRowKey={(conversation) => String(conversation.id)}
										isLoading={conversationsQuery.isLoading}
										onPageChange={setConversationPage}
										onSearchChange={(next) => {
											setConversationSearch(next);
											setConversationPage(1);
										}}
										onSelect={setSelectedConversation}
										page={conversationPage}
										search={conversationSearch}
										selectedKey={
											selectedConversation
												? String(selectedConversation.id)
												: null
										}
										total={conversationsQuery.data?.total ?? 0}
										totalPages={conversationTotalPages}
									>
										{transcriptBlocking ? (
											<Alert
												color='yellow'
												icon={<IconAlertTriangle size={16} />}
												variant='light'
											>
												{t('modal.transcriptRequired')}
											</Alert>
										) : null}
									</PickerStep>
								) : null}
							</Stack>
						) : null}

						{activeKey === 'evaluator' ? (
							<PickerStep
								columns={evaluatorColumns}
								data={evaluatorAgents}
								emptyTitle={t('modal.empty.evaluators')}
								getRowKey={(agent) => String(agent.id)}
								isLoading={evaluatorAgentsQuery.isLoading}
								onPageChange={setEvaluatorPage}
								onSearchChange={(next) => {
									setEvaluatorSearch(next);
									setEvaluatorPage(1);
								}}
								onSelect={setSelectedEvaluator}
								page={evaluatorPage}
								search={evaluatorSearch}
								selectedKey={
									selectedEvaluator ? String(selectedEvaluator.id) : null
								}
								total={evaluatorAgentsQuery.data?.total ?? 0}
								totalPages={evaluatorTotalPages}
							/>
						) : null}
					</Box>

					{isLastStep && transcriptBlocking ? (
						<Alert
							color='yellow'
							icon={<IconAlertTriangle size={16} />}
							mt='sm'
							variant='light'
						>
							{t('modal.transcriptRequired')}
						</Alert>
					) : null}

					<Group className={classes.footer} justify='space-between'>
						<Button
							disabled={activeStep === 0}
							leftSection={<IconArrowLeft size={16} />}
							onClick={goBack}
							size='sm'
							variant='default'
						>
							{t('modal.back')}
						</Button>
						{isLastStep ? (
							<Button
								disabled={!canSubmit}
								leftSection={<IconPlayerPlay size={16} />}
								loading={isSubmitting}
								onClick={() => void submit()}
								size='sm'
							>
								{t(isAi ? 'modal.submitAi' : 'modal.submitHuman')}
							</Button>
						) : (
							<Button
								disabled={!stepComplete[activeKey]}
								onClick={goNext}
								rightSection={<IconArrowRight size={16} />}
								size='sm'
							>
								{t('modal.next')}
							</Button>
						)}
					</Group>
				</div>
			</div>
		</FormModal>
	);
}
