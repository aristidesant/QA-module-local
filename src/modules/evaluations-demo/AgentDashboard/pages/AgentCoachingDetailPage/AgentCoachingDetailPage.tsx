import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Badge,
	Button,
	Card,
	Container,
	Group,
	List,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from '@mantine/core';
import { IconArrowLeft, IconList } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { DEMO_COACHING_REPORTS } from '../../mockData';
import styles from './AgentCoachingDetailPage.module.css';

const AgentCoachingDetailPage: React.FC = () => {
	const { reportId } = useParams();
	const navigate = useNavigate();

	const report = useMemo(
		() => DEMO_COACHING_REPORTS.find((r) => r.id === reportId),
		[reportId]
	);

	if (!report) {
		return (
			<ContentContainer>
				<Stack align='center' justify='center' gap='lg' py='xl'>
					<Text size='lg'>Report not found</Text>
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

				<Container size='sm' className={styles.documentContainer}>
					<Stack gap='xl'>
						<div className={styles.header}>
							<Title order={2}>{report.campaign}</Title>
							<Text c='dimmed' size='sm'>
								Week of{' '}
								{new Date(report.weekStart).toLocaleDateString(
									'en-US',
									{
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									}
								)}{' '}
								–{' '}
								{new Date(report.weekEnd).toLocaleDateString(
									'en-US',
									{ month: 'long', day: 'numeric' }
								)}
							</Text>
							<Text size='sm' c='dimmed'>
								Agent Smith
							</Text>
						</div>

						<Card withBorder radius='md' p='lg'>
							<Stack gap='md'>
								<div>
									<Title order={3} mb='md'>
										Overview
									</Title>
									<Text>{report.sections.overview}</Text>
								</div>
							</Stack>
						</Card>

						<Card withBorder radius='md' p='lg'>
							<Stack gap='md'>
								<Title order={3}>Performance Metrics</Title>
								<Group grow>
									<div>
										<Text size='sm' fw={600} c='dimmed'>
											Calls Analyzed
										</Text>
										<Text size='lg' fw={700}>
											{
												report.sections.metrics
													.callsAnalyzed
											}
										</Text>
									</div>
									<div>
										<Text size='sm' fw={600} c='dimmed'>
											Average Score
										</Text>
										<Badge
											color='green'
											size='lg'
											variant='light'
										>
											{report.sections.metrics
												.avgScore}
											%
										</Badge>
									</div>
									<div>
										<Text size='sm' fw={600} c='dimmed'>
											Pass Rate
										</Text>
										<Text size='lg' fw={700}>
											{report.sections.metrics
												.passRate.toFixed(1)}
											%
										</Text>
									</div>
									<div>
										<Text size='sm' fw={600} c='dimmed'>
											Trend
										</Text>
										<Badge
											color='green'
											variant='light'
										>
											{report.sections.metrics.trends}
										</Badge>
									</div>
								</Group>
							</Stack>
						</Card>

						<Card withBorder radius='md' p='lg'>
							<Stack gap='md'>
								<Title order={3}>
									Coaching Suggestions
								</Title>
								<List
									spacing='md'
									size='sm'
									center
									icon={
										<ThemeIcon
											color='green'
											size={24}
											radius='xl'
										>
											<IconList size={16} />
										</ThemeIcon>
									}
								>
									{report.sections.suggestions.map(
										(suggestion, idx) => (
											<List.Item key={idx}>
												<Text>{suggestion}</Text>
											</List.Item>
										)
									)}
								</List>
							</Stack>
						</Card>

						<Card withBorder radius='md' p='lg'>
							<Stack gap='md'>
								<Title order={3}>Learning References</Title>
								<Text size='sm' c='dimmed'>
									Recommended learning materials:
								</Text>
								<Stack gap='sm'>
									{report.sections.lmsReferences.map(
										(ref, idx) => (
											<Group
												key={idx}
												p='md'
												onClick={() =>
													navigate(
														`/role-preview/agent-dashboard/lms/${ref.contentId}`
													)
												}
												{/* inline-style-allow: */}
												style={{
													border: '1px solid var(--mantine-color-gray-3)',
													borderRadius:
														'var(--mantine-radius-md)',
													backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
													cursor: 'pointer',
													padding: 'var(--mantine-spacing-md)',
												}}
											>
												{/* inline-style-allow: */}
													<Stack gap={0} style={{ flex: 1 }}>
													<Text fw={600} size='sm'>
														{ref.title}
													</Text>
													<Text
														size='xs'
														c='dimmed'
													>
														Click to view material
													</Text>
												</Stack>
												<Badge variant='light'>
													View
												</Badge>
											</Group>
										)
									)}
								</Stack>
							</Stack>
						</Card>
					</Stack>
				</Container>
			</Stack>
		</ContentContainer>
	);
};

export default AgentCoachingDetailPage;
