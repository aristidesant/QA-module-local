import React from 'react';
import {
	Button,
	Group,
	MultiSelect,
	NumberInput,
	Select,
	Stack,
	Text,
	Input,
} from '@mantine/core';
import { IconX, IconSearch } from '@tabler/icons-react';

export interface EvaluationFilters {
	campaigns: string[];
	startDate: Date | null;
	endDate: Date | null;
	scoreMin: number;
	scoreMax: number;
	dispute: 'all' | 'yes' | 'no';
}

interface EvaluationFiltersBarProps {
	filters: EvaluationFilters;
	onFiltersChange: (filters: EvaluationFilters) => void;
	campaigns: string[];
	onSearch?: () => void;
}

const EvaluationFiltersBar: React.FC<EvaluationFiltersBarProps> = ({
	filters,
	onFiltersChange,
	campaigns,
	onSearch,
}) => {
	const hasActiveFilters =
		filters.campaigns.length > 0 ||
		filters.startDate !== null ||
		filters.endDate !== null ||
		filters.scoreMin > 0 ||
		filters.scoreMax < 100 ||
		filters.dispute !== 'all';

	const handleReset = () => {
		onFiltersChange({
			campaigns: [],
			startDate: null,
			endDate: null,
			scoreMin: 0,
			scoreMax: 100,
			dispute: 'all',
		});
	};

	return (
		<Stack
			gap='md'
			p='md'
			style={{
				border: '1px solid var(--mantine-color-gray-3)',
				borderRadius: 'var(--mantine-radius-md)',
				backgroundColor: '#ffffff',
			}}
		>
			<Group justify='space-between' align='center'>
				<Text fw={600}>Filters</Text>
				{hasActiveFilters && (
					<Button
						variant='subtle'
						size='xs'
						leftSection={<IconX size={14} />}
						onClick={handleReset}
					>
						Clear filters
					</Button>
				)}
			</Group>

			<Group grow align='flex-end'>
				<MultiSelect
					label='Campaign'
					placeholder='Select campaigns'
					data={campaigns}
					value={filters.campaigns}
					onChange={(value) =>
						onFiltersChange({ ...filters, campaigns: value })
					}
					searchable
					clearable
				/>

				<Input
					type='date'
					value={
						filters.startDate
							? filters.startDate.toISOString().split('T')[0]
							: ''
					}
					onChange={(e) => {
						const dateStr = e.currentTarget.value;
						onFiltersChange({
							...filters,
							startDate: dateStr ? new Date(dateStr) : null,
						});
					}}
					placeholder='Start Date'
				/>

				<Input
					type='date'
					value={
						filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''
					}
					onChange={(e) => {
						const dateStr = e.currentTarget.value;
						onFiltersChange({
							...filters,
							endDate: dateStr ? new Date(dateStr) : null,
						});
					}}
				/>

				<NumberInput
					label='Min Score'
					placeholder='0'
					min={0}
					max={100}
					value={filters.scoreMin}
					onChange={(value) =>
						onFiltersChange({
							...filters,
							scoreMin: Number(value) || 0,
						})
					}
				/>
				<NumberInput
					label='Max Score'
					placeholder='100'
					min={0}
					max={100}
					value={filters.scoreMax}
					onChange={(value) =>
						onFiltersChange({
							...filters,
							scoreMax: Number(value) || 100,
						})
					}
				/>
			</Group>

			<Select
				label='Dispute Status'
				data={[
					{ value: 'all', label: 'All' },
					{ value: 'yes', label: 'Disputed Only' },
					{ value: 'no', label: 'Not Disputed' },
				]}
				value={filters.dispute}
				onChange={(value) =>
					onFiltersChange({ ...filters, dispute: (value as any) || 'all' })
				}
				w={300}
			/>

			<Group justify='flex-end'>
				<Button
					w={250}
					leftSection={<IconSearch size={16} />}
					onClick={onSearch}
				>
					Search
				</Button>
			</Group>
		</Stack>
	);
};

export default EvaluationFiltersBar;
