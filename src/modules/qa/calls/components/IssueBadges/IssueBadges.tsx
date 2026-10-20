import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { CALL_ISSUE_BY_KEY, type CallIssueKey } from '../../issues';
import classes from './IssueBadges.module.css';

export interface IssueBadgesProps {
	issues: CallIssueKey[];
	/** Critical errors behind an auto-fail; shown on the auto-fail badge. */
	autoFailCount: number;
	/** Badges shown before the rest collapse into "+N". */
	max?: number;
}

/** Only the severe issues (red in the issue config) keep their colour; the rest stay neutral so the column reads quietly. */
const issueBadgeColor = (key: CallIssueKey) =>
	CALL_ISSUE_BY_KEY[key].color === 'red' ? 'red' : 'gray';

/** The incidents of a call as badges; auto-fail is filled and carries its count. Labels: qa.calls. */
export default function IssueBadges({
	issues,
	autoFailCount,
	max = 3,
}: IssueBadgesProps) {
	const { t } = useTranslation('qa.calls');
	const shown = issues.slice(0, max);

	return (
		<div className={classes.issueCell}>
			{shown.map((key) => (
				<Badge
					color={issueBadgeColor(key)}
					key={key}
					size='sm'
					variant={key === 'auto-fail' ? 'filled' : 'light'}
				>
					{key === 'auto-fail'
						? t('myCalls.autoFailCount', { count: autoFailCount })
						: t(`issues.${key}`)}
				</Badge>
			))}
			{issues.length > max ? (
				<Badge color='gray' size='sm' variant='outline'>
					{t('myCalls.moreIssues', { count: issues.length - max })}
				</Badge>
			) : null}
		</div>
	);
}
