import { useMemo, type ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Text, ThemeIcon } from '@mantine/core';
import { IconFileText, IconWorld, IconApi } from '@tabler/icons-react';
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

const buildSourceLabel = (knowledgeBase: KnowledgeBaseModel) => {
	if (knowledgeBase.sourceUrl) {
		return knowledgeBase.sourceUrl;
	}

	if (knowledgeBase.type === KnowledgeBaseType.FILE && knowledgeBase.file) {
		return knowledgeBase.file.name;
	}

	if (knowledgeBase.textContent) {
		return knowledgeBase.textContent.length > 80
			? `${knowledgeBase.textContent.slice(0, 77)}…`
			: knowledgeBase.textContent;
	}

	return 'No source information';
};

const truncateSourceLabel = (label: string) =>
	label.length > 120 ? `${label.slice(0, 117)}…` : label;

export const useKnowledgeBaseColumns = () =>
	useMemo<ColumnDef<KnowledgeBaseModel>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Knowledge base',
				cell: ({ row }) => {
					const knowledgeBase = row.original;
					const meta = resolvedTypeMeta(knowledgeBase.type);
					const sourceLabel = truncateSourceLabel(
						buildSourceLabel(knowledgeBase)
					);

					return (
						<div className={styles.cellContent}>
							<div className={styles.cellHeader}>
								<ThemeIcon size='sm' radius='md' variant='light' color='gray'>
									{meta.icon}
								</ThemeIcon>
								<Text className={styles.name}>{knowledgeBase.name}</Text>
								<Badge
									size='xs'
									variant='light'
									color={meta.color}
									className={styles.typePill}
								>
									{meta.label}
								</Badge>
							</div>
							{knowledgeBase.description ? (
								<Text className={styles.description}>
									{knowledgeBase.description}
								</Text>
							) : null}
							{sourceLabel ? (
								<Text className={styles.source}>{sourceLabel}</Text>
							) : null}
						</div>
					);
				},
				meta: {
					cellClassName: styles.primaryCell,
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
						<div className={styles.timestampWrapper}>
							<Text className={styles.timestampDate}>{formatted.date}</Text>
							<Text className={styles.timestampTime}>{formatted.time}</Text>
						</div>
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
