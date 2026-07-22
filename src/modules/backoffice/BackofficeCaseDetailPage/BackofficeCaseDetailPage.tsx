import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
	Alert,
	Badge,
	Button,
	Divider,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconAlertCircle,
	IconCircleCheck,
	IconHistory,
	IconInfoCircle,
	IconUser,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import { useBackofficeRole } from '~/hooks/useBackofficeRole';
import { usePermissions } from '~/hooks/usePermissions';
import {
	useEligibleBackofficeAgents,
	useBackofficeCase,
	useBackofficeCaseHistory,
	useMarkBackofficeCaseManaged,
	useUpdateBackofficeAssignment,
} from '~/queries/backofficeCaseQueries';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import type {
	BackofficeCase,
	BackofficeCaseHistory,
	BackofficeCaseStatus,
} from '~/models/BackofficeCaseModel';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './BackofficeCaseDetailPage.module.css';

const parseCaseId = (value: string | undefined) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const formatDate = (value: string | null | undefined, locale: string) => {
	if (!value) return '—';
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
};

const getUserName = (
	user: BackofficeCase['assignedUser'],
	fallback: string
) => {
	if (!user) return fallback;
	return (
		[user.firstName, user.lastName].filter(Boolean).join(' ') ||
		user.username ||
		fallback
	);
};

const getActorName = (
	user: BackofficeCaseHistory['actorUser'],
	fallback: string,
	automated: string
) => (user ? getUserName(user, fallback) : automated);

const StatusBadge = ({
	status,
	label,
}: {
	status: BackofficeCaseStatus;
	label: string;
}) => (
	<Badge
		color={
			status === 'MANAGED' ? 'green' : status === 'ASSIGNED' ? 'blue' : 'gray'
		}
		variant='light'
		size='sm'
	>
		{label}
	</Badge>
);

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className={classes.infoRow}>
		<Text size='sm' c='dimmed'>
			{label}
		</Text>
		<Text size='sm' fw={500} ta='right'>
			{value}
		</Text>
	</div>
);

