import { Button, ColorSwatch, Group, Grid, Select, SimpleGrid, Stack, Switch, Text, TextInput, Textarea, UnstyledButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { BadgeDefinition, ConditionLogic, RuleCondition, TriggerRule } from '~/models/qa';
import { BADGE_COLOR_OPTIONS, BADGE_ICON_OPTIONS, EVALUATION_AREAS } from '~/modules/qa/triggers/constants';
import { nextId, useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { NOW_ISO } from '~/modules/qa/triggers/mockData';
import AppDrawer from '~/components/AppDrawer';
import SectionCard from '~/components/SectionCard';
import { ConditionRow } from '~/modules/qa/triggers/components/ConditionRow';
import classes from './BadgeEditorDrawer.module.css';

interface BadgeFormValues {
	name: string;
	description: string;
	icon: string;
	color: string;
	area: string;
	tier: 'BRONZE' | 'SILVER' | 'GOLD';
	conditions: RuleCondition[];
	conditionLogic: ConditionLogic;
	autoAward: boolean;
	status: 'ACTIVE' | 'ARCHIVED';
}

interface BadgeEditorDrawerProps {
	opened: boolean;
	badge: BadgeDefinition | null;
	onClose: () => void;
	onSaved: (badge: BadgeDefinition, createdRule?: TriggerRule) => void;
}

export default function BadgeEditorDrawer({ opened, badge, onClose, onSaved }: BadgeEditorDrawerProps) {
	const { t } = useTranslation('qa.triggers');
	const addBadge = useTriggerRulesStore((s) => s.addBadge);
	const updateBadge = useTriggerRulesStore((s) => s.updateBadge);
	const addRule = useTriggerRulesStore((s) => s.addRule);

	const isCreate = !badge;

	const form = useForm<BadgeFormValues>({
		initialValues: {
			name: badge?.name ?? '',
			description: badge?.description ?? '',
			icon: badge?.icon ?? BADGE_ICON_OPTIONS[0],
			color: badge?.color ?? BADGE_COLOR_OPTIONS[0],
			area: badge?.area ?? 'GENERAL',
			tier: badge?.tier ?? 'BRONZE',
			conditions: badge?.conditions ?? [],
			conditionLogic: badge?.conditionLogic ?? 'ALL',
			autoAward: badge?.autoAward ?? false,
			status: badge?.status ?? 'ACTIVE',
		},
		validate: {
			name: (value) => (!value ? t('badges.editor.validation.nameRequired') : null),
			icon: (value) => (!value ? t('badges.editor.validation.iconRequired') : null),
		},
	});

	const handleCancel = () => {
		form.reset();
		onClose();
	};

	const handleSave = async () => {
		if (!form.validate().hasErrors) {
			const values = form.values;
			const now = NOW_ISO;

			if (isCreate) {
				const newBadge: BadgeDefinition = {
					id: nextId('BDG'),
					name: values.name,
					description: values.description,
					icon: values.icon,
					color: values.color,
					area: values.area as any,
					tier: values.tier,
					conditions: values.conditions,
					conditionLogic: values.conditionLogic,
					autoAward: values.autoAward,
					linkedRuleId: null,
					status: values.status,
					holders: [],
					createdAt: now,
					updatedAt: now,
				};

				addBadge(newBadge);

				// Create linked recognition rule if autoAward
				let createdRule;
				if (values.autoAward && !newBadge.linkedRuleId) {
					const ruleId = nextId('REC');
					createdRule = {
						id: ruleId,
						kind: 'RECOGNITION' as const,
						type: 'BADGE_AWARD' as const,
						name: values.name,
						description: '',
						severity: 'INFO' as const,
						status: 'ACTIVE' as const,
						conditions: values.conditions,
						conditionLogic: values.conditionLogic,
						scope: {
							agentIds: [],
							supervisorIds: [],
							campaignIds: [],
							linesOfBusiness: [],
							campaignTypes: [],
						},
						delivery: {
							recipients: ['AGENT' as const, 'SUPERVISOR' as const],
							channels: ['INBOX' as const],
							escalationEnabled: false,
							escalationAfterHours: 24,
						},
						message: {
							templateId: null,
							subject: `You earned ${values.name}`,
							body: `Congratulations! You've earned the {{badge_name}} badge.`,
						},
						frequency: {
							cooldownDays: 0,
							maxPerWeek: null,
							quietHoursEnabled: false,
							quietHoursFrom: '20:00',
							quietHoursTo: '08:00',
						},
						schedule: null,
						burnoutLevel: null,
						recognition: {
							badgeId: newBadge.id,
							visibility: 'TEAM_FEED' as const,
							celebrationEmoji: '🏆',
						},
						stats: { firedLast7Days: 0, firedLast30Days: 0, lastFiredAt: null },
						createdBy: 'QA Manager',
						createdByRole: 'QA_MANAGER' as const,
						createdAt: now,
						updatedAt: now,
					};
					addRule(createdRule);
					newBadge.linkedRuleId = ruleId;
					updateBadge(newBadge);
				}

				onSaved(newBadge, createdRule);
			} else if (badge) {
				const updatedBadge: BadgeDefinition = {
					...badge,
					name: values.name,
					description: values.description,
					icon: values.icon,
					color: values.color,
					area: values.area as any,
					tier: values.tier,
					conditions: values.conditions,
					conditionLogic: values.conditionLogic,
					autoAward: values.autoAward,
					status: values.status,
					updatedAt: now,
				};
				updateBadge(updatedBadge);
				onSaved(updatedBadge);
			}

			form.reset();
			onClose();
		}
	};

	const handleAddCondition = () => {
		const newCondition: RuleCondition = {
			id: `cond-${nextId('TMP')}`,
			metricId: 'QA_OVERALL_SCORE',
			subItem: null,
			mode: 'THRESHOLD',
			operator: 'GTE',
			value: 80,
			value2: null,
			changeDirection: 'INCREASE',
			changePercent: 10,
			consecutiveCount: 3,
			window: 'LAST_7_DAYS',
			windowSize: 10,
		};
		form.insertListItem('conditions', newCondition);
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={handleCancel}
			size="xl"
			title={isCreate ? t('badges.editor.createTitle') : t('badges.editor.editTitle')}
		>
			<Stack gap="md">
				<SectionCard title={t('badges.editor.sections.identity')} padding="md">
					<Stack gap="md">
						<TextInput
							label={t('badges.editor.fields.name')}
							placeholder={t('badges.editor.fields.name')}
							{...form.getInputProps('name')}
						/>
						<Textarea
							label={t('badges.editor.fields.description')}
							placeholder={t('badges.editor.fields.description')}
							autosize
							minRows={2}
							{...form.getInputProps('description')}
						/>

						<div>
							<Text size="sm" fw={600} mb="xs">
								{t('badges.editor.fields.icon')}
							</Text>
							<SimpleGrid cols={8} spacing="xs">
								{BADGE_ICON_OPTIONS.map((icon) => (
									<UnstyledButton
										key={icon}
										className={classes.iconCell}
										data-selected={form.values.icon === icon}
										onClick={() => form.setFieldValue('icon', icon)}
									>
										<Text fz={24}>{icon}</Text>
									</UnstyledButton>
								))}
							</SimpleGrid>
						</div>

						<div>
							<Text size="sm" fw={600} mb="xs">
								{t('badges.editor.fields.color')}
							</Text>
							<Group gap="xs">
								{BADGE_COLOR_OPTIONS.map((color) => (
									<ColorSwatch
										key={color}
										component="button"
										color={`var(--mantine-color-${color}-6)`}
										onClick={() => form.setFieldValue('color', color)}
										style={{
											cursor: 'pointer',
											border:
												form.values.color === color
													? `2px solid var(--mantine-color-blue-5)`
													: '2px solid transparent',
										}}
									/>
								))}
							</Group>
						</div>
					</Stack>
				</SectionCard>

				<SectionCard
					title={t('badges.editor.sections.criteria')}
					description={t('badges.editor.sections.criteriaDescription')}
					padding="md"
				>
					<Stack gap="md">
						{form.values.conditions.length > 0 && (
							<Stack gap="xs">
								{form.values.conditions.map((condition, index) => (
									<ConditionRow
										key={condition.id}
										index={index}
										condition={condition}
										allowedModes={['THRESHOLD', 'CONSECUTIVE', 'PERCENT_CHANGE']}
										onChange={(next: RuleCondition) => form.setFieldValue(`conditions.${index}`, next)}
										onRemove={() => form.removeListItem('conditions', index)}
										canRemove={form.values.conditions.length > 0}
									/>
								))}
							</Stack>
						)}

						<Button variant="light" size="xs" onClick={handleAddCondition}>
							{t('badges.editor.sections.criteria')}
						</Button>
					</Stack>
				</SectionCard>

				<SectionCard title={t('badges.editor.sections.settings')} padding="md">
					<Grid gap="md">
						<Grid.Col span={{ base: 12, md: 6 }}>
							<Select
								label={t('badges.editor.fields.area')}
								data={[
									...EVALUATION_AREAS.map((area) => ({
										value: area,
										label: t(`areas.${area}`),
									})),
									{ value: 'GENERAL', label: t('areas.GENERAL') },
								]}
								{...form.getInputProps('area')}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, md: 6 }}>
							<Select
								label={t('badges.editor.fields.tier')}
								data={[
									{ value: 'BRONZE', label: t('tiers.BRONZE') },
									{ value: 'SILVER', label: t('tiers.SILVER') },
									{ value: 'GOLD', label: t('tiers.GOLD') },
								]}
								{...form.getInputProps('tier')}
							/>
						</Grid.Col>
					</Grid>

					<Switch
						label={t('badges.editor.fields.autoAward')}
						description={t('badges.editor.fields.autoAwardHint')}
						mt="md"
						{...form.getInputProps('autoAward', { type: 'checkbox' })}
					/>

					<Switch
						label={t('badges.editor.fields.status')}
						mt="md"
						checked={form.values.status === 'ACTIVE'}
						onChange={(e) => form.setFieldValue('status', e.currentTarget.checked ? 'ACTIVE' : 'ARCHIVED')}
					/>
				</SectionCard>
			</Stack>

			<Group justify="flex-end" gap="xs" mt="md">
				<Button variant="subtle" onClick={handleCancel}>
					{t('common.cancel')}
				</Button>
				<Button onClick={handleSave}>{t('common.save')}</Button>
			</Group>
		</AppDrawer>
	);
}
