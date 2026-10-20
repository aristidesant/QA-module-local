import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Text } from '@mantine/core';
import { IconFileTypeDoc } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import {
	selectProtocolDocuments,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import type { ProtocolDocument } from '../types';

interface ProtocolDocumentsDrawerProps {
	opened: boolean;
	onClose: () => void;
}

/** Versioned Word protocols attached to a line of business (read-only in the mock). */
export const ProtocolDocumentsDrawer: React.FC<
	ProtocolDocumentsDrawerProps
> = ({ opened, onClose }) => {
	const { t } = useTranslation('qa.globalConfig');
	const documents = useGlobalConfigStore(selectProtocolDocuments);
	const date = useDateFormatter();

	const columns: BaseTableColumnDef<ProtocolDocument>[] = [
		{
			accessorKey: 'name',
			header: t('contextRules.docs.columns.document'),
			cell: ({ row }) => (
				<Group gap='xs' wrap='nowrap'>
					<IconFileTypeDoc size={16} stroke={1.5} />
					<Text size='sm' fw={500}>
						{row.original.name}
					</Text>
				</Group>
			),
		},
		{
			accessorKey: 'lineOfBusiness',
			header: t('contextRules.docs.columns.lineOfBusiness'),
			size: 150,
			cell: ({ row }) => (
				<Badge variant='light' color='gray' size='sm' tt='none' ff='monospace'>
					{row.original.lineOfBusiness}
				</Badge>
			),
		},
		{
			accessorKey: 'version',
			header: t('contextRules.docs.columns.version'),
			size: 90,
			cell: ({ row }) => <Text size='sm'>v{row.original.version}</Text>,
		},
		{
			accessorKey: 'uploadedAt',
			header: t('contextRules.docs.columns.uploaded'),
			size: 130,
			cell: ({ row }) => (
				<Text size='sm' c='dimmed'>
					{date.format(new Date(row.original.uploadedAt))}
				</Text>
			),
		},
	];

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			icon={<IconFileTypeDoc size={20} />}
			title={t('contextRules.docs.title')}
			description={t('contextRules.docs.description')}
		>
			<Stack gap='md'>
				<BaseTable<ProtocolDocument>
					data={documents}
					columns={columns}
					getRowId={(doc) => doc.id}
					density='compact'
				/>
			</Stack>
		</AppDrawer>
	);
};

export default ProtocolDocumentsDrawer;
