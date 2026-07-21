import { Badge, Button, Group, Text, Tooltip } from '@mantine/core';
import { IconVariable } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard/SectionCard';
import ConversationMetadataList, {
	type ConversationMetadataListItem,
} from '../ConversationMetadataList/ConversationMetadataList';
import metadataListStyles from '../ConversationMetadataList/ConversationMetadataList.module.css';

export interface ConversationCapturedVariablesProps {
	variables?: Record<string, unknown>;
}

type CapturedVariableItem = {
	displayValue: string;
	rationale?: string;
	hasValue: boolean;
};

const formatDisplayValue = (
	value: unknown,
	invalidValueLabel: string
): string => {
	if (value === null || value === undefined || value === '') {
		return '';
	}

	if (typeof value === 'object') {
		try {
			return JSON.stringify(value);
		} catch {
			return invalidValueLabel;
		}
	}

	return String(value);
};

const normalizeCapturedVariable = (
	rawValue: unknown,
	invalidValueLabel: string
): CapturedVariableItem => {
	if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
		return { displayValue: '', hasValue: false };
	}

	const valueRecord = rawValue as Record<string, unknown>;
	const normalizedValue = formatDisplayValue(
		valueRecord.value,
		invalidValueLabel
	);
	const rationaleCandidate = valueRecord.rationale;
	const rationale =
		typeof rationaleCandidate === 'string' &&
		rationaleCandidate.trim().length > 0
			? rationaleCandidate
			: undefined;

	return {
		displayValue: normalizedValue,
		rationale,
		hasValue: normalizedValue.trim().length > 0,
	};
};

const ConversationCapturedVariables: React.FC<
	ConversationCapturedVariablesProps
> = ({ variables }) => {
	const { t } = useTranslation('conversations');
	const [showEmptyVariables, setShowEmptyVariables] = useState(false);

	const entries = useMemo(() => Object.entries(variables || {}), [variables]);
	const normalizedEntries = useMemo(
		() =>
			entries.map(([key, value]) => ({
				key,
				normalized: normalizeCapturedVariable(
					value,
					t('overview.capturedVariables.invalidValue')
				),
			})),
		[entries, t]
	);
	const capturedCount = normalizedEntries.filter(
		({ normalized }) => normalized.hasValue
	).length;
	const visibleEntries = useMemo(
		() =>
			showEmptyVariables
				? normalizedEntries
				: normalizedEntries.filter(({ normalized }) => normalized.hasValue),
		[normalizedEntries, showEmptyVariables]
	);
	const items = useMemo<ConversationMetadataListItem[]>(
		() =>
			visibleEntries.map(({ key, normalized }) => {
				const shouldShowValueTooltip =
					normalized.hasValue && normalized.displayValue.length > 42;

				const valueNode = normalized.hasValue ? (
					shouldShowValueTooltip ? (
						<Tooltip
							label={normalized.displayValue}
							position='top-end'
							withArrow
							multiline
							w={360}
							openDelay={100}
						>
							<Text className={metadataListStyles.valueText}>
								{normalized.displayValue}
							</Text>
						</Tooltip>
					) : (
						<Text className={metadataListStyles.valueText}>
							{normalized.displayValue}
						</Text>
					)
				) : (
					<Text className={metadataListStyles.valueMissing}>—</Text>
				);

				return {
					key,
					label: key,
					value: valueNode,
					rowTooltip: normalized.rationale,
				};
			}),
		[visibleEntries]
	);

	const countLabel = t('overview.capturedVariables.capturedCount', {
		captured: capturedCount,
		total: entries.length,
	});
	const hasHiddenVariables = capturedCount < entries.length;

	return (
		<SectionCard
			title={t('overview.capturedVariables.title')}
			description={t('overview.capturedVariables.description')}
			icon={IconVariable}
			headerActions={
				<Group gap={6} wrap='wrap'>
					<Badge size='xs' variant='light' color='green'>
						{countLabel}
					</Badge>
					{hasHiddenVariables && (
						<Button
							size='compact-xs'
							variant='subtle'
							color='gray'
							onClick={() => setShowEmptyVariables((value) => !value)}
							aria-expanded={showEmptyVariables}
						>
							{showEmptyVariables
								? t('overview.capturedVariables.hideEmpty')
								: t('overview.capturedVariables.showAll', {
										count: entries.length,
									})}
						</Button>
					)}
				</Group>
			}
			padding='sm'
			contentSpacing='sm'
		>
			{visibleEntries.length === 0 ? (
				<Text size='xs' c='dimmed'>
					{t('overview.capturedVariables.empty')}
				</Text>
			) : (
				<ConversationMetadataList items={items} columns={2} />
			)}
		</SectionCard>
	);
};

export default ConversationCapturedVariables;
