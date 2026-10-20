import React from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Button,
	Group,
	Select,
	Text,
	TextInput,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { AgentStatus, Shift } from '../../types';

export interface MemberFilters {
	search: string;
	shift: Shift | 'all';
	status: AgentStatus | 'all';
}

export const DEFAULT_MEMBER_FILTERS: MemberFilters = {
	search: '',
	shift: 'all',
	status: 'all',
};

interface MembersToolbarProps {
	value: MemberFilters;
	onChange: (value: MemberFilters) => void;
	shown: number;
	total: number;
}

/** Search plus Shift and Status filters for the members table. */
export const MembersToolbar: React.FC<MembersToolbarProps> = ({
	value,
	onChange,
	shown,
	total,
}) => {
	const { t } = useTranslation('qa.team');

	const isDefault =
		value.search === DEFAULT_MEMBER_FILTERS.search &&
		value.shift === DEFAULT_MEMBER_FILTERS.shift &&
		value.status === DEFAULT_MEMBER_FILTERS.status;

	const all = { value: 'all', label: t('teamConfig.members.all') };

	return (
		<Group justify='space-between' align='center' wrap='wrap' gap='sm'>
			<Group gap='sm' wrap='wrap'>
				<TextInput
					size='sm'
					w={280}
					placeholder={t('teamConfig.members.search')}
					aria-label={t('teamConfig.members.search')}
					leftSection={<IconSearch size={16} />}
					value={value.search}
					onChange={(event) =>
						onChange({ ...value, search: event.currentTarget.value })
					}
					rightSection={
						value.search && (
							<ActionIcon
								size='sm'
								color='gray'
								variant='transparent'
								aria-label={t('teamConfig.clearSearch')}
								onClick={() => onChange({ ...value, search: '' })}
							>
								<IconX size={14} />
							</ActionIcon>
						)
					}
				/>
				<Select
					size='sm'
					w={150}
					allowDeselect={false}
					aria-label={t('teamConfig.members.shift')}
					placeholder={t('teamConfig.members.shift')}
					value={value.shift}
					onChange={(v) =>
						onChange({ ...value, shift: (v as Shift | 'all') ?? 'all' })
					}
					data={[
						all,
						{ value: 'morning', label: t('shift.morning') },
						{ value: 'afternoon', label: t('shift.afternoon') },
						{ value: 'night', label: t('shift.night') },
					]}
				/>
				<Select
					size='sm'
					w={150}
					allowDeselect={false}
					aria-label={t('teamConfig.members.status')}
					placeholder={t('teamConfig.members.status')}
					value={value.status}
					onChange={(v) =>
						onChange({ ...value, status: (v as AgentStatus | 'all') ?? 'all' })
					}
					data={[
						all,
						{ value: 'active', label: t('status.active') },
						{ value: 'on-leave', label: t('status.on-leave') },
						{ value: 'training', label: t('status.training') },
					]}
				/>
				{!isDefault && (
					<Button
						variant='subtle'
						size='xs'
						onClick={() => onChange(DEFAULT_MEMBER_FILTERS)}
					>
						{t('teamConfig.members.clear')}
					</Button>
				)}
			</Group>
			<Text size='sm' c='dimmed'>
				{shown === total
					? t('teamConfig.members.count', { count: total })
					: t('teamConfig.members.filteredCount', { count: shown, total })}
			</Text>
		</Group>
	);
};

export default MembersToolbar;
