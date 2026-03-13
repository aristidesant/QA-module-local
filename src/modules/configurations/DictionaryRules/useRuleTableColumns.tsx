import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PronunciationRule } from '~/models/PronunciationDictionaryModel';

interface UseRuleTableColumnsProps {
	onEdit: (rule: PronunciationRule) => void;
	onDelete: (rule: PronunciationRule) => void;
}

export function useRuleTableColumns({
	onEdit,
	onDelete,
}: UseRuleTableColumnsProps) {
	const { t } = useTranslation('dictionary-rules');

	return useMemo<ColumnDef<PronunciationRule>[]>(
		() => [
			{
				accessorKey: 'grapheme',
				header: t('columns.grapheme'),
				cell: ({ row }) => (
					<Text size='sm' fw={600} c='dark.8'>
						{row.original.grapheme}
					</Text>
				),
			},
			{
				accessorKey: 'ruleType',
				header: t('columns.ruleType'),
				cell: ({ row }) => {
					const isAlias = row.original.ruleType === 'ALIAS';
					return (
						<Badge
							variant='light'
							color={isAlias ? 'blue' : 'violet'}
							radius='sm'
							size='sm'
						>
							{isAlias
								? t('form.fields.ruleType.alias')
								: t('form.fields.ruleType.phoneme')}
						</Badge>
					);
				},
			},
			{
				id: 'pronunciation',
				header: t('columns.pronunciation'),
				cell: ({ row }) => {
					const { ruleType, alias, phoneme } = row.original;
					return (
						<Text size='sm' c='dark.6' ff='monospace'>
							{ruleType === 'ALIAS' ? alias : phoneme}
						</Text>
					);
				},
			},
			{
				accessorKey: 'locale',
				header: t('columns.locale'),
				cell: ({ row }) =>
					row.original.locale ? (
						<Badge variant='outline' color='gray' radius='sm' size='sm'>
							{row.original.locale}
						</Badge>
					) : (
						<Text size='xs' c='dimmed'>
							—
						</Text>
					),
			},
			{
				accessorKey: 'description',
				header: t('columns.description'),
				cell: ({ row }) => (
					<Stack gap={0}>
						<Text size='xs' c='dimmed' lineClamp={2}>
							{row.original.description || '—'}
						</Text>
					</Stack>
				),
			},
			{
				id: 'actions',
				header: t('columns.actions'),
				cell: ({ row }) => (
					<Group gap='xs'>
						<Tooltip label={t('form.buttons.update')}>
							<ActionIcon
								variant='light'
								color='blue'
								radius='md'
								size='sm'
								onClick={() => onEdit(row.original)}
							>
								<IconEdit size={16} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label={t('rules.deleteModal.confirm')}>
							<ActionIcon
								variant='light'
								color='red'
								radius='md'
								size='sm'
								onClick={() => onDelete(row.original)}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Tooltip>
					</Group>
				),
			},
		],
		[onEdit, onDelete, t]
	);
}
