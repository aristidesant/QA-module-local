import { useState } from 'react';
import { Badge, Box, Collapse, Group, Stack, Text } from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconCircleCheck,
	IconCircleX,
	IconTool,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { ToolCall, ToolResult } from '~/models/ConversationsModels';
import { formatJsonDisplay } from '../../helpers/formatUtils';
import styles from './ToolCallsSection.module.css';

interface ToolCallsSectionProps {
	toolCalls: ToolCall[];
	toolResultsMap: Map<string, ToolResult>;
}

export const ToolCallsSection = ({
	toolCalls,
	toolResultsMap,
}: ToolCallsSectionProps) => {
	const { t } = useTranslation(['conversations', 'common']);

	return (
		<Box className={styles.toolCallsSection}>
			<Group gap={6} align='center'>
				<IconTool size={12} color='var(--mantine-color-violet-6)' stroke={2} />
				<Text size='xs' c='dimmed' fw={500}>
					{t('transcript.technical.toolCalls')}
				</Text>
			</Group>
			<Stack gap={4} mt={4}>
				{toolCalls.map((tool, idx) => {
					const matchingResult = tool.request_id
						? toolResultsMap.get(tool.request_id)
						: undefined;
					return (
						<ToolCallItem
							key={`${tool.request_id}-${idx}`}
							tool={tool}
							result={matchingResult}
						/>
					);
				})}
			</Stack>
		</Box>
	);
};

interface ToolCallItemProps {
	tool: ToolCall;
	result?: ToolResult;
}

function ToolCallItem({ tool, result }: ToolCallItemProps) {
	const [expanded, setExpanded] = useState(false);
	const { t } = useTranslation(['conversations', 'common']);
	const hasResult = result !== undefined;
	const isError = result?.is_error === true;

	return (
		<Box className={styles.toolCallItem}>
			<Group
				gap={6}
				wrap='nowrap'
				onClick={() => setExpanded(!expanded)}
				className={styles.toolCallToggle}
			>
				<Badge
					size='sm'
					variant='light'
					color={tool.tool_has_been_called ? 'violet' : 'gray'}
					leftSection={<IconTool size={10} />}
					className={styles.toolBadge}
				>
					{tool.tool_name}
				</Badge>
				{hasResult && !isError && (
					<IconCircleCheck size={13} className={styles.resultIconSuccess} />
				)}
				{hasResult && isError && (
					<IconCircleX size={13} className={styles.resultIconError} />
				)}
				<Box className={styles.chevron}>
					{expanded ? (
						<IconChevronDown size={12} />
					) : (
						<IconChevronRight size={12} />
					)}
				</Box>
			</Group>

			<Collapse in={expanded}>
				<Box className={styles.toolCallExpanded}>
					<Stack gap='xs'>
						<Group justify='space-between' align='flex-start'>
							<Box>
								<Text size='xs' c='dimmed' fw={500}>
									{t('transcript.technical.toolName')}
								</Text>
								<Text size='sm' fw={600}>
									{tool.tool_name}
								</Text>
							</Box>
							<Badge
								size='xs'
								variant='dot'
								color={tool.tool_has_been_called ? 'green' : 'orange'}
							>
								{tool.tool_has_been_called
									? t('transcript.technical.called')
									: t('transcript.technical.pending')}
							</Badge>
						</Group>

						{tool.type && (
							<Box>
								<Text size='xs' c='dimmed' fw={500}>
									{t('transcript.technical.type')}
								</Text>
								<Text size='sm'>{tool.type}</Text>
							</Box>
						)}

						{formatJsonDisplay(tool.params_as_json) && (
							<Box>
								<Text size='xs' c='dimmed' fw={500} mb={4}>
									{t('transcript.technical.parameters')}
								</Text>
								<Box className={styles.toolDetailsCode}>
									{formatJsonDisplay(tool.params_as_json)}
								</Box>
							</Box>
						)}

						{tool.request_id && (
							<Box>
								<Text size='xs' c='dimmed' fw={500}>
									{t('transcript.technical.requestId')}
								</Text>
								<Text size='xs' c='dimmed' className={styles.monoText}>
									{tool.request_id}
								</Text>
							</Box>
						)}

						{hasResult && <ToolResultBlock result={result!} />}
					</Stack>
				</Box>
			</Collapse>
		</Box>
	);
}

interface ToolResultBlockProps {
	result: ToolResult;
}

function ToolResultBlock({ result }: ToolResultBlockProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const isError = result.is_error === true;
	const hasValue = Boolean(result.result_value ?? result.result);

	return (
		<Box
			className={`${styles.toolResultBlock} ${isError ? styles.toolResultBlockError : styles.toolResultBlockSuccess}`}
		>
			<Group gap={4} align='center'>
				{isError ? (
					<IconCircleX size={12} className={styles.resultIconError} />
				) : (
					<IconCircleCheck size={12} className={styles.resultIconSuccess} />
				)}
				<Text size='xs' fw={600} c={isError ? 'red.7' : 'green.7'}>
					{isError
						? t('transcript.technical.error')
						: t('transcript.technical.success')}
				</Text>
			</Group>

			{result.tool_latency_secs !== undefined && (
				<Text size='xs' c='dimmed'>
					{t('transcript.technical.latency')}:{' '}
					{result.tool_latency_secs.toFixed(2)}s
				</Text>
			)}

			{hasValue && (
				<Box>
					<Text size='xs' c='dimmed' fw={500} mb={4}>
						{t('transcript.technical.resultValue')}
					</Text>
					<Box className={styles.toolDetailsCode}>
						{formatJsonDisplay(result.result_value ?? result.result ?? '')}
					</Box>
				</Box>
			)}

			{isError && result.raw_error_message && (
				<Box>
					<Text size='xs' c='dimmed' fw={500}>
						{t('transcript.technical.rawError')}
					</Text>
					<Text size='xs' c='red.7' className={styles.monoText}>
						{result.raw_error_message}
					</Text>
				</Box>
			)}
		</Box>
	);
}