const BackofficeCaseDetailPage = () => {
	const { t, i18n } = useTranslation('backoffice-cases');
	const navigate = useNavigate();
	const location = useLocation();
	const { caseId: rawCaseId } = useParams<{ caseId: string }>();
	const caseId = parseCaseId(rawCaseId);
	const { isAdmin } = useBackofficeRole();
	const { canPerformAction } = usePermissions();
	const canUpdate = canPerformAction(
		ModuleEnum.BACKOFFICE_CASES,
		PermissionEnum.UPDATE
	);

	const caseQuery = useBackofficeCase(caseId);
	const historyQuery = useBackofficeCaseHistory(caseId);
	const agentsQuery = useEligibleBackofficeAgents(isAdmin);
	const assignmentMutation = useUpdateBackofficeAssignment();
	const managedMutation = useMarkBackofficeCaseManaged();
	const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

	const caseData = caseQuery.data;

	useEffect(() => {
		setSelectedAssignee(
			caseData?.assignedUserId ? String(caseData.assignedUserId) : null
		);
	}, [caseData?.assignedUserId]);

	const isManaged = caseData?.status === 'MANAGED';
	const canManageCase = Boolean(isAdmin && canUpdate && caseData && !isManaged);
	const routeState = location.state as { from?: string } | null;
	const fallbackBackPath = isAdmin
		? '/backoffice/supervisor'
		: '/backoffice/cases';
	const handleBack = () =>
		navigate(routeState?.from || fallbackBackPath, { replace: false });
	const selectedAssigneeId = selectedAssignee ? Number(selectedAssignee) : null;
	const assignmentChanged =
		selectedAssigneeId !== (caseData?.assignedUserId ?? null);

	const agentOptions = useMemo(
		() =>
			agentsQuery.data?.map((agent) => ({
				value: String(agent.id),
				label:
					[agent.firstName, agent.lastName].filter(Boolean).join(' ') ||
					agent.username,
			})) ?? [],
		[agentsQuery.data]
	);

	const handleAssignmentSave = () => {
		if (!caseData || !assignmentChanged || !canManageCase) return;

		modals.openConfirmModal({
			title: t(
				selectedAssigneeId
					? caseData.assignedUserId
						? 'assignment.transferTitle'
						: 'assignment.assignTitle'
					: 'assignment.unassignTitle'
			),
			children: (
				<Text size='sm'>
					{t(
						selectedAssigneeId
							? caseData.assignedUserId
								? 'assignment.transferDescription'
								: 'assignment.assignDescription'
							: 'assignment.unassignDescription'
					)}
				</Text>
			),
			labels: {
				confirm: t('assignment.confirm'),
				cancel: t('assignment.cancel'),
			},
			confirmProps: { color: selectedAssigneeId ? 'green' : 'red' },
			onConfirm: async () => {
				try {
					await assignmentMutation.mutateAsync({
						id: caseData.id,
						assignedUserId: selectedAssigneeId,
					});
					notifications.show({
						title: t('notifications.assignmentSuccessTitle'),
						message: t('notifications.assignmentSuccessMessage'),
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: t('notifications.actionFailedTitle'),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const handleMarkAsManaged = () => {
		if (!caseData || caseData.status !== 'ASSIGNED' || !canUpdate) return;

		modals.openConfirmModal({
			title: t('managed.confirmTitle'),
			children: <Text size='sm'>{t('managed.confirmDescription')}</Text>,
			labels: {
				confirm: t('managed.confirm'),
				cancel: t('managed.cancel'),
			},
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					await managedMutation.mutateAsync(caseData.id);
					notifications.show({
						title: t('notifications.managedSuccessTitle'),
						message: t('notifications.managedSuccessMessage'),
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: t('notifications.actionFailedTitle'),
						message: getErrorMessage(error),
						color: 'red',
					});
				}
			},
		});
	};

	const historyColumns = useMemo<BaseTableColumnDef<BackofficeCaseHistory>[]>(
		() => [
			{
				accessorKey: 'eventType',
				header: t('history.event'),
				cell: ({ row }) => t(`events.${row.original.eventType}`),
			},
			{
				id: 'actor',
				header: t('history.actor'),
				cell: ({ row }) =>
					getActorName(
						row.original.actorUser,
						t('common.unknownUser'),
						t('common.automated')
					),
			},
			{
				id: 'transition',
				header: t('history.transition'),
				cell: ({ row }) => {
					const previous = row.original.previousStatus
						? t(`statuses.${row.original.previousStatus}`)
						: '—';
					const next = row.original.newStatus
						? t(`statuses.${row.original.newStatus}`)
						: '—';
					return `${previous} → ${next}`;
				},
			},
			{
				accessorKey: 'createdAt',
				header: t('history.date'),
				cell: ({ row }) => formatDate(row.original.createdAt, i18n.language),
			},
		],
		[i18n.language, t]
	);

	if (!caseId) {
		return (
			<ContentContainer
				title={t('detail.title')}
				showBackButton
				onBackClick={handleBack}
			>
				<Alert color='red' icon={<IconAlertCircle size={18} />}>
					{t('errors.invalidId')}
				</Alert>
			</ContentContainer>
		);
	}

	if (caseQuery.isError) {
		return (
			<ContentContainer
				title={t('detail.title')}
				showBackButton
				onBackClick={handleBack}
			>
				<Alert color='red' icon={<IconAlertCircle size={18} />}>
					{getErrorMessage(caseQuery.error)}
				</Alert>
			</ContentContainer>
		);
	}

	if (caseQuery.isLoading || !caseData) {
		return (
			<ContentContainer
				title={t('detail.title')}
				showBackButton
				onBackClick={handleBack}
			>
				<Stack gap='sm'>
					<div className={classes.loadingBlock} />
					<div className={classes.loadingBlock} />
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			title={t('detail.titleWithId', { id: caseData.id })}
			description={t('detail.description')}
			showBackButton
			onBackClick={handleBack}
			titleRight={
				<StatusBadge
					status={caseData.status}
					label={t(`statuses.${caseData.status}`)}
				/>
			}
			contentWidth='full'
		>
			<Stack gap='md' className={classes.root}>
				{caseData.status === 'MANAGED' && (
					<Alert color='green' icon={<IconCircleCheck size={18} />}>
						{t('managed.completedNotice', {
							date: formatDate(caseData.managedAt, i18n.language),
						})}
					</Alert>
				)}

				<div className={classes.layout}>
					<div className={classes.mainColumn}>
						<SectionCard title={t('sections.caseData')} icon={IconInfoCircle}>
							<div className={classes.infoGrid}>
								<InfoRow label={t('fields.caseId')} value={`#${caseData.id}`} />
								<InfoRow
									label={t('fields.contactId')}
									value={caseData.contactId}
								/>
								<InfoRow
									label={t('fields.contact')}
									value={
										caseData.contact
											? `${caseData.contact.firstName} ${caseData.contact.lastName}`.trim()
											: t('common.notAvailable')
									}
								/>
								<InfoRow
									label={t('fields.campaign')}
									value={caseData.campaign?.name ?? t('common.notAvailable')}
								/>
								<InfoRow
									label={t('fields.contactGroup')}
									value={
										caseData.contactGroup?.name ?? t('common.notAvailable')
									}
								/>
								<InfoRow
									label={t('fields.createdAt')}
									value={formatDate(caseData.createdAt, i18n.language)}
								/>
							</div>
						</SectionCard>

						<SectionCard title={t('sections.source')} icon={IconInfoCircle}>
							<div className={classes.infoGrid}>
								<InfoRow
									label={t('fields.conversationId')}
									value={caseData.latestConversationId}
								/>
								<InfoRow
									label={t('fields.conversationIdentifier')}
									value={
										caseData.latestConversation?.identifier ??
										t('common.notAvailable')
									}
								/>
								<InfoRow
									label={t('fields.conversationStart')}
									value={formatDate(
										caseData.latestConversation?.startDate,
										i18n.language
									)}
								/>
								<InfoRow
									label={t('fields.disposition')}
									value={
										caseData.latestDisposition?.dispositionName ??
										t('common.notAvailable')
									}
								/>
								<InfoRow
									label={t('fields.contactOutcome')}
									value={
										caseData.latestDisposition?.contactOutcome ??
										t('common.notAvailable')
									}
								/>
							</div>
						</SectionCard>

						<SectionCard title={t('sections.history')} icon={IconHistory}>
							{historyQuery.isError ? (
								<Alert color='red' icon={<IconAlertCircle size={18} />}>
									{getErrorMessage(historyQuery.error)}
								</Alert>
							) : (
								<BaseTable
									data={historyQuery.data ?? []}
									columns={historyColumns}
									getRowId={(row) => row.id}
									isLoading={historyQuery.isLoading}
									emptyMessage={t('history.empty')}
									rootProps={{ className: classes.historyTable }}
									density='compact'
								/>
							)}
						</SectionCard>
					</div>

					<div className={classes.sideColumn}>
						<SectionCard title={t('sections.workflow')} icon={IconUser}>
							<Stack gap='sm'>
								<InfoRow
									label={t('fields.status')}
									value={
										<StatusBadge
											status={caseData.status}
											label={t(`statuses.${caseData.status}`)}
										/>
									}
								/>
								<InfoRow
									label={t('fields.assignedUser')}
									value={getUserName(
										caseData.assignedUser,
										t('common.unassigned')
									)}
								/>
								<InfoRow
									label={t('fields.assignedAt')}
									value={formatDate(caseData.assignedAt, i18n.language)}
								/>
								<Divider />
								{isAdmin && canManageCase && (
									<>
										<Select
											label={t('assignment.selectAgent')}
											placeholder={t('assignment.selectAgentPlaceholder')}
											data={agentOptions}
											value={selectedAssignee}
											onChange={setSelectedAssignee}
											searchable
											clearable
											size='sm'
											error={
												agentsQuery.isError
													? t('assignment.agentsLoadError')
													: undefined
											}
										/>
										<Button
											variant='light'
											size='sm'
											disabled={!assignmentChanged}
											loading={assignmentMutation.isPending}
											onClick={handleAssignmentSave}
										>
											{t('assignment.save')}
										</Button>
									</>
								)}
								{canUpdate && caseData.status === 'ASSIGNED' && (
									<Button
										leftSection={<IconCircleCheck size={16} />}
										color='green'
										size='sm'
										loading={managedMutation.isPending}
										onClick={handleMarkAsManaged}
									>
										{t('managed.action')}
									</Button>
								)}
								{caseData.status === 'UNASSIGNED' && (
									<Alert color='yellow' icon={<IconAlertCircle size={18} />}>
										{t('managed.unassignedNotice')}
									</Alert>
								)}
								{isManaged && (
									<Alert color='gray' icon={<IconInfoCircle size={18} />}>
										{t('managed.lockedNotice')}
									</Alert>
								)}
							</Stack>
						</SectionCard>

						<SectionCard
							title={t('sections.manualWorkflow')}
							icon={IconInfoCircle}
						>
							<Text size='sm' c='dimmed'>
								{t('managed.manualWorkflow')}
							</Text>
						</SectionCard>
					</div>
				</div>
			</Stack>
		</ContentContainer>
	);
};

export default BackofficeCaseDetailPage;
