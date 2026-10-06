import {
	Badge,
	Group,
	Paper,
	Progress,
	RingProgress,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconAlertOctagon,
	IconAlertTriangle,
	IconCircleCheck,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { SectionCard } from '~/components/SectionCard';
import { ESG_PILLARS, ESG_PILLAR_ORDER } from '../../constants';
import type { CallEsgEvaluation, ComplianceItemStatus } from '../../types';
import { getScoreColor } from './scoreColor';
import { EvidenceQuote } from './EvidenceQuote';

interface EsgPanelProps {
	esg: CallEsgEvaluation;
}

const statusMeta: Record<
	ComplianceItemStatus,
	{ color: string; label: string; icon: ReactNode }
> = {
	compliant: {
		color: 'green',
		label: 'Compliant',
		icon: <IconCircleCheck size={16} color='var(--mantine-color-green-6)' />,
	},
	warning: {
		color: 'yellow',
		label: 'Warning',
		icon: <IconAlertTriangle size={16} color='var(--mantine-color-yellow-6)' />,
	},
	violation: {
		color: 'red',
		label: 'Violation',
		icon: <IconAlertOctagon size={16} color='var(--mantine-color-red-6)' />,
	},
};

export function EsgPanel({ esg }: EsgPanelProps) {
	return (
		<Stack gap='md'>
			{/* Header with ring */}
			<SectionCard padding='lg'>
				<Group align='center' gap='xl' wrap='nowrap'>
					<div>
						<RingProgress
							sections={[
								{
									value: esg.overallScore,
									color: getScoreColor(esg.overallScore),
								},
							]}
							label={
								<Text fw={700} size='xl' ta='center'>
									{esg.overallScore}%
								</Text>
							}
							size={124}
							thickness={12}
							roundCaps
						/>
					</div>
					<Stack gap={4} flex={1}>
						<Text fw={600}>ESG Score</Text>
						<Group gap='xs' wrap='wrap'>
							<Badge variant='filled' color={statusMeta[esg.status].color}>
								{statusMeta[esg.status].label}
							</Badge>
							<Badge
								variant='light'
								color={esg.violationCount ? 'red' : 'gray'}
							>
								{esg.violationCount} violations
							</Badge>
							<Badge
								variant='light'
								color={esg.warningCount ? 'yellow' : 'gray'}
							>
								{esg.warningCount} warnings
							</Badge>
						</Group>
						<Text size='xs' c='dimmed'>
							Average of Environmental, Social and Governance pillar scores
						</Text>
					</Stack>
				</Group>
			</SectionCard>

			{/* Pillars */}
			<Stack gap='md'>
				{ESG_PILLAR_ORDER.map((key) => {
					const meta = ESG_PILLARS[key];
					const pillar = esg.pillars.find((p) => p.key === key)!;

					return (
						<SectionCard
							key={key}
							title={meta.label}
							description={meta.description}
							icon={meta.icon}
							headerActions={
								<Badge
									color={getScoreColor(pillar.score)}
									variant='light'
									size='lg'
								>
									{pillar.score}%
								</Badge>
							}
						>
							<Progress
								value={pillar.score}
								color={getScoreColor(pillar.score)}
								size='sm'
								mb='sm'
							/>
							<Stack gap='xs'>
								{pillar.items.map((item) => {
									const itemStatus = statusMeta[item.status];
									return (
										<div key={item.key}>
											<Paper
												withBorder
												p='sm'
												radius='sm'
												mb={item.evidence ? 'xs' : 0}
											>
												<Group
													justify='space-between'
													align='flex-start'
													wrap='nowrap'
												>
													<Stack gap={2}>
														<Group gap='xs'>
															{itemStatus.icon}
															<Text size='sm' fw={500}>
																{item.label}
															</Text>
														</Group>
														{item.note && (
															<Text size='xs' c='dimmed'>
																{item.note}
															</Text>
														)}
													</Stack>
													<Group gap='xs'>
														<Badge variant='light' color={itemStatus.color}>
															{itemStatus.label}
														</Badge>
														<Text size='sm' fw={600}>
															{item.score}%
														</Text>
													</Group>
												</Group>
											</Paper>
											{item.evidence && (
												<EvidenceQuote evidence={item.evidence} />
											)}
										</div>
									);
								})}
							</Stack>
						</SectionCard>
					);
				})}
			</Stack>
		</Stack>
	);
}
