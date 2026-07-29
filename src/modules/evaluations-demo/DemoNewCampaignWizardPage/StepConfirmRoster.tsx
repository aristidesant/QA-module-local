import React, { useMemo } from 'react';
import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import EmptyState from '~/components/EmptyState';
import type { DemoWizardUploadedFile } from './types';
import styles from './DemoNewCampaignWizardPage.module.css';

const REGISTERED_AGENTS: Record<string, string> = {
	'John Smith': 'john.smith@company.com',
	'Sarah Johnson': 'sarah.johnson@company.com',
	'Mike Chen': 'mike.chen@company.com',
};

interface RosterRow {
	agentId: string;
	agentName: string;
	email: string;
	registered: boolean;
}

interface StepConfirmRosterProps {
	files: DemoWizardUploadedFile[];
	emailOverrides: Record<string, string>;
	onEmailOverrideChange: (agentName: string, email: string) => void;
	onBack: () => void;
	onCreate: () => void;
	onExit: () => void;
}

const StepConfirmRoster: React.FC<StepConfirmRosterProps> = ({
	files,
	emailOverrides,
	onEmailOverrideChange,
	onBack,
	onCreate,
	onExit,
}) => {
	const roster = useMemo<RosterRow[]>(() => {
		const uniqueNames = Array.from(new Set(files.map((f) => f.agentName)));
		return uniqueNames.map((agentName, index) => ({
			agentId: `AGT-${String(index + 1).padStart(3, '0')}`,
			agentName,
			email: REGISTERED_AGENTS[agentName] ?? emailOverrides[agentName] ?? '',
			registered: agentName in REGISTERED_AGENTS,
		}));
	}, [files, emailOverrides]);

	const registeredCount = roster.filter((r) => r.registered).length;

	const columns: BaseTableColumnDef<RosterRow>[] = [
		{
			accessorKey: 'agentId',
			header: 'Agent ID',
			cell: ({ row }) => <Text size='sm' fw={600}>{row.original.agentId}</Text>,
			size: 140,
		},
		{
			id: 'agentName',
			header: 'Agent',
			cell: ({ row }) => <Text size='sm'>{row.original.agentName}</Text>,
		},
		{
			accessorKey: 'email',
			header: 'Email',
			cell: ({ row }) =>
				row.original.registered ? (
					<Text size='sm' c='dimmed'>
						{row.original.email}
					</Text>
				) : (
					<TextInput
						size='xs'
						placeholder='Enter email to invite'
						value={row.original.email}
						onChange={(e) =>
							onEmailOverrideChange(row.original.agentName, e.currentTarget.value)
						}
					/>
				),
		},
		{
			accessorKey: 'registered',
			header: 'Registered',
			cell: ({ row }) => (
				<Badge
					color={row.original.registered ? 'green' : 'gray'}
					variant='light'
					size='sm'
				>
					{row.original.registered ? 'Registered' : 'Not Registered'}
				</Badge>
			),
			size: 140,
		},
	];

	return (
		<Stack gap='md'>
			<Group gap='sm' align='flex-start' wrap='nowrap'>
				<ActionIcon
					variant='subtle'
					color='green'
					mt={4}
					aria-label='Exit wizard'
					onClick={onExit}
				>
					<IconArrowLeft size={18} />
				</ActionIcon>
				<div>
					<Text fw={700} size='lg'>
						Confirm Roster
					</Text>
					<Text size='sm' c='dimmed'>
						Review the agents detected across your uploaded calls
					</Text>
				</div>
			</Group>

			<div className={styles.stepCard}>
				{roster.length === 0 ? (
					<EmptyState message='No agents detected — upload call files to build a roster, or continue without one.' />
				) : (
					<Stack gap='md'>
						<Group justify='space-between'>
							<Text size='sm' c='dimmed'>
								{registeredCount} of {roster.length} agents already registered
							</Text>
						</Group>

						{registeredCount < roster.length && (
							<Alert
								color='blue'
								variant='light'
								icon={<IconInfoCircle size={16} />}
							>
								Unregistered agents will receive an invite email once the
								campaign is created.
							</Alert>
						)}

						<BaseTable
							data={roster}
							columns={columns}
							getRowId={(r) => r.agentId}
							density='compact'
							filterMode='client'
						/>
					</Stack>
				)}
			</div>

			<Group justify='flex-end' className={styles.footerRow}>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Button color='green' onClick={onCreate}>
					Create Campaign
				</Button>
			</Group>
		</Stack>
	);
};

export default StepConfirmRoster;
