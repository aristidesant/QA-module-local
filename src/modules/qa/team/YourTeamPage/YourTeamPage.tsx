import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import { useTeamStore } from '~/stores/qa/teamStore';
import { SUPERVISOR_PERSONA } from '../constants';
import type { TeamFilters as TeamFiltersState, TeamTableRow } from '../types';
import { applyTeamFilters, isAtRisk, roleFromPath, teamBasePath, teamKpis, toTableRow } from '../helpers';
import { TeamKpiStrip } from './TeamKpiStrip';
import { TeamFilters } from './TeamFilters';
import { useTeamColumns } from './useTeamColumns';
import styles from './YourTeamPage.module.css';

const DEFAULT_FILTERS: TeamFiltersState = { search: '', status: 'all', campaignId: 'all', supervisorId: 'all', riskOnly: false };

export default function YourTeamPage() {
	const { t } = useTranslation('qa.team');
	const navigate = useNavigate();
	const location = useLocation();
	const role = roleFromPath(location.pathname);
	const profilesById = useTeamStore((s) => s.profiles);
	const [filters, setFilters] = useState<TeamFiltersState>(DEFAULT_FILTERS);

	const rows = useMemo(() => {
		const visible = Object.values(profilesById).filter(
			(p) => role === 'qa-manager' || p.agent.supervisorId === SUPERVISOR_PERSONA.id,
		);
		return applyTeamFilters(visible.map(toTableRow), profilesById, filters);
	}, [profilesById, role, filters]);
	const columns = useTeamColumns(role, profilesById, t);

	return (
		<ContentContainer
			contentWidth='full'
			title={t(role === 'qa-manager' ? 'team.titleQaManager' : 'team.title')}
			description={t(role === 'qa-manager' ? 'team.descriptionQaManager' : 'team.description')}
		>
			<Stack gap='lg'>
				<TeamKpiStrip kpis={teamKpis(rows)} />
				<TeamFilters role={role} value={filters} onChange={setFilters} />
				<SectionCard
					headerActions={<Text size='sm' c='dimmed'>{t('team.rowsCount', { count: rows.length })}</Text>}
				>
					<BaseTable<TeamTableRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'overall', desc: true }]}
						enablePagination
						pageSize={10}
						density='compact'
						emptyMessage={t('team.empty')}
						onRowClick={(r) => navigate(`${teamBasePath(role)}/${r.id}`)}
						getRowClassName={(row) => (isAtRisk(row.original) ? styles.riskRow : undefined)}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
