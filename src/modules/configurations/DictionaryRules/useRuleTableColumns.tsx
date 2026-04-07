import { useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
	IconEdit,
	IconPlayerPlay,
	IconPlayerStop,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { PronunciationRule } from '~/models/PronunciationDictionaryModel';

interface UseRuleTableColumnsProps {
	onEdit: (rule: PronunciationRule) => void;
	onDelete: (rule: PronunciationRule) => void;
	onSpeak?: (
		text: string,
		locale?: string | null,
		id?: string | number
	) => void;
	onStop?: () => void;
	speakingId?: string | number | null;
	isTtsSupported?: boolean;
}

export function useRuleTableColumns({
	onEdit,
	onDelete,
	onSpeak,
	onStop,
	speakingId,
	isTtsSupported,
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
				accessorKey: 'category',
				header: t('columns.category'),
				cell: ({ row }) => {
					const categoryColorMap: Record<string, string> = {
						CITY: 'teal',
						PROVINCE: 'cyan',
						NAME: 'grape',
						LAST_NAME: 'indigo',
						GENERAL: 'gray',
					};
					const category = row.original.category ?? 'GENERAL';
					return (
						<Badge
							variant='light'
							color={categoryColorMap[category] ?? 'gray'}
							radius='sm'
							size='sm'
						>
							{t(`categories.${category}`)}
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
				cell: ({ row }) => {
					const rule = row.original;
					const isPlaying = speakingId === rule.id;
					const isAlias = rule.ruleType === 'ALIAS';
					const textToSpeak = isAlias
						? (rule.alias ?? rule.grapheme)
						: rule.grapheme;
					const tooltipLabel = isPlaying
						? t('preview.stop')
						: isAlias
							? t('preview.playAlias')
							: t('preview.phonemeFallback');

					return (
						<Group gap='xs'>
							{isTtsSupported && onSpeak && onStop && (
								<Tooltip
									label={tooltipLabel}
									multiline
									w={isAlias ? undefined : 200}
								>
									<ActionIcon
										variant='light'
										color={isPlaying ? 'orange' : 'teal'}
										radius='md'
										size='sm'
										onClick={() =>
											isPlaying
												? onStop()
												: onSpeak(textToSpeak, rule.locale, rule.id)
										}
									>
										{isPlaying ? (
											<IconPlayerStop size={16} />
										) : (
											<IconPlayerPlay size={16} />
										)}
									</ActionIcon>
								</Tooltip>
							)}
							<Tooltip label={t('form.buttons.update')}>
								<ActionIcon
									variant='light'
									color='blue'
									radius='md'
									size='sm'
									onClick={() => onEdit(rule)}
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
									onClick={() => onDelete(rule)}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Tooltip>
						</Group>
					);
				},
			},
		],
		[onEdit, onDelete, onSpeak, onStop, speakingId, isTtsSupported, t]
	);
}
