import { Group, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { CoachingSessionRecord } from '~/models/qa';
import { Caption } from '~/modules/qa/coaching/components/SessionBrief';
import { weakestDimension } from '~/modules/qa/coaching/helpers';
import { DIMENSION_META, DIMENSION_ORDER } from '~/modules/qa/team/constants';
import type { AgentProfile } from '~/modules/qa/team/types';
import { DeltaText } from './details';
import styles from './AutomatedCoachingMessage.module.css';

interface AutomatedCoachingMessageProps {
	session: CoachingSessionRecord;
	profile: AgentProfile;
}

/**
 * The weekly automated coaching message as scannable data: a greeting, last
 * week's score per dimension (tinted with the dimension's color) and the
 * focus the agent should work on. The attached material is not repeated here;
 * the "Learning material" card below it already lists it.
 */
export function AutomatedCoachingMessage({
	session,
	profile,
}: AutomatedCoachingMessageProps) {
	const { t } = useTranslation(['qa.inbox', 'qa.team']);
	const firstName = profile.agent.name.split(' ')[0];
	const weakest = weakestDimension(profile);
	const byKey = new Map(profile.dimensions.map((d) => [d.key, d]));

	return (
		<SectionCard
			icon={IconSparkles}
			title={t('details.automated.title')}
			padding='md'
		>
			<Stack gap='md'>
				<Text size='sm'>
					{t('details.automated.greeting', {
						name: firstName,
						rule: session.topic,
					})}
				</Text>

				<Stack gap='xs'>
					<Caption>{t('details.automated.scores')}</Caption>
					<SimpleGrid cols={{ base: 2, sm: 4 }} spacing='xs'>
						{DIMENSION_ORDER.map((key) => {
							const meta = DIMENSION_META[key];
							const d = byKey.get(key);
							if (!d) return null;
							const Icon = meta.icon;
							return (
								<Stack
									key={key}
									gap={6}
									className={styles.tile}
									data-color={meta.color}
									data-focus={key === weakest?.key ? '' : undefined}
								>
									<Group gap={6} wrap='nowrap'>
										<ThemeIcon
											size='sm'
											variant='light'
											color={meta.color}
											radius='xl'
										>
											<Icon size={14} />
										</ThemeIcon>
										<Caption>{t(meta.labelKey, { ns: 'qa.team' })}</Caption>
									</Group>
									<Text size='xl' fw={700} lh={1.1}>
										{d.score}
										<Text span size='sm' fw={500} c='dimmed'>
											{meta.unit}
										</Text>
									</Text>
									<Group gap={6} wrap='wrap'>
										<DeltaText value={d.delta} suffix={meta.unit} />
										<Text size='xs' c='dimmed'>
											{t('details.automated.vsLastWeek')}
										</Text>
									</Group>
								</Stack>
							);
						})}
					</SimpleGrid>
				</Stack>

				{weakest && (
					<Stack
						gap={4}
						className={styles.focus}
						data-color={DIMENSION_META[weakest.key].color}
					>
						<Caption>{t('details.automated.focusLabel')}</Caption>
						<Text size='md' fw={600}>
							{t(DIMENSION_META[weakest.key].labelKey, { ns: 'qa.team' })}
						</Text>
						<Text size='sm' lh={1.6} maw='68ch'>
							{t('details.automated.focusTip')}
						</Text>
					</Stack>
				)}
			</Stack>
		</SectionCard>
	);
}

export default AutomatedCoachingMessage;
