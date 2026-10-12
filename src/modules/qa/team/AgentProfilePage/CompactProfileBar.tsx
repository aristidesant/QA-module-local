import { Avatar, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentProfile } from '../types';
import { ProfileActions, type ProfileActionsProps } from './ProfileActions';
import styles from './AgentProfilePage.module.css';

interface CompactProfileBarProps extends Omit<ProfileActionsProps, 'size'> {
	profile: AgentProfile;
	/** True once the full header has scrolled out of view. */
	visible: boolean;
}

/** Avatar, name, score and the actions, kept in reach while the long profile scrolls. */
export function CompactProfileBar({
	profile,
	visible,
	...actions
}: CompactProfileBarProps) {
	const { t } = useTranslation('qa.team');
	const { agent, overall } = profile;
	return (
		<div className={styles.compactAnchor}>
			<div
				className={styles.compactBar}
				data-visible={visible || undefined}
				aria-hidden={!visible}
			>
				<Group gap='sm' wrap='nowrap' miw={0}>
					<Avatar size={32} radius='md' color='gray' name={agent.name} />
					<Text fw={600} truncate>
						{agent.name}
					</Text>
					<Text fw={700}>{overall.score}</Text>
					<Text size='sm' c='dimmed' visibleFrom='sm'>
						{t('header.rank', {
							rank: overall.rankInTeam,
							size: overall.teamSize,
						})}
					</Text>
				</Group>
				<ProfileActions size='xs' {...actions} />
			</div>
		</div>
	);
}
