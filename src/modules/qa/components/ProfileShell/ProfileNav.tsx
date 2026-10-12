import type { ReactNode } from 'react';
import { Stack, Tabs } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';
import styles from './ProfileNav.module.css';

export type Attention = 'warning' | 'critical';
export type AttentionMap<T extends string> = Partial<Record<T, Attention>>;

export interface NavTab<T extends string> {
	value: T;
	label: string;
	icon?: TablerIcon;
}

export interface NavGroup<T extends string> {
	value: string;
	label: string;
	icon: TablerIcon;
	tabs: NavTab<T>[];
}

interface ProfileNavProps<T extends string> {
	groups: NavGroup<T>[];
	tab: T;
	onChange: (tab: T) => void;
	attention: AttentionMap<T>;
	/** Accessible name of an attention dot, e.g. "Needs attention". */
	attentionLabel: string;
}

/** The worst level among a set of tabs, or undefined when none needs a look. */
export const worstAttention = <T extends string>(
	tabs: T[],
	attention: AttentionMap<T>
): Attention | undefined => {
	const levels = tabs.map((tab) => attention[tab]);
	return levels.includes('critical')
		? 'critical'
		: levels.includes('warning')
			? 'warning'
			: undefined;
};

/** Groups on top; inside a group with several tabs, a pill row to move between them. */
export function ProfileNav<T extends string>({
	groups,
	tab,
	onChange,
	attention,
	attentionLabel,
}: ProfileNavProps<T>) {
	const group =
		groups.find((g) => g.tabs.some((x) => x.value === tab)) ?? groups[0];

	const dot = (level: Attention | undefined): ReactNode =>
		level ? (
			<span
				className={styles.dot}
				data-level={level}
				role='img'
				aria-label={attentionLabel}
			/>
		) : undefined;

	return (
		<Stack gap='xs'>
			<Tabs
				value={group.value}
				onChange={(value) => {
					const next = groups.find((g) => g.value === value);
					if (next) onChange(next.tabs[0].value);
				}}
			>
				<Tabs.List>
					{groups.map(({ value, label, icon: Icon, tabs }) => (
						<Tabs.Tab
							key={value}
							value={value}
							leftSection={<Icon size={16} />}
							rightSection={dot(
								worstAttention(
									tabs.map((x) => x.value),
									attention
								)
							)}
						>
							{label}
						</Tabs.Tab>
					))}
				</Tabs.List>
			</Tabs>

			{group.tabs.length > 1 && (
				<Tabs
					variant='pills'
					value={tab}
					onChange={(value) => value && onChange(value as T)}
				>
					<Tabs.List>
						{group.tabs.map(({ value, label, icon: Icon }) => (
							<Tabs.Tab
								key={value}
								value={value}
								leftSection={Icon ? <Icon size={14} /> : undefined}
								rightSection={dot(attention[value])}
							>
								{label}
							</Tabs.Tab>
						))}
					</Tabs.List>
				</Tabs>
			)}
		</Stack>
	);
}
