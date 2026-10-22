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
	IconShieldCheck,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { SectionCard } from '~/components/SectionCard';
import { COMPLIANCE_AREAS, COMPLIANCE_AREA_ORDER } from '../../constants';
import type {
	CallComplianceEvaluation,
	ComplianceItemStatus,
	TimelineAnchor,
} from '../../types';
import { flagTone, scoreTone } from './tone';
import { EvidenceQuote } from './EvidenceQuote';

interface CompliancePanelProps {
	compliance: CallComplianceEvaluation;
	/** Where each item happens in the call. Omit them where there is no player. */
	anchors?: TimelineAnchor[];
	activeAnchorId?: string | null;
	onJump?: (anchor: TimelineAnchor) => void;
}

const statusMeta: Record<
	ComplianceItemStatus,
	{ color: string; label: string; icon: ReactNode }
> = {
	compliant: {
		color: 'gray',
		label: 'Compliant',
		icon: <IconCircleCheck size={16} color='var(--mantine-color-dimmed)' />,
	},
	warning: {
		color: 'gray',
		label: 'Warning',
		icon: <IconAlertTriangle size={16} color='var(--mantine-color-dimmed)' />,
	},
	violation: {
		color: 'red',
		label: 'Violation',
		icon: <IconAlertOctagon size={16} color='var(--mantine-color-red-6)' />,
	},
};

export function CompliancePanel({
	compliance,
	anchors = [],
	activeAnchorId = null,
	onJump,
}: CompliancePanelProps) {
	return (
		<Stack gap='md'>
			{/* Header with ring */}
			<SectionCard padding='lg'>
				<Group align='center' gap='xl' wrap='nowrap'>
					<div>
						<RingProgress
							sections={[
								{
									value: compliance.overallScore,
									color: scoreTone(compliance.overallScore),
								},
							]}
							label={
								<Text fw={700} size='xl' ta='center'>
									{compliance.overallScore}%
								</Text>
							}
							size={124}
							thickness={12}
							roundCaps
						/>
					</div>
					<Stack gap={4} style={{ flex: 1 }}>
						<Text fw={600}>Compliance Score</Text>
						<Group gap='xs' wrap='wrap'>
							<Badge
								variant='light'
								color={statusMeta[compliance.status].color}
							>
								{statusMeta[compliance.status].label}
							</Badge>
							<Badge {...flagTone(compliance.violationCount > 0)}>
								{compliance.violationCount} violations
							</Badge>
							<Badge variant='light' color='gray'>
								{compliance.warningCount} warnings
							</Badge>
						</Group>
						<Text size='xs' c='dimmed'>
							Average of Security, Regulatory and Legal area scores
						</Text>
					</Stack>
				</Group>
			</SectionCard>

			{/* Areas */}
			<Stack gap='md'>
				{COMPLIANCE_AREA_ORDER.map((key) => {
					const areaMeta = COMPLIANCE_AREAS[key];
					const area = compliance.areas.find((a) => a.key === key)!;

					return (
						<SectionCard
							key={key}
							title={areaMeta.label}
							description={areaMeta.description}
							icon={IconShieldCheck}
							headerActions={
								<Badge color={scoreTone(area.score)} variant='light' size='lg'>
									{area.score}%
								</Badge>
							}
						>
							<Progress
								value={area.score}
								color={scoreTone(area.score)}
								size='sm'
								mb='sm'
							/>
							<Stack gap='xs'>
								{area.items.map((item) => {
									const itemStatus = statusMeta[item.status];
									const anchor = anchors.find((a) => a.refKey === item.key);
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
														<Badge
															variant={
																item.status === 'violation'
																	? 'light'
																	: 'outline'
															}
															color={itemStatus.color}
														>
															{itemStatus.label}
														</Badge>
														<Text size='sm' fw={600}>
															{item.score}%
														</Text>
													</Group>
												</Group>
											</Paper>
											{item.evidence && (
												<EvidenceQuote
													evidence={item.evidence}
													onPlay={
														anchor && onJump ? () => onJump(anchor) : undefined
													}
													active={!!anchor && anchor.id === activeAnchorId}
												/>
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
