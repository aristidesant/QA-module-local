import { Badge, Text, Tooltip } from '@mantine/core';
import { IconVariable } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import ConversationMetadataList, {
	type ConversationMetadataListItem,
} from '../ConversationMetadataList';
import metadataListStyles from '../ConversationMetadataList/ConversationMetadataList.module.css';
import styles from './ConversationCapturedVariables.module.css';

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

	const entries = useMemo(() => Object.entries(variables || {}), [variables]);
	const items = useMemo<ConversationMetadataListItem[]>(
		() =>
			entries.map(([key, value]) => {
				const normalized = normalizeCapturedVariable(
					value,
					t('overview.capturedVariables.invalidValue')
				);
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
		[entries, t]
	);

	const countLabel = t('overview.capturedVariables.count', {
		count: entries.length,
	});

	return (
		<RightSectionCard
			title={t('overview.capturedVariables.title')}
			description={
				<Text size='xs' c='dimmed' className={styles.description}>
					{t('overview.capturedVariables.description')}
				</Text>
			}
			icon={IconVariable}
			iconColor='teal'
			rightSection={
				<Badge size='xs' variant='light' color='teal'>
					{countLabel}
				</Badge>
			}
		>
			{entries.length === 0 ? (
				<Text size='xs' c='dimmed'>
					{t('overview.capturedVariables.empty')}
				</Text>
			) : (
				<ConversationMetadataList items={items} />
			)}
		</RightSectionCard>
	);
};

export default ConversationCapturedVariables;
