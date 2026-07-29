import { ActionIcon, Badge, Group, Menu, Text } from '@mantine/core';
import { IconDots, IconPencil, IconCopy, IconTrash } from '@tabler/icons-react';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import type { DemoQaForm } from './mockQaForms';

const STATUS_COLORS: Record<DemoQaForm['status'], string> = {
	Ready: 'green',
	Draft: 'yellow',
};

export const useDemoQaFormsColumns = (): BaseTableColumnDef<DemoQaForm>[] => [
	{
		accessorKey: 'testName',
		header: 'Test Name',
		cell: ({ row }) => (
			<Text size='sm' fw={600}>
				{row.original.testName}
			</Text>
		),
	},
	{
		accessorKey: 'qaType',
		header: 'QA Type',
		cell: ({ row }) => (
			<Badge color='gray' variant='light' size='sm'>
				{row.original.qaType}
			</Badge>
		),
		size: 180,
	},
	{
		accessorKey: 'createdDate',
		header: 'Created Date',
		cell: ({ row }) => (
			<Text size='sm' c='dimmed'>
				{row.original.createdDate}
			</Text>
		),
		size: 140,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge color={STATUS_COLORS[row.original.status]} variant='light' size='sm'>
				{row.original.status}
			</Badge>
		),
		size: 110,
	},
	{
		accessorKey: 'createdBy',
		header: 'Created By',
		cell: ({ row }) => <Text size='sm'>{row.original.createdBy}</Text>,
		size: 160,
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: () => (
			<Group gap='xs' justify='flex-end' wrap='nowrap'>
				<ActionIcon variant='light' color='green' size='sm' aria-label='Edit test'>
					<IconPencil size={16} />
				</ActionIcon>
				<Menu position='bottom-end' withinPortal>
					<Menu.Target>
						<ActionIcon variant='subtle' color='gray' size='sm' aria-label='More actions'>
							<IconDots size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item leftSection={<IconCopy size={14} />}>Duplicate</Menu.Item>
						<Menu.Item leftSection={<IconTrash size={14} />} color='red'>
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		),
		size: 100,
	},
];
