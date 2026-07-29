import React from 'react';
import {
	Button,
	Checkbox,
	Group,
	MultiSelect,
	NumberInput,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';

export interface EvaluationFilters {
	campaigns: string[];
	period: 'weekly' | 'monthly' | 'custom';
	scoreMin: number;
	scoreMax: number;
	dispute: 'all' | 'yes' | 'no';
	result: 'all' | 'passed' | 'failed';
	evaluationTypes: string[];
}

interface EvaluationFiltersBarProps {
	filters: EvaluationFilters;
	onFiltersChange: (filters: EvaluationFilters) => void;
	campaigns: string[];
}

const EVALUATION_TYPES = ['Compliance', 'Sentiment Analysis', 'QA'];

const EvaluationFiltersBar: React.FC<EvaluationFiltersBarProps> = ({
	filters,
	onFiltersChange,
	campaigns,
}) => {
	const hasActiveFilters =
		filters.campaigns.length > 0 ||
		filters.period !== 'weekly' ||
		filters.scoreMin > 0 ||
		filters.scoreMax < 100 ||
		filters.dispute !== 'all' ||
		filters.result !== 'all' ||
		filters.evaluationTypes.length > 0;

	const handleReset = () => {
		onFiltersChange({
			campaigns: [],
			period: 'weekly',
			scoreMin: 0,
			scoreMax: 100,
			dispute: 'all',
			result: 'all',
			evaluationTypes: [],
		});
	};

	return (
		{/* inline-style-allow: */}
		<Stack gap='md' p='md' style={{
			border: '1px solid var(--mantine-color-gray-3)',
			borderRadius: 'var(--mantine-radius-md)',
			backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
		}}>
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

			<Select
				label='Period'
				data={[
					{ value: 'weekly', label: 'Weekly' },
					{ value: 'monthly', label: 'Monthly' },
					{ value: 'custom', label: 'Custom' },
				]}
				value={filters.period}
				onChange={(value) =>
					onFiltersChange({
						...filters,
						period: (value as any) || 'weekly',
					})
				}
			/>

			<Group grow>
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
			/>

			<Select
				label='Result'
				data={[
					{ value: 'all', label: 'All Results' },
					{ value: 'passed', label: 'Passed' },
					{ value: 'failed', label: 'Failed' },
				]}
				value={filters.result}
				onChange={(value) =>
					onFiltersChange({ ...filters, result: (value as any) || 'all' })
				}
			/>

			<div>
				<Text size='sm' fw={600} mb='xs'>
					Evaluation Type
				</Text>
				<Stack gap='xs'>
					{EVALUATION_TYPES.map((type) => (
						<Checkbox
							key={type}
							label={type}
							checked={filters.evaluationTypes.includes(type)}
							onChange={(e) => {
								if (e.currentTarget.checked) {
									onFiltersChange({
										...filters,
										evaluationTypes: [
											...filters.evaluationTypes,
											type,
										],
									});
								} else {
									onFiltersChange({
										...filters,
										evaluationTypes:
											filters.evaluationTypes.filter(
												(t) => t !== type
											),
									});
								}
							}}
						/>
					))}
				</Stack>
			</div>
		</Stack>
	);
};

export default EvaluationFiltersBar;
