import {
	Alert,
	Badge,
	Button,
	Group,
	Modal,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconClipboardCheck,
	IconEdit,
	IconTrash,
	IconUserCircle,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';

import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import AgentEditorForm from '~/modules/qa/components/AgentEditorForm';
import { AGENT_TYPE_COLORS } from '~/modules/qa/constants/badgeColors';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type { CreateAgentPayload, UpdateAgentPayload } from '~/models/qa';
import {
	useAgentQuery,
	useDeleteAgentMutation,
	useUpdateAgentMutation,
} from '~/queries/qa/agentsQueries';
import { useEvaluationsQuery } from '~/queries/qa/evaluationsQueries';
import {
	getAgentDisplayName,
	isAutoMigratedAgent,
} from '~/modules/qa/utils/agent';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import classes from './AgentDetailPage.module.css';
import AgentHistoryCard from './components/AgentHistoryCard';

export default function AgentDetailPage() {
	const { t } = useTranslation('qa.agents');
	const navigate = useNavigate();
	const params = useParams();
	const agentId = Number(params.agentId);
	const agentQuery = useAgentQuery(agentId);
	const updateMutation = useUpdateAgentMutation(agentId);
	const deleteMutation = useDeleteAgentMutation();
	const [editOpen, setEditOpen] = useState(false);
	const { page, setPage, pageSize, setPageSize, limit, offset, getTotalPages } =
		useListPageState();
	const agent = agentQuery.data;
	const historyQuery = useEvaluationsQuery(
		{
			agentId,
			limit,
			offset,
			sortBy: 'createdAt',
			orderBy: 'DESC',
		},
		Boolean(agent)
	);
	const history = historyQuery.data?.data ?? [];
	const historyTotal = historyQuery.data?.total ?? 0;
	const totalPages = getTotalPages(historyTotal);
	const dateTimeFormatter = useDateFormatter('dateTime');

	const updateAgent = async (
		payload: CreateAgentPayload | UpdateAgentPayload
	) => {
		if ('employeeId' in payload) return;
		await updateMutation.mutateAsync(payload);
		setEditOpen(false);
		notifySuccess(t('notifications.updated'));
	};

	const confirmDelete = () => {
		const blocked = historyTotal > 0;

		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: {
				confirm: t('actions.delete'),
				cancel: t('actions.cancel'),
			},
			confirmProps: { color: 'red', disabled: blocked },
			children: (
				<Stack gap='xs'>
					<Text size='sm'>
						{blocked
							? t('delete.blocked', { count: historyTotal })
							: t('delete.description', {
									name: agent ? getAgentDisplayName(agent) : '',
								})}
					</Text>
					<Text c='dimmed' size='xs'>
						{t('delete.referencedHint')}
					</Text>
				</Stack>
			),
			onConfirm: async () => {
				try {
					await deleteMutation.mutateAsync(agentId);
					notifySuccess(t('notifications.deleted'));
					navigate('/qa/agents', { replace: true });
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	return (
		<>
			<Modal
				onClose={() => setEditOpen(false)}
				opened={editOpen}
				size='md'
				title={t('form.editTitle')}
			>
				<AgentEditorForm
					agent={agent}
					loading={updateMutation.isPending}
					onCancel={() => setEditOpen(false)}
					onSubmit={updateAgent}
				/>
			</Modal>

			<ContentContainer
				contentWidth='full'
				onBackClick={() => navigate('/qa/agents')}
				showBackButton
				title={agent ? getAgentDisplayName(agent) : t('detail.title')}
				titleRight={
					agent ? (
						<Group gap='xs'>
							{isAutoMigratedAgent(agent) ? (
								<Badge color='yellow' variant='light'>
									{t('badges.autoMigrated')}
								</Badge>
							) : null}
							<Badge color={AGENT_TYPE_COLORS[agent.agentType]} variant='light'>
								{t(`types.${agent.agentType === 'AI_BOT' ? 'aiBot' : 'human'}`)}
							</Badge>
							{!isAutoMigratedAgent(agent) ? (
								<Button
									component={RouterLink}
									leftSection={<IconClipboardCheck size={16} />}
									size='sm'
									to={`/qa/evaluations/new?agentId=${agent.id}`}
								>
									{t('actions.startEvaluation')}
								</Button>
							) : null}
							<Button
								leftSection={<IconEdit size={16} />}
								onClick={() => setEditOpen(true)}
								size='sm'
								variant='light'
							>
								{t('actions.edit')}
							</Button>
							<Button
								color='red'
								leftSection={<IconTrash size={16} />}
								onClick={confirmDelete}
								size='sm'
								variant='subtle'
							>
								{t('actions.delete')}
							</Button>
						</Group>
					) : null
				}
			>
				<Stack gap='md'>
					{agentQuery.isLoading ? (
						<Stack gap='sm'>
							<Skeleton height={100} />
							<Skeleton height={180} />
						</Stack>
					) : null}
					{agentQuery.isError ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={16} />}
							title={t('states.errorTitle')}
							variant='light'
						>
							{getErrorMessage(agentQuery.error)}
						</Alert>
					) : null}

					{agent ? (
						<SectionCard icon={IconUserCircle} title={t('detail.profile')}>
							<div className={classes.profileGrid}>
								{[
									[t('form.employeeId'), agent.employeeId],
									[
										t('form.firstName'),
										agent.firstName || t('common.notProvided'),
									],
									[
										t('form.lastName'),
										agent.lastName || t('common.notProvided'),
									],
									[t('form.email'), agent.email || t('common.notProvided')],
									[t('form.team'), agent.team || t('common.notProvided')],
									[
										t('detail.createdAt'),
										agent.createdAt
											? dateTimeFormatter.format(new Date(agent.createdAt))
											: t('common.notAvailable'),
									],
									[
										t('detail.updatedAt'),
										agent.updatedAt
											? dateTimeFormatter.format(new Date(agent.updatedAt))
											: t('common.notAvailable'),
									],
								].map(([label, value]) => (
									<Stack className={classes.profileItem} gap={2} key={label}>
										<Text className={classes.profileLabel} size='xs'>
											{label}
										</Text>
										<Text fw={600} size='sm'>
											{value}
										</Text>
									</Stack>
								))}
							</div>
						</SectionCard>
					) : null}

					{agent ? (
						<AgentHistoryCard
							errorMessage={getErrorMessage(historyQuery.error)}
							history={history}
							historyTotal={historyTotal}
							isError={historyQuery.isError}
							isLoading={historyQuery.isLoading}
							onPageChange={setPage}
							onPageSizeChange={setPageSize}
							page={page}
							pageSize={pageSize}
							totalPages={totalPages}
						/>
					) : null}
				</Stack>
			</ContentContainer>
		</>
	);
}
