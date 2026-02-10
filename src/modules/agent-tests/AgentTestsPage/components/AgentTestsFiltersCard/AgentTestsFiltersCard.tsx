import { Button, Group, Select, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard/SectionCard';
import { useAgentTestsPage } from '../../context/AgentTestsPageContext';
import styles from '../../AgentTestsPage.module.css';

interface AgentTestsFiltersCardProps {
	agentOptions: Array<{ value: string; label: string }>;
	isLoadingAgents: boolean;
}

const AgentTestsFiltersCard = ({
	agentOptions,
	isLoadingAgents,
}: AgentTestsFiltersCardProps) => {
	const { t } = useTranslation('agent-tests');
	const { search, setSearch, agentId, setAgentId, setPage, clearFilters } =
		useAgentTestsPage();

	return (
		<SectionCard
			title={t('filters.title')}
			description={t('filters.description')}
			padding='md'
		>
			<Group gap='xs' align='end' wrap='wrap'>
				<TextInput
					label={t('filters.searchLabel')}
					placeholder={t('filters.searchPlaceholder')}
					value={search}
					onChange={(event) => {
						setSearch(event.currentTarget.value);
						setPage(1);
					}}
					size='sm'
					className={styles.filterField}
				/>
				<Select
					label={t('filters.agentLabel')}
					placeholder={t('filters.agentPlaceholder')}
					data={agentOptions}
					value={agentId}
					onChange={(value) => {
						setAgentId(value);
						setPage(1);
					}}
					searchable
					clearable
					size='sm'
					className={styles.filterField}
					disabled={isLoadingAgents}
				/>
				<Button variant='light' size='sm' onClick={clearFilters}>
					{t('actions.clearFilters')}
				</Button>
			</Group>
		</SectionCard>
	);
};

export default AgentTestsFiltersCard;
