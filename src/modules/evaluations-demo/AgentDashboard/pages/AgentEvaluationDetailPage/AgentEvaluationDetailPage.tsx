import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Badge,
	Button,
	Card,
	Grid,
	Group,
	Stack,
	Text,
	Title,
	ThemeIcon,
} from '@mantine/core';
import { IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { DEMO_AGENT_CALLS } from '../../mockData';
import styles from './AgentEvaluationDetailPage.module.css';

const AgentEvaluationDetailPage: React.FC = () => {
	const { callId } = useParams();
	const navigate = useNavigate();

	const call = useMemo(
		() => DEMO_AGENT_CALLS.find((c) => c.id === callId),
		[callId]
	);

	if (!call) {
		return (
			<ContentContainer>
				<Stack align='center' justify='center' gap='lg' py='xl'>
					<Text size='lg'>Call not found</Text>
					<Button onClick={() => navigate(-1)}>Go back</Button>
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<Stack gap='lg'>
				<Group mb='md'>
					<Button
						variant='subtle'
						leftSection={<IconArrowLeft size={18} />}
						onClick={() => navigate(-1)}
					>
						Back
					</Button>
				</Group>

				<Card withBorder radius='md' p='lg' className={styles.detailCard}>
					<Stack gap='md'>
						<div>
							<Title order={2} mb='xs'>
								Call Details
							</Title>
							<Text size='sm' c='dimmed'>
								{new Date(call.callDate).toLocaleDateString(
									'en-US',
									{
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									}
								)}
							</Text>
						</div>

						<Grid gap='md'>
							<Grid.Col span={{ base: 12, sm: 6 }}>
								<div>
									<Text size='sm' fw={600} c='dimmed'>
										Campaign
									</Text>
									<Text size='lg'>{call.campaign}</Text>
								</div>
							</Grid.Col>
							<Grid.Col span={{ base: 12, sm: 6 }}>
								<div>
									<Text size='sm' fw={600} c='dimmed'>
										Duration
									</Text>
									<Text size='lg'>
										{Math.floor(call.duration / 60)}:
										{String(call.duration % 60).padStart(
											2,
											'0'
										)}
									</Text>
								</div>
							</Grid.Col>
						</Grid>
					</Stack>
				</Card>

				<Card withBorder radius='md' p='lg'>
					<Stack gap='md'>
						<div>
							<Title order={3} mb='md'>
								Summary
							</Title>
							<Group grow>
								<div>
									<Text size='sm' fw={600} c='dimmed'>
										Score
									</Text>
									<Badge
										color={
											call.score >= 80
												? 'green'
												: call.score >= 60
													? 'yellow'
													: 'red'
										}
										size='lg'
										variant='light'
									>
										{call.score}%
									</Badge>
								</div>
								<div>
									<Text size='sm' fw={600} c='dimmed'>
										Result
									</Text>
									<Group gap='xs'>
										<ThemeIcon
											color={
												call.result ===
												'passed'
													? 'green'
													: 'red'
											}
											variant='light'
											size='lg'
										>
											{call.result ===
											'passed' ? (
												<IconCheck size={18} />
											) : (
												<IconX size={18} />
											)}
										</ThemeIcon>
										<Text size='lg' fw={600}>
											{call.result.charAt(0).toUpperCase() +
												call.result.slice(1)}
										</Text>
									</Group>
								</div>
							</Group>
						</div>

						<Group grow>
							<div>
								<Text size='sm' fw={600} c='dimmed'>
									Type
								</Text>
								<Badge variant='light'>
									{call.evaluationType}
								</Badge>
							</div>
							<div>
								<Text size='sm' fw={600} c='dimmed'>
									Dispute Status
								</Text>
								<Badge
									color={call.disputed ? 'orange' : 'gray'}
									variant='light'
								>
									{call.disputed
										? 'Disputed'
										: 'Not Disputed'}
								</Badge>
							</div>
						</Group>
					</Stack>
				</Card>

				{call.evaluationDetails.length > 0 && (
					<Card withBorder radius='md' p='lg'>
						<Stack gap='md'>
							<Title order={3}>Evaluation Breakdown</Title>
							{call.evaluationDetails.map((section, idx) => (
								<div key={idx}>
									<Text fw={600} mb='sm'>
										{section.section}
									</Text>
									<Stack gap='xs'>
										{section.items.map((item, itemIdx) => (
											<Group
												key={itemIdx}
												justify='space-between'
												p='sm'
{/* inline-style-allow: */}
												style={{
													border: '1px solid var(--mantine-color-gray-3)',
													borderRadius:
														'var(--mantine-radius-sm)',
													backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
												}}
											>
												<Text size='sm'>
													{item.name}
												</Text>
												<Badge variant='light'>
													{item.score}/
													{item.maxPoints}
												</Badge>
											</Group>
										))}
									</Stack>
								</div>
							))}
						</Stack>
					</Card>
				)}

				{call.transcript.length > 0 && (
					<Card withBorder radius='md' p='lg'>
						<Stack gap='md'>
							<Title order={3}>Transcript</Title>
							<div className={styles.transcript}>
								{call.transcript.map((turn, idx) => (
									<div
										key={idx}
{/* inline-style-allow: */}
										style={{
											marginBottom:
												'var(--mantine-spacing-md)',
										}}
									>
										<Group gap='xs' mb='xs'>
											<Badge
												size='sm'
												color={
													turn.speaker ===
													'agent'
														? 'blue'
														: 'gray'
												}
											>
												{turn.speaker.charAt(0).toUpperCase() +
													turn.speaker.slice(1)}
											</Badge>
											<Text size='xs' c='dimmed'>
												{Math.floor(
													turn.timestamp / 60
												)}:
												{String(
													turn.timestamp % 60
												).padStart(2, '0')}
											</Text>
										</Group>
										<Text size='sm'>{turn.text}</Text>
									</div>
								))}
							</div>
						</Stack>
					</Card>
				)}
			</Stack>
		</ContentContainer>
	);
};

export default AgentEvaluationDetailPage;
