import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Stack, Group, Text, Progress, ThemeIcon } from '@mantine/core';
import { IconChevronRight, IconPhoneCall } from '@tabler/icons-react';
import DrillRow from './DrillRow';
import styles from '../Dashboard.module.css';

interface OperationalCardProps {
	/** Total calls taken or made in the window. */
	calls: number;
	/** Calls where the intended contact was actually reached and engaged. */
	effectiveContacts: number;
	/** Calls that didn't connect with the intended contact. */
	nonEffectiveContacts: number;
	/** Short line under the card title, used to scope the card per role */
	subtitle?: string;
	/** Opens the non-effective calls behind the number, when there are any. */
	onNonEffectiveClick?: () => void;
}

const pct = (part: number, total: number) =>
	total === 0 ? 0 : Math.round((part / total) * 100);

/** Card 4 of the Performance Score row: call volume and contact effectiveness. */
export const OperationalCard: React.FC<OperationalCardProps> = ({
	calls,
	effectiveContacts,
	nonEffectiveContacts,
	subtitle,
	onNonEffectiveClick,
}) => {
	const { t } = useTranslation('qa.dashboard');
	const effectivePct = pct(effectiveContacts, calls);
	const nonEffectivePct = pct(nonEffectiveContacts, calls);
	const clickable = Boolean(onNonEffectiveClick) && nonEffectiveContacts > 0;

	return (
		<Card
			className={styles.metricCard}
			p='lg'
			radius='md'
			withBorder
			shadow='sm'
			h='100%'
		>
			<Stack gap='md' h='100%'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<div>
						<Text fw={600} size='md'>
							Operational
						</Text>
						{subtitle && (
							<Text size='xs' c='dimmed'>
								{subtitle}
							</Text>
						)}
					</div>
					<ThemeIcon size='lg' color='gray' radius='md'>
						<IconPhoneCall size={20} />
					</ThemeIcon>
				</Group>

				<Group gap='xs' align='baseline'>
					<Text className={styles.scoreValue}>{calls}</Text>
					<Text size='sm' c='dimmed'>
						calls taken or made
					</Text>
				</Group>

				<Stack gap='sm'>
					<DrillRow hint={t('drill.hint')}>
						<Group justify='space-between' mb={4}>
							<Text size='sm' fw={500}>
								Effective contacts
							</Text>
							<Group gap={6} wrap='nowrap'>
								<Text size='sm' fw={600}>
									{effectivePct}%
								</Text>
								<Text size='xs' c='dimmed'>
									{t('drill.calls', { count: effectiveContacts })}
								</Text>
							</Group>
						</Group>
						<Progress value={effectivePct} size='sm' color='green' />
					</DrillRow>

					<DrillRow
						onClick={clickable ? onNonEffectiveClick : undefined}
						hint={t('drill.hint')}
					>
						<Group justify='space-between' mb={4}>
							<Text size='sm' fw={500}>
								Non-effective contacts
							</Text>
							<Group gap={6} wrap='nowrap'>
								<Text size='sm' fw={600}>
									{nonEffectivePct}%
								</Text>
								<Text size='xs' c='dimmed'>
									{t('drill.calls', { count: nonEffectiveContacts })}
								</Text>
								{clickable && <IconChevronRight size={14} />}
							</Group>
						</Group>
						<Progress value={nonEffectivePct} size='sm' color='gray' />
					</DrillRow>
				</Stack>
			</Stack>
		</Card>
	);
};

export default OperationalCard;
