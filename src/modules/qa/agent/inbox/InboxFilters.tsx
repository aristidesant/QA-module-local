import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Button,
	Group,
	MultiSelect,
	Select,
	Switch,
	TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { AgentNotification } from '~/models/qa/notifications';
import type { InboxKind } from '~/modules/qa/inbox/constants';

type Priority = AgentNotification['priority'];

const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];

export interface InboxFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	unreadOnly: boolean;
	onUnreadOnlyChange: (value: boolean) => void;
	/** Kinds present in this inbox, in display order. */
	kindOptions: InboxKind[];
	kinds: InboxKind[];
	onKindsChange: (kinds: InboxKind[]) => void;
	priorities: Priority[];
	onPrioritiesChange: (priorities: Priority[]) => void;
	/** Managers only: the agents the items are about. Omitted or empty hides the control. */
	agentOptions?: { value: string; label: string }[];
	agent: string | null;
	onAgentChange: (agent: string | null) => void;
	range: [string | null, string | null];
	onRangeChange: (range: [string | null, string | null]) => void;
	hasActiveFilters: boolean;
	onClear: () => void;
}

/** Search and narrowing controls of the inbox, one wrapped row like the other QA lists. */
export const InboxFilters: React.FC<InboxFiltersProps> = ({
	search,
	onSearchChange,
	unreadOnly,
	onUnreadOnlyChange,
	kindOptions,
	kinds,
	onKindsChange,
	priorities,
	onPrioritiesChange,
	agentOptions,
	agent,
	onAgentChange,
	range,
	onRangeChange,
	hasActiveFilters,
	onClear,
}) => {
	const { t } = useTranslation('qa.inbox');

	return (
		<Group gap='sm' wrap='wrap' align='flex-end'>
			<TextInput
				size='sm'
				placeholder={t('filters.search')}
				aria-label={t('filters.search')}
				leftSection={<IconSearch size={16} />}
				value={search}
				onChange={(event) => onSearchChange(event.currentTarget.value)}
				rightSection={
					search && (
						<ActionIcon
							size='sm'
							color='gray'
							variant='transparent'
							aria-label={t('filters.clearSearch')}
							onClick={() => onSearchChange('')}
						>
							<IconX size={14} />
						</ActionIcon>
					)
				}
				w={260}
			/>

			<MultiSelect
				size='sm'
				placeholder={t('filters.kinds')}
				aria-label={t('filters.kinds')}
				data={kindOptions.map((kind) => ({
					value: kind,
					label: t(`kinds.${kind}`),
				}))}
				value={kinds}
				onChange={(value) => onKindsChange(value as InboxKind[])}
				clearable
				w={200}
			/>

			<MultiSelect
				size='sm'
				placeholder={t('filters.priority')}
				aria-label={t('filters.priority')}
				data={PRIORITIES.map((priority) => ({
					value: priority,
					label: t(`priorities.${priority}`),
				}))}
				value={priorities}
				onChange={(value) => onPrioritiesChange(value as Priority[])}
				clearable
				w={170}
			/>

			{agentOptions && agentOptions.length > 0 && (
				<Select
					size='sm'
					placeholder={t('filters.allAgents')}
					aria-label={t('filters.agent')}
					data={agentOptions}
					value={agent}
					onChange={onAgentChange}
					clearable
					searchable
					w={190}
				/>
			)}

			<DatePickerInput
				type='range'
				size='sm'
				placeholder={t('filters.dateRange')}
				aria-label={t('filters.dateRange')}
				value={range}
				onChange={(value) =>
					onRangeChange(value as [string | null, string | null])
				}
				clearable
				w={250}
			/>

			<Switch
				size='sm'
				label={t('filters.unreadOnly')}
				checked={unreadOnly}
				onChange={(event) => onUnreadOnlyChange(event.currentTarget.checked)}
			/>

			{hasActiveFilters && (
				<Button
					size='sm'
					variant='subtle'
					leftSection={<IconX size={16} />}
					onClick={onClear}
				>
					{t('filters.clear')}
				</Button>
			)}
		</Group>
	);
};

export default InboxFilters;
