import { Button, Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { BadgeDefinition, BadgeHolder } from '~/models/qa';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import AppDrawer from '~/components/AppDrawer';
import BaseTable from '~/components/BaseTable';
import SectionCard from '~/components/SectionCard';
import ConditionSummaryList from '~/modules/qa/triggers/components/ConditionSummaryList';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';

interface BadgeDetailDrawerProps {
	badge: BadgeDefinition | null;
	opened: boolean;
	onClose: () => void;
	onEdit: (badge: BadgeDefinition) => void;
	onOpenRule: (ruleId: string) => void;
}

export default function BadgeDetailDrawer({ badge, opened, onClose, onEdit, onOpenRule }: BadgeDetailDrawerProps) {
	const { t } = useTranslation('qa.triggers');
	const rules = useTriggerRulesStore((s) => s.rules);
	const dateFormatter = useDateFormatter('dateTime');

	if (!badge) return null;

	const linkedRule = badge.linkedRuleId ? rules.find((r) => r.id === badge.linkedRuleId) : null;
	const lastAwarded = badge.holders.length > 0 ? new Date(badge.holders[0].earnedAt) : null;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size="lg"
			title={
				<Group gap="sm">
					<ThemeIcon size={32} radius="xl" variant="light" color={badge.color}>
						<Text fz={20}>{badge.icon}</Text>
					</ThemeIcon>
					<div>
						<Text fw={600} size="sm">
							{badge.name}
						</Text>
						<Text size="xs" c="dimmed">
							{badge.description}
						</Text>
					</div>
				</Group>
			}
			headerActions={
				<Button
					size="xs"
					leftSection={<IconEdit size={14} />}
					onClick={() => {
						onEdit(badge);
						onClose();
					}}
				>
					{t('badges.actions.edit')}
				</Button>
			}
		>
			<Stack gap="md">
				<SimpleGrid cols={3} spacing="md">
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('badges.detail.stats.holders')}
						</Text>
						<Text fw={600} size="lg">
							{badge.holders.length}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('badges.detail.stats.lastAwarded')}
						</Text>
						<Text fw={600} size="sm">
							{lastAwarded ? dateFormatter.format(lastAwarded) : t('common.na')}
						</Text>
					</Stack>
					<Stack gap={0}>
						<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
							{t('badges.detail.stats.tier')}
						</Text>
						<Text fw={600} size="sm">
							{t(`tiers.${badge.tier}`)}
						</Text>
					</Stack>
				</SimpleGrid>

				<SectionCard title={t('badges.detail.criteria')} padding="md">
					<ConditionSummaryList conditions={badge.conditions} logic={badge.conditionLogic} />
				</SectionCard>

				<SectionCard title={t('badges.detail.linkedRule')} padding="md">
					{linkedRule ? (
						<Group justify="space-between">
							<Text size="sm">{linkedRule.name}</Text>
							<Button
								variant="light"
								size="xs"
								onClick={() => {
									onOpenRule(linkedRule.id);
									onClose();
								}}
							>
								{t('detail.detail')}
							</Button>
						</Group>
					) : (
						<Text size="sm" c="dimmed">
							{t('badges.detail.noLinkedRule')}
						</Text>
					)}
				</SectionCard>

				<SectionCard title={t('badges.detail.holders')} padding="md">
					{badge.holders.length > 0 ? (
						<BaseTable<BadgeHolder>
							data={badge.holders}
							columns={[
								{
									accessorKey: 'agentName',
									header: t('badges.detail.columns.agent'),
									cell: (info) => {
										const holder = info.row.original;
										return <Text>{holder.agentName}</Text>;
									},
								},
								{
									accessorKey: 'team',
									header: t('badges.detail.columns.team'),
									cell: (info) => {
										const holder = info.row.original;
										return <Text>{holder.team}</Text>;
									},
								},
								{
									accessorKey: 'earnedAt',
									header: t('badges.detail.columns.earnedAt'),
									cell: (info) => {
										const holder = info.row.original;
										return <Text>{dateFormatter.format(new Date(holder.earnedAt))}</Text>;
									},
								},
							]}
							getRowId={(holder) => `${holder.agentId}-${holder.earnedAt}`}
						/>
					) : (
						<Text size="sm" c="dimmed">
							{t('badges.card.noHolders')}
						</Text>
					)}
				</SectionCard>
			</Stack>
		</AppDrawer>
	);
}
