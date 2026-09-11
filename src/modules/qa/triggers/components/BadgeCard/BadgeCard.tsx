import { ActionIcon, Avatar, Badge, Group, Menu, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BadgeDefinition } from '~/models/qa';
import { AREA_COLORS, TIER_COLORS } from '~/modules/qa/triggers/constants';
import { describeCondition } from '~/modules/qa/triggers/helpers';
import classes from './BadgeCard.module.css';

interface BadgeCardProps {
	badge: BadgeDefinition;
	onOpen: (badge: BadgeDefinition) => void;
	onEdit: (badge: BadgeDefinition) => void;
	onToggleStatus: (badge: BadgeDefinition) => void;
	onCreateRule: (badge: BadgeDefinition) => void;
}

export default function BadgeCard({ badge, onOpen, onEdit, onToggleStatus, onCreateRule }: BadgeCardProps) {
	const { t } = useTranslation('qa.triggers');

	const handleClick = () => onOpen(badge);

	const holdersLabel = t(`badges.card.holders_${badge.holders.length === 1 ? 'one' : 'other'}`, {
		count: badge.holders.length,
	});

	const avatars = badge.holders.slice(0, 3).map((h) => ({
		name: h.agentName,
		color: 'blue',
		children: h.agentName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase(),
	}));

	return (
		<Paper
			withBorder
			p="md"
			radius="md"
			className={classes.card}
			data-archived={badge.status === 'ARCHIVED' ? true : undefined}
			onClick={handleClick}
		>
			<Group justify="space-between" align="flex-start">
				<Group gap="sm" flex={1}>
					<ThemeIcon size={48} radius="xl" variant="light" color={badge.color}>
						<Text fz={24}>{badge.icon}</Text>
					</ThemeIcon>
					<Stack gap={2} flex={1}>
						<Text fw={600} size="sm">
							{badge.name}
						</Text>
						<Group gap={4}>
							<Badge size="xs" color={TIER_COLORS[badge.tier]} variant="filled">
								{t(`tiers.${badge.tier}`)}
							</Badge>
							<Badge size="xs" variant="outline" color={AREA_COLORS[badge.area]}>
								{t(`areas.${badge.area}`)}
							</Badge>
						</Group>
					</Stack>
				</Group>

				<Menu withinPortal position="bottom-end">
					<Menu.Target>
						<ActionIcon
							variant="subtle"
							color="gray"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconEdit size={14} />}
							onClick={(e) => {
								e.stopPropagation();
								onEdit(badge);
							}}
						>
							{t('badges.actions.edit')}
						</Menu.Item>
						{badge.status === 'ACTIVE' ? (
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									onToggleStatus(badge);
								}}
							>
								{t('badges.actions.archive')}
							</Menu.Item>
						) : (
							<Menu.Item
								leftSection={<IconTrash size={14} />}
								onClick={(e) => {
									e.stopPropagation();
									onToggleStatus(badge);
								}}
							>
								{t('badges.actions.restore')}
							</Menu.Item>
						)}
						{!badge.linkedRuleId && (
							<Menu.Item
								onClick={(e) => {
									e.stopPropagation();
									onCreateRule(badge);
								}}
							>
								{t('badges.actions.createRule')}
							</Menu.Item>
						)}
					</Menu.Dropdown>
				</Menu>
			</Group>

			<Text size="sm" c="dimmed" lineClamp={2} mt="sm">
				{badge.description}
			</Text>

			{badge.conditions.length > 0 && (
				<Text size="xs" c="dimmed" mt="xs">
					{describeCondition(t, badge.conditions[0])}
					{badge.conditions.length > 1 && ` +${badge.conditions.length - 1}`}
				</Text>
			)}

			<Group justify="space-between" mt="md">
				<Group gap="xs">
					<Group gap="xs">
						{avatars.slice(0, 3).map((avatar) => (
							<Avatar key={avatar.name} name={avatar.name} color={avatar.color} radius="xl" size="sm">
								{avatar.children}
							</Avatar>
						))}
						{avatars.length > 3 && (
							<Avatar radius="xl" size="sm">
								+{avatars.length - 3}
							</Avatar>
						)}
					</Group>
					<Text size="xs" c="dimmed">
						{badge.holders.length > 0 ? holdersLabel : t('badges.card.noHolders')}
					</Text>
				</Group>

				<Badge size="xs" variant="dot" color={badge.autoAward ? 'green' : 'gray'}>
					{badge.autoAward ? t('badges.card.autoAward') : t('badges.card.manual')}
				</Badge>
			</Group>
		</Paper>
	);
}
