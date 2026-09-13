import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Stack, Text } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import BaseTable from '~/components/BaseTable/BaseTable';
import { useCustomersStore } from '~/stores/qa/customersStore';
import { customersBasePath, roleFromPath } from '~/modules/qa/team/helpers';
import type { CustomerFilters as CustomerFiltersState, CustomerTableRow } from '../types';
import { applyCustomerFilters, customerKpis, toCustomerRow, visibleForRole } from '../helpers';
import { CustomerKpiStrip } from './CustomerKpiStrip';
import { CustomerFilters } from './CustomerFilters';
import { useCustomerColumns } from './useCustomerColumns';
import styles from './CustomersPage.module.css';

const DEFAULT_FILTERS: CustomerFiltersState = { search: '', segment: 'all', status: 'all', receptiveness: 'all', churnRisk: 'all', agentId: 'all', dncOnly: false };

export default function CustomersPage() {
	const { t } = useTranslation('qa.customers');
	const navigate = useNavigate();
	const location = useLocation();
	const role = roleFromPath(location.pathname);
	const profiles = useCustomersStore((s) => s.profiles);
	const [filters, setFilters] = useState<CustomerFiltersState>(DEFAULT_FILTERS);

	const rows = useMemo(() => {
		const allRows = Object.values(profiles).map(toCustomerRow);
		return applyCustomerFilters(visibleForRole(allRows, role), profiles, filters);
	}, [profiles, role, filters]);
	const columns = useCustomerColumns(profiles, t);

	return (
		<ContentContainer
			contentWidth='full'
			title={t('list.title')}
			description={t(role === 'qa-manager' ? 'list.descriptionQaManager' : 'list.description')}
		>
			<Stack gap='lg'>
				<CustomerKpiStrip kpis={customerKpis(rows)} />
				<CustomerFilters role={role} value={filters} onChange={setFilters} />
				<SectionCard headerActions={<Text size='sm' c='dimmed'>{t('list.rowsCount', { count: rows.length })}</Text>}>
					<BaseTable<CustomerTableRow>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'lastContactAt', desc: true }]}
						enablePagination
						pageSize={10}
						density='compact'
						emptyMessage={t('list.empty')}
						onRowClick={(r) => navigate(`${customersBasePath(role)}/${r.id}`)}
						getRowClassName={(row) => (row.original.doNotCall ? styles.dncRow : undefined)}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
