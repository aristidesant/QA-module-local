import React, { useState } from 'react';
import {
	Stack,
	Group,
	TextInput,
	MultiSelect,
	Checkbox,
	Button,
	Collapse,
	ActionIcon,
	Badge,
} from '@mantine/core';
import { IconSearch, IconChevronDown } from '@tabler/icons-react';

export interface AgentFilters {
	search: string;
	supervisors: string[];
	teams: string[];
	statuses: string[];
	types: string[];
	dateRange?: { start?: Date; end?: Date };
}

interface AgentFilterPanelProps {
	filters: AgentFilters;
	onFiltersChange: (filters: AgentFilters) => void;
	supervisorOptions: { value: string; label: string }[];
	teamOptions: { value: string; label: string }[];
	isLoading?: boolean;
}

const AgentFilterPanel: React.FC<AgentFilterPanelProps> = ({
	filters,
	onFiltersChange,
	supervisorOptions,
	teamOptions,
	isLoading = false,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const activeFilterCount = [
		filters.supervisors.length > 0 ? 1 : 0,
		filters.teams.length > 0 ? 1 : 0,
		filters.statuses.length > 0 ? 1 : 0,
		filters.types.length > 0 ? 1 : 0,
	].reduce((a, b) => a + b, 0);

	const handleClearFilters = () => {
		onFiltersChange({
			search: filters.search,
			supervisors: [],
			teams: [],
			statuses: [],
			types: [],
			dateRange: undefined,
		});
	};

	return (
		<Stack gap='md'>
			{/* Main search bar */}
			<TextInput
				placeholder='Search by agent ID, name, or email...'
				leftSection={<IconSearch size={16} />}
				value={filters.search}
				onChange={(e) =>
					onFiltersChange({
						...filters,
						search: e.currentTarget.value,
					})
				}
				disabled={isLoading}
			/>

			{/* Expandable filters section */}
			<Group gap='xs'>
				<ActionIcon
					onClick={() => setIsExpanded(!isExpanded)}
					variant='subtle'
					size='lg'
				>
					<IconChevronDown
						size={16}
						// inline-style-allow: rotation animation for filter toggle
						style={{
							transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
							transition: 'transform 200ms ease',
						}}
					/>
				</ActionIcon>
				{/* inline-style-allow: label styling for filter header */}
				<span style={{ fontSize: '14px', fontWeight: 500 }}>
					Advanced Filters
				</span>
				{activeFilterCount > 0 && (
					<Badge size='sm' variant='filled'>
						{activeFilterCount}
					</Badge>
				)}
			</Group>

			<Collapse expanded={isExpanded}>
				<Stack gap='md' pl='lg'>
					{/* Supervisor Filter */}
					<MultiSelect
						label='Supervisor'
						placeholder='Select supervisors...'
						data={supervisorOptions}
						value={filters.supervisors}
						onChange={(value) =>
							onFiltersChange({
								...filters,
								supervisors: value,
							})
						}
						searchable
						clearable
						disabled={isLoading}
					/>

					{/* Team Filter */}
					<MultiSelect
						label='Team'
						placeholder='Select teams...'
						data={teamOptions}
						value={filters.teams}
						onChange={(value) =>
							onFiltersChange({
								...filters,
								teams: value,
							})
						}
						searchable
						clearable
						disabled={isLoading}
					/>

					{/* Status Filter */}
					<div>
						{/* inline-style-allow: label styling */}
						<label
							style={{
								display: 'block',
								fontSize: '14px',
								fontWeight: 500,
								marginBottom: '8px',
							}}
						>
							Status
						</label>
						<Group gap='lg'>
							<Checkbox
								label='Active'
								checked={filters.statuses.includes('active')}
								onChange={(e) => {
									const newStatuses = e.currentTarget.checked
										? [...filters.statuses, 'active']
										: filters.statuses.filter((s) => s !== 'active');
									onFiltersChange({
										...filters,
										statuses: newStatuses,
									});
								}}
								disabled={isLoading}
							/>
							<Checkbox
								label='Pending'
								checked={filters.statuses.includes('pending')}
								onChange={(e) => {
									const newStatuses = e.currentTarget.checked
										? [...filters.statuses, 'pending']
										: filters.statuses.filter((s) => s !== 'pending');
									onFiltersChange({
										...filters,
										statuses: newStatuses,
									});
								}}
								disabled={isLoading}
							/>
						</Group>
					</div>

					{/* Agent Type Filter */}
					<div>
						{/* inline-style-allow: label styling */}
						<label
							style={{
								display: 'block',
								fontSize: '14px',
								fontWeight: 500,
								marginBottom: '8px',
							}}
						>
							Agent Type
						</label>
						<Group gap='lg'>
							<Checkbox
								label='Human'
								checked={filters.types.includes('HUMAN')}
								onChange={(e) => {
									const newTypes = e.currentTarget.checked
										? [...filters.types, 'HUMAN']
										: filters.types.filter((t) => t !== 'HUMAN');
									onFiltersChange({
										...filters,
										types: newTypes,
									});
								}}
								disabled={isLoading}
							/>
							<Checkbox
								label='AI Bot'
								checked={filters.types.includes('AI_BOT')}
								onChange={(e) => {
									const newTypes = e.currentTarget.checked
										? [...filters.types, 'AI_BOT']
										: filters.types.filter((t) => t !== 'AI_BOT');
									onFiltersChange({
										...filters,
										types: newTypes,
									});
								}}
								disabled={isLoading}
							/>
						</Group>
					</div>

					{/* Clear Filters Button */}
					{activeFilterCount > 0 && (
						<Button
							variant='default'
							size='sm'
							onClick={handleClearFilters}
							disabled={isLoading}
						>
							Clear Filters
						</Button>
					)}
				</Stack>
			</Collapse>
		</Stack>
	);
};

export default AgentFilterPanel;
