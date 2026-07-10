import { useState } from 'react';
import {
	Badge,
	Box,
	Collapse,
	Group,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconTool,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ToolDisplayRow } from '../../helpers/formatUtils';
import styles from './ToolCallsSection.module.css';

interface ToolCallsSectionProps {
	rows: ToolDisplayRow[];
	compact?: boolean;
}

export const ToolCallsSection = ({
	rows,
	compact = false,
}: ToolCallsSectionProps) => {
	const { t } = useTranslation(['conversations', 'common']);

	if (rows.length === 0) {
		return null;
	}

	return (
		<Box
			className={`${styles.toolCallsSection}${compact ? ` ${styles.compact}` : ''}`}
		>
			<Group gap={6} align='center'>
				<IconTool size={13} className={styles.sectionIcon} stroke={2} />
				<Text size='xs' c='dimmed' fw={600}>
					{t('transcript.technical.toolCallsCount', { count: rows.length })}
				</Text>
			</Group>
			<Stack gap={4} mt={4}>
				{rows.map((row) => (
					<ToolRow key={row.key} row={row} />
				))}
			</Stack>
		</Box>
	);
};

interface ToolRowProps {
	row: ToolDisplayRow;
}

function ToolRow({ row }: ToolRowProps) {
	const [expanded, setExpanded] = useState(false);
	const { t } = useTranslation(['conversations', 'common']);
	const status = getRowStatus(row, t);
	const hasExpandableContent = Boolean(row.toolDetails || row.raw);

	return (
		<Box className={styles.toolCallItem}>
			<Group
				gap={6}
				wrap='nowrap'
				align='center'
				className={styles.toolCallRow}
			>
				<Badge
					size='sm'
					variant='light'
					color='violet'
					leftSection={<IconTool size={10} />}
					className={styles.toolBadge}
				>
					{row.toolName}
				</Badge>
				<Badge
					size='xs'
					variant='dot'
					color={status.color}
					className={styles.statusBadge}
				>
					{status.label}
				</Badge>
				{hasExpandableContent && (
					<UnstyledButton
						onClick={() => setExpanded((value) => !value)}
						className={styles.resultsToggle}
						aria-expanded={expanded}
					>
						<Group gap={2} wrap='nowrap' align='center'>
							<Text size='xs' fw={600}>
								{t('transcript.technical.results')}
							</Text>
							{expanded ? (
								<IconChevronDown size={13} />
							) : (
								<IconChevronRight size={13} />
							)}
						</Group>
					</UnstyledButton>
				)}
			</Group>

			{hasExpandableContent && (
				<Collapse expanded={expanded}>
					<Stack gap='xs' className={styles.toolCallExpanded}>
						{row.toolDetails && (
							<Box>
								<Text size='xs' c='dimmed' fw={500} mb={4}>
									{t('transcript.technical.toolDetails')}
								</Text>
								<Box className={styles.toolDetailsCode}>{row.toolDetails}</Box>
							</Box>
						)}
						{row.raw && (
							<Box>
								<Text size='xs' c='dimmed' fw={500} mb={4}>
									{t('transcript.technical.resultValue')}
								</Text>
								<Box className={styles.toolDetailsCode}>{row.raw}</Box>
							</Box>
						)}
					</Stack>
				</Collapse>
			)}
		</Box>
	);
}

function getRowStatus(
	row: ToolDisplayRow,
	t: ReturnType<typeof useTranslation>['t']
) {
	if (row.isError) {
		return { color: 'red', label: t('transcript.technical.error') };
	}

	if (row.isBlocked) {
		return { color: 'orange', label: t('transcript.technical.blocked') };
	}

	if (row.hasResult) {
		return { color: 'green', label: t('transcript.technical.completed') };
	}

	return row.called
		? { color: 'blue', label: t('transcript.technical.called') }
		: { color: 'gray', label: t('transcript.technical.pending') };
}
