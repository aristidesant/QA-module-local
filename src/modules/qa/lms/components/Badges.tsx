import { Badge, Group, Text, Tooltip } from '@mantine/core';
import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsAcceptance, LmsArea, LmsAssignment, LmsFormat, LmsImpact } from '~/models/qa';
import {
	ACCEPTANCE_COLOR,
	ASSIGNMENT_STATUS_COLOR,
	LMS_AREA_META,
	LMS_FORMAT_META,
	VERDICT_COLOR,
} from '../constants';
import { effectiveStatus } from '../helpers';

interface FormatBadgeProps {
	format: LmsFormat;
	size?: 'xs' | 'sm' | 'md';
}

export function FormatBadge({ format, size = 'sm' }: FormatBadgeProps) {
	const { t } = useTranslation('qa.lms');
	const meta = LMS_FORMAT_META[format];
	const Icon = meta.icon;
	return (
		<Badge size={size} variant='light' color={meta.color} leftSection={<Icon size={12} />}>
			{t(meta.labelKey)}
		</Badge>
	);
}

interface AreaBadgeProps {
	area: LmsArea;
	subItem?: string | null;
	size?: 'xs' | 'sm' | 'md';
}

export function AreaBadge({ area, subItem, size = 'sm' }: AreaBadgeProps) {
	const { t } = useTranslation('qa.lms');
	const meta = LMS_AREA_META[area];
	return (
		<Group gap={6} wrap='nowrap'>
			<Badge size={size} variant='light' color={meta.color}>
				{t(meta.labelKey)}
			</Badge>
			{subItem && (
				<Text size='xs' c='dimmed'>
					{t(`subItems.${subItem}`)}
				</Text>
			)}
		</Group>
	);
}

export function AssignmentStatusBadge({ assignment, size = 'sm' }: { assignment: LmsAssignment; size?: 'xs' | 'sm' | 'md' }) {
	const { t } = useTranslation('qa.lms');
	const status = effectiveStatus(assignment);
	return (
		<Badge size={size} color={ASSIGNMENT_STATUS_COLOR[status]} variant='light'>
			{t(`status.${status}`)}
		</Badge>
	);
}

export function AcceptanceBadge({ acceptance, size = 'sm' }: { acceptance: LmsAcceptance; size?: 'xs' | 'sm' | 'md' }) {
	const { t } = useTranslation('qa.lms');
	if (acceptance.status === 'NOT_REQUIRED') return null;
	return (
		<Badge size={size} variant='outline' color={ACCEPTANCE_COLOR[acceptance.status]}>
			{t(`acceptance.${acceptance.status}`)}
		</Badge>
	);
}

export function ImpactBadge({ impact, size = 'sm' }: { impact: LmsImpact | null; size?: 'xs' | 'sm' | 'md' }) {
	const { t } = useTranslation('qa.lms');
	if (!impact) {
		return (
			<Text size='sm' c='dimmed'>
				—
			</Text>
		);
	}
	const Icon =
		impact.verdict === 'IMPROVED' ? IconTrendingUp : impact.verdict === 'DECLINED' ? IconTrendingDown : IconMinus;
	const label = t(`verdict.${impact.verdict}`);
	const tooltip =
		impact.checkpoint30 !== null
			? `${t('impact.baseline')} ${impact.baseline} → ${t('impact.checkpoint30')} ${impact.checkpoint30}`
			: t('agent.history.impactHint');

	return (
		<Tooltip label={tooltip} withArrow>
			<Badge size={size} color={VERDICT_COLOR[impact.verdict]} variant='light' leftSection={<Icon size={12} />}>
				{label}
			</Badge>
		</Tooltip>
	);
}
