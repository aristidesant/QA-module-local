import { Badge } from '@mantine/core';
import {
	IconClock,
	IconMinus,
	IconTrendingDown,
	IconTrendingUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { SessionImpactRow } from '../postCoaching';

type Verdict = SessionImpactRow['verdict'];

const META: Record<
	Verdict,
	{ color: string; variant: 'light' | 'outline'; Icon: typeof IconMinus }
> = {
	IMPROVED: { color: 'green', variant: 'light', Icon: IconTrendingUp },
	SAME: { color: 'gray', variant: 'light', Icon: IconMinus },
	DECLINED: { color: 'red', variant: 'light', Icon: IconTrendingDown },
	PENDING: { color: 'gray', variant: 'outline', Icon: IconClock },
};

interface ImpactBadgeProps {
	verdict: Verdict;
	size?: 'xs' | 'sm';
}

/** What changed on the scorecard after a session; the icon keeps it readable without color. */
export function ImpactBadge({ verdict, size = 'xs' }: ImpactBadgeProps) {
	const { t } = useTranslation('qa.lms');
	const { color, variant, Icon } = META[verdict];
	return (
		<Badge
			size={size}
			color={color}
			variant={variant}
			leftSection={<Icon size={12} />}
		>
			{t(`agent.coaching.impact.verdict.${verdict}`)}
		</Badge>
	);
}

export default ImpactBadge;
