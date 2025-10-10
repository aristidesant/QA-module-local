import { useMemo, type ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Text, ThemeIcon, HoverCard } from '@mantine/core';
import {
	IconFileText,
	IconWorld,
	IconApi,
	IconInfoCircle,
} from '@tabler/icons-react';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';
import styles from './AddKnowledgeBaseModal.module.css';

type TypeMeta = {
	label: string;
	color: string;
	icon: ReactNode;
};

const typeMeta: Record<KnowledgeBaseType, TypeMeta> = {
	[KnowledgeBaseType.FILE]: {
		label: 'File',
		color: 'blue',
		icon: <IconFileText size={16} />,
	},
	[KnowledgeBaseType.URL]: {
		label: 'URL',
		color: 'teal',
		icon: <IconWorld size={16} />,
	},
	[KnowledgeBaseType.TEXT]: {
		label: 'Custom Text',
		color: 'violet',
		icon: <IconApi size={16} />,
	},
};

const resolvedTypeMeta = (type: KnowledgeBaseType): TypeMeta =>
	typeMeta[type] ?? typeMeta[KnowledgeBaseType.TEXT];

const formatUpdatedAt = (value?: string | null) => {
	if (!value) {
		return null;
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
	});

	const timeFormatter = new Intl.DateTimeFormat(undefined, {
		timeStyle: 'short',
	});

	return {
		date: dateFormatter.format(parsed),
		time: timeFormatter.format(parsed),
	};
};

const getFullSource = (knowledgeBase: KnowledgeBaseModel) => {
	if (knowledgeBase.sourceUrl) {
		return knowledgeBase.sourceUrl;
	}

	if (knowledgeBase.type === KnowledgeBaseType.FILE && knowledgeBase.file) {
		return knowledgeBase.file.name;
	}

	if (knowledgeBase.textContent) {
		return knowledgeBase.textContent;
	}

	if (knowledgeBase.identifier) {
		return knowledgeBase.identifier;
	}

	return 'No source information available.';
};

export const useKnowledgeBaseColumns = () =>
	useMemo<ColumnDef<KnowledgeBaseModel>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				cell: ({ row }) => {
					const knowledgeBase = row.original;
					const meta = resolvedTypeMeta(knowledgeBase.type);
					return (
						<div className={styles.cellContent}>
							<div className={styles.cellHeader}>
								<ThemeIcon size='xs' radius='md' variant='light' color='gray'>
									{meta.icon}
								</ThemeIcon>
								<Text className={styles.name}>{knowledgeBase.name}</Text>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: 'type',
				header: 'Type',
				cell: ({ row }) => {
					const knowledgeBase = row.original;
					const meta = resolvedTypeMeta(knowledgeBase.type);
					return (
						<Badge size='xs' variant='light' color={meta.color}>
							{meta.label}
						</Badge>
					);
				},
				meta: {
					cellClassName: styles.typeCell,
				},
			},
			{
				accessorKey: 'description',
				header: 'Description',
				cell: ({ row }) => {
					const knowledgeBase = row.original;
					return knowledgeBase.description ? (
						<Text className={styles.description}>
							{knowledgeBase.description}
						</Text>
					) : (
						<Text size='xs' c='dimmed'>
							—
						</Text>
					);
				},
			},
			{
				accessorKey: 'source',
				header: 'Source',
				cell: ({ row }) => {
					const knowledgeBase = row.original;
					const fullSource = getFullSource(knowledgeBase);
					return (
						<HoverCard width={320}>
							<HoverCard.Target>
								<IconInfoCircle size={14} style={{ cursor: 'pointer' }} />
							</HoverCard.Target>
							<HoverCard.Dropdown>
								<Text
									size='xs'
									style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
								>
									{fullSource}
								</Text>
							</HoverCard.Dropdown>
						</HoverCard>
					);
				},
				meta: {
					cellClassName: styles.sourceCell,
				},
			},
			{
				accessorKey: 'updatedAt',
				header: 'Updated',
				cell: ({ getValue }) => {
					const formatted = formatUpdatedAt(getValue<string | null>());

					if (!formatted) {
						return (
							<Text size='xs' c='dimmed'>
								—
							</Text>
						);
					}

					return (
						<Text className={styles.timestampDate}>
							{formatted.date} {formatted.time}
						</Text>
					);
				},
				meta: {
					headerClassName: styles.timestampHeader,
					cellClassName: styles.timestampCell,
				},
			},
		],
		[]
	);

export default useKnowledgeBaseColumns;
