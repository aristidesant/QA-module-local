import { Alert, Anchor, Select, Stack, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router';

import { useAgentQuery, useAgentsQuery } from '~/queries/qa/agentsQueries';
import {
	getAgentSelectLabel,
	isAutoMigratedAgent,
} from '~/modules/qa/utils/agent';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './AgentSelect.module.css';
import type { AgentSelectProps } from './AgentSelect.types';

export default function AgentSelect({
	error,
	label,
	onChange,
	onValidityChange,
	placeholder,
	value,
}: AgentSelectProps) {
	const { t } = useTranslation('qa.evaluations');
	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebouncedValue(search, 300);
	const selectedAgentId = value ? Number(value) : NaN;
	const selectedAgentQuery = useAgentQuery(selectedAgentId);
	const agentsQuery = useAgentsQuery({
		limit: 20,
		offset: 0,
		q: debouncedSearch,
		sortBy: 'firstName',
		orderBy: 'ASC',
	});
	const options = useMemo(() => {
		const agents = [...(agentsQuery.data?.data ?? [])];
		const selectedAgent = selectedAgentQuery.data;

		if (
			selectedAgent &&
			!agents.some((agent) => agent.id === selectedAgent.id)
		) {
			agents.unshift(selectedAgent);
		}

		return agents
			.filter((agent) => !isAutoMigratedAgent(agent))
			.map((agent) => ({
				label: getAgentSelectLabel(agent),
				value: String(agent.id),
			}));
	}, [agentsQuery.data, selectedAgentQuery.data]);
	const isEmpty = !agentsQuery.isLoading && options.length === 0 && !search;

	useEffect(() => {
		if (!value) {
			onValidityChange(false);
			return;
		}

		if (
			selectedAgentQuery.isError ||
			(selectedAgentQuery.data && isAutoMigratedAgent(selectedAgentQuery.data))
		) {
			onValidityChange(false);
			onChange(null);
			return;
		}

		onValidityChange(Boolean(selectedAgentQuery.data));
	}, [
		onChange,
		onValidityChange,
		selectedAgentQuery.data,
		selectedAgentQuery.isError,
		value,
	]);

	return (
		<Stack gap='xs'>
			<Select
				className={classes.select}
				data={options}
				error={error}
				label={label}
				loading={agentsQuery.isLoading}
				nothingFoundMessage={t('manual.agentNothingFound')}
				onChange={(nextValue) => {
					onValidityChange(false);
					onChange(nextValue);
				}}
				onSearchChange={setSearch}
				placeholder={placeholder}
				searchable
				searchValue={search}
				size='sm'
				value={value}
			/>
			{agentsQuery.isError ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={16} />}
					variant='light'
				>
					{getErrorMessage(agentsQuery.error)}
				</Alert>
			) : null}
			{selectedAgentQuery.isError ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={16} />}
					variant='light'
				>
					{t('manual.invalidAgent')}
				</Alert>
			) : null}
			{isEmpty ? (
				<Text c='dimmed' size='sm'>
					{t('manual.noAgents')}{' '}
					<Anchor component={RouterLink} to='/agents'>
						{t('manual.manageAgents')}
					</Anchor>
				</Text>
			) : null}
		</Stack>
	);
}
