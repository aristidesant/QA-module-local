import { Stack, Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	PROFILE_TABS,
	PROFILE_TAB_GROUPS,
	profileGroupOf,
	type ProfileTab,
} from '../constants';
import type { Attention, AttentionMap } from './attention';
import styles from './ProfileNav.module.css';

interface ProfileNavProps {
	tab: ProfileTab;
	onChange: (tab: ProfileTab) => void;
	attention: AttentionMap;
}

/** The worst level among a set of tabs, or undefined when none needs a look. */
const worstOf = (
	tabs: ProfileTab[],
	attention: AttentionMap
): Attention | undefined => {
	const levels = tabs.map((tab) => attention[tab]);
	return levels.includes('critical')
		? 'critical'
		: levels.includes('warning')
			? 'warning'
			: undefined;
};

/** Five groups on top; inside a group with several tabs, a pill row to move between them. */
export function ProfileNav({ tab, onChange, attention }: ProfileNavProps) {
	const { t } = useTranslation('qa.team');
	const group = profileGroupOf(tab);

	const dot = (level: Attention | undefined) =>
		level ? (
			<span
				className={styles.dot}
				data-level={level}
				role='img'
				aria-label={t('tabs.attention')}
			/>
		) : undefined;

	return (
		<Stack gap='xs'>
			<Tabs
				value={group.value}
				onChange={(value) => {
					const next = PROFILE_TAB_GROUPS.find((g) => g.value === value);
					if (next) onChange(next.tabs[0]);
				}}
			>
				<Tabs.List>
					{PROFILE_TAB_GROUPS.map(({ value, labelKey, icon: Icon, tabs }) => (
						<Tabs.Tab
							key={value}
							value={value}
							leftSection={<Icon size={16} />}
							rightSection={dot(worstOf(tabs, attention))}
						>
							{t(labelKey)}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>

			{group.tabs.length > 1 && (
				<Tabs
					variant='pills'
					value={tab}
					onChange={(value) => value && onChange(value as ProfileTab)}
				>
					<Tabs.List>
						{group.tabs.map((value) => {
							const Icon = PROFILE_TABS.find((x) => x.value === value)?.icon;
							return (
								<Tabs.Tab
									key={value}
									value={value}
									leftSection={Icon ? <Icon size={14} /> : undefined}
									rightSection={dot(attention[value])}
								>
									{t(`tabs.${value}`)}
								</Tabs.Tab>
							);
						})}
					</Tabs.List>
				</Tabs>
			)}
		</Stack>
	);
}
