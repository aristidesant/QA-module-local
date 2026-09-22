import React from 'react';
import { Card, Stack, Group, Text, Progress, ThemeIcon } from '@mantine/core';
import { IconPhoneCall } from '@tabler/icons-react';
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
}

const pct = (part: number, total: number) =>
	total === 0 ? 0 : Math.round((part / total) * 100);

/** Card 4 of the Performance Score row: call volume and contact effectiveness. */
export const OperationalCard: React.FC<OperationalCardProps> = ({
	calls,
	effectiveContacts,
	nonEffectiveContacts,
	subtitle,
}) => {
	const effectivePct = pct(effectiveContacts, calls);
	const nonEffectivePct = pct(nonEffectiveContacts, calls);

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
					<div>
						<Group justify='space-between' mb={4}>
							<Text size='sm' fw={500}>
								Effective contacts
							</Text>
							<Group gap={6} wrap='nowrap'>
								<Text size='sm' fw={600}>
									{effectiveContacts}
								</Text>
								<Text size='xs' c='dimmed'>
									{effectivePct}%
								</Text>
							</Group>
						</Group>
						<Progress value={effectivePct} size='sm' color='green' />
					</div>

					<div>
						<Group justify='space-between' mb={4}>
							<Text size='sm' fw={500}>
								Non-effective contacts
							</Text>
							<Group gap={6} wrap='nowrap'>
								<Text size='sm' fw={600}>
									{nonEffectiveContacts}
								</Text>
								<Text size='xs' c='dimmed'>
									{nonEffectivePct}%
								</Text>
							</Group>
						</Group>
						<Progress value={nonEffectivePct} size='sm' color='gray' />
					</div>
				</Stack>
			</Stack>
		</Card>
	);
};

export default OperationalCard;
