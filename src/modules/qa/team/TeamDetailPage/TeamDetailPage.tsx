import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { modals } from '@mantine/modals';
import {
	ActionIcon,
	Anchor,
	Avatar,
	Badge,
	Breadcrumbs,
	Button,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconX } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import BaseTable from '~/components/BaseTable/BaseTable';
import {
	useTeamStore,
	selectSupervisor,
	selectTeamAgents,
	selectTeamCampaignIds,
} from '~/stores/qa/teamStore';
import { TEAM_CAMPAIGNS } from '../mockData';
import type { TeamTableRow } from '../types';
import {
	agentProfilePath,
	teamBasePath,
	toTableRow,
	teamKpis,
} from '../helpers';
import { TeamKpiStrip } from '../YourTeamPage/TeamKpiStrip';
import { useTeamDetailColumns } from './useTeamDetailColumns';
import { AssignCampaignsDrawer } from './AssignCampaignsDrawer';
import { AddMembersDrawer } from './AddMembersDrawer';
import { EditSupervisorModal } from './EditSupervisorModal';
import styles from './TeamDetailPage.module.css';

export default function TeamDetailPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const { supervisorId } = useParams<{ supervisorId: string }>();
	const supervisor = useTeamStore(selectSupervisor(supervisorId ?? ''));
	const agents = useTeamStore(selectTeamAgents(supervisorId ?? ''));
	const campaignIds = useTeamStore(selectTeamCampaignIds(supervisorId ?? ''));
	const profiles = useTeamStore((s) => s.profiles);
	const removeMemberAction = useTeamStore((s) => s.removeMember);
	const setTeamCampaigns = useTeamStore((s) => s.setTeamCampaigns);

	const [assignCampaignsOpen, setAssignCampaignsOpen] = useState(false);
	const [addMembersOpen, setAddMembersOpen] = useState(false);
	const [editSupervisorOpen, setEditSupervisorOpen] = useState(false);

	const rows = useMemo(
		() =>
			agents
				.map((a) => toTableRow(profiles[a.id]))
				.filter((r): r is TeamTableRow => Boolean(r)),
		[agents, profiles]
	);
	const kpis = teamKpis(rows);

	const handleRemove = (agentId: string) => {
		const agent = profiles[agentId]?.agent;
		if (!agent) return;
		modals.openConfirmModal({
			title: t('teams.detail.removeMemberConfirmTitle'),
			children: (
				<Text size='sm'>
					{t('teams.detail.removeMemberConfirmBody', { name: agent.name })}
				</Text>
			),
			labels: {
				confirm: t('teams.detail.removeMember'),
				cancel: t('modals.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => removeMemberAction(agentId),
		});
	};

	const columns = useTeamDetailColumns(profiles, t, handleRemove);

	if (!supervisor) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: supervisorId })}
					action={
						<Button onClick={() => navigate(teamBasePath('qa-manager'))}>
							{t('teams.detail.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(teamBasePath('qa-manager'))}
		>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(teamBasePath('qa-manager'))}>
						{t('teams.list.title')}
					</Anchor>
					<Text c='dimmed'>{supervisor.team}</Text>
				</Breadcrumbs>

				<SectionCard padding='lg'>
					<Group justify='space-between' align='flex-start' wrap='wrap'>
						<Group gap='md'>
							<Avatar size={56} radius='md' name={supervisor.name} />
							<Stack gap={0}>
								<Title order={3}>{supervisor.team}</Title>
								<Text size='sm' c='dimmed'>
									{supervisor.name} · {supervisor.email}
								</Text>
							</Stack>
						</Group>
						<Button
							variant='light'
							leftSection={<IconEdit size={16} />}
							onClick={() => setEditSupervisorOpen(true)}
						>
							{t('teams.detail.editSupervisor')}
						</Button>
					</Group>
				</SectionCard>

				<TeamKpiStrip kpis={kpis} />

				<SectionCard
					title={t('teams.detail.membersTitle')}
					description={t('teams.detail.membersDescription')}
					headerActions={
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							onClick={() => setAddMembersOpen(true)}
						>
							{t('teams.detail.addMembers')}
						</Button>
					}
				>
					<BaseTable<TeamTableRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'overall', desc: true }]}
						density='compact'
						emptyMessage={t('teams.detail.emptyMembers')}
						onRowClick={(r) =>
							navigate(
								agentProfilePath('qa-manager', {
									id: r.id,
									supervisorId: supervisor.id,
								})
							)
						}
					/>
				</SectionCard>

				<SectionCard
					title={t('teams.detail.campaignsTitle')}
					description={t('teams.detail.campaignsDescription')}
					headerActions={
						<Button
							size='xs'
							variant='light'
							leftSection={<IconPlus size={14} />}
							onClick={() => setAssignCampaignsOpen(true)}
						>
							{t('teams.detail.assignCampaigns')}
						</Button>
					}
				>
					{campaignIds.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('teams.detail.emptyCampaigns')}
						</Text>
					) : (
						<Group gap='xs'>
							{campaignIds.map((id) => {
								const campaign = TEAM_CAMPAIGNS.find((c) => c.id === id);
								if (!campaign) return null;
								return (
									<Badge
										key={id}
										variant='light'
										size='lg'
										className={styles.campaignChip}
									>
										{campaign.name}
										<ActionIcon
											size='xs'
											variant='transparent'
											color='gray'
											aria-label={t('teams.detail.removeCampaign')}
											onClick={() =>
												setTeamCampaigns(
													supervisor.id,
													campaignIds.filter((c) => c !== id)
												)
											}
										>
											<IconX size={12} />
										</ActionIcon>
									</Badge>
								);
							})}
						</Group>
					)}
				</SectionCard>
			</Stack>

			<AssignCampaignsDrawer
				opened={assignCampaignsOpen}
				onClose={() => setAssignCampaignsOpen(false)}
				supervisorId={supervisor.id}
				teamName={supervisor.team}
				currentCampaignIds={campaignIds}
			/>
			<AddMembersDrawer
				opened={addMembersOpen}
				onClose={() => setAddMembersOpen(false)}
				supervisorId={supervisor.id}
				teamName={supervisor.team}
			/>
			<EditSupervisorModal
				opened={editSupervisorOpen}
				onClose={() => setEditSupervisorOpen(false)}
				supervisor={supervisor}
			/>
		</ContentContainer>
	);
}
