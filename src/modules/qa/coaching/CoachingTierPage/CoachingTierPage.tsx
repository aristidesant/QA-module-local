import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
	Anchor,
	Badge,
	Breadcrumbs,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { SectionCard } from '~/components/SectionCard';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { useAgentCoachingRows } from '../agentRows';
import { AgentsTierTable } from '../components/AgentsTierTable';
import {
	coachingAgentPath,
	coachingBasePath,
	tierFromParam,
} from '../constants';
import { TIER_META, tierRangeLabel } from '../scorecard';

/** One performance group of the Agents tab with every column, on its own page (route `tiers/:tier`). */
export default function CoachingTierPage() {
	const { t } = useTranslation(['qa.coaching', 'qa.lms']);
	const location = useLocation();
	const navigate = useNavigate();
	const { tier: tierParam } = useParams<{ tier: string }>();

	const role = roleFromPath(location.pathname);
	const tier = tierFromParam(tierParam);
	const allRows = useAgentCoachingRows(role);

	const rows = useMemo(
		() =>
			tier === 'NO_DATA'
				? allRows.filter((r) => !r.tier)
				: allRows.filter((r) => r.tier === tier),
		[allRows, tier]
	);

	if (!tier) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState message={t('agents.empty')} />
			</ContentContainer>
		);
	}

	const accent = tier === 'NO_DATA' ? undefined : TIER_META[tier].color;
	const title =
		tier === 'NO_DATA'
			? t('agents.tiers.noData.title')
			: t(TIER_META[tier].labelKey);
	const description =
		tier === 'NO_DATA'
			? t('agents.tiers.noData.description')
			: t('agents.tiers.description', { range: tierRangeLabel(t, tier) });

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor
						size='sm'
						onClick={() => navigate(`${coachingBasePath(role)}?tab=agents`)}
					>
						{t('title')}
					</Anchor>
					<Text size='sm' c='dimmed'>
						{title}
					</Text>
				</Breadcrumbs>

				<Group justify='space-between' align='flex-start'>
					<Stack gap={0}>
						<Title order={1}>{title}</Title>
						<Text c='dimmed' size='sm'>
							{description}
						</Text>
					</Stack>
					<Badge size='lg' variant='light' color={accent ?? 'gray'}>
						{t('agents.summary.agents', { count: rows.length })}
					</Badge>
				</Group>

				<SectionCard headerAccent={accent} padding='md'>
					<AgentsTierTable
						rows={rows}
						onOpen={(agentId) => navigate(coachingAgentPath(role, agentId))}
					/>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
}
