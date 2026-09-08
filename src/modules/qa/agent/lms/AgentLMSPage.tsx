import React from 'react';
import { Stack, Title, Text, SimpleGrid, Card, Badge, Button, Group } from '@mantine/core';
import { IconBook, IconClipboardCheck, IconClock, IconTrophy } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';

/**
 * Agent LMS (Learning Management System) Page
 *
 * Displays training courses, certifications, and learning progress for the agent.
 * Mock page for prototype demonstration.
 */
export const AgentLMSPage: React.FC = () => {
	// Mock course data
	const courses = [
		{
			id: 1,
			title: 'Customer Service Fundamentals',
			progress: 85,
			status: 'in-progress' as const,
			completedModules: 17,
			totalModules: 20,
		},
		{
			id: 2,
			title: 'Advanced Communication Skills',
			progress: 100,
			status: 'completed' as const,
			completedModules: 15,
			totalModules: 15,
		},
		{
			id: 3,
			title: 'Product Knowledge Certification',
			progress: 45,
			status: 'in-progress' as const,
			completedModules: 9,
			totalModules: 20,
		},
		{
			id: 4,
			title: 'Compliance and Policy Training',
			progress: 0,
			status: 'not-started' as const,
			completedModules: 0,
			totalModules: 12,
		},
	];

	const getStatusBadge = (status: 'in-progress' | 'completed' | 'not-started') => {
		const colors = {
			'in-progress': 'blue',
			completed: 'green',
			'not-started': 'gray',
		};
		const labels = {
			'in-progress': 'In Progress',
			completed: 'Completed',
			'not-started': 'Not Started',
		};
		return <Badge color={colors[status]}>{labels[status]}</Badge>;
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				{/* Header */}
				<div>
					<Title order={1}>Learning Management System</Title>
					<Text c='dimmed' mt='xs'>
						Your training courses and certifications
					</Text>
				</div>

				{/* Stats Section */}
				<SimpleGrid cols={{ base: 1, md: 3 }} spacing='md'>
					<Card withBorder p='md' radius='md'>
						<Group justify='space-between' mb='md'>
							<Text size='sm' fw={500}>
								Courses Completed
							</Text>
							<IconTrophy size={20} style={{ color: 'var(--mantine-color-green-6)' }} />
						</Group>
						<Text fw={700} size='lg'>
							1 / 4
						</Text>
						<Text size='xs' c='dimmed' mt='xs'>
							25% of training complete
						</Text>
					</Card>

					<Card withBorder p='md' radius='md'>
						<Group justify='space-between' mb='md'>
							<Text size='sm' fw={500}>
								Current Progress
							</Text>
							<IconClock size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
						</Group>
						<Text fw={700} size='lg'>
							57%
						</Text>
						<Text size='xs' c='dimmed' mt='xs'>
							Average across all courses
						</Text>
					</Card>

					<Card withBorder p='md' radius='md'>
						<Group justify='space-between' mb='md'>
							<Text size='sm' fw={500}>
								Modules Completed
							</Text>
							<IconClipboardCheck size={20} style={{ color: 'var(--mantine-color-teal-6)' }} />
						</Group>
						<Text fw={700} size='lg'>
							41 / 67
						</Text>
						<Text size='xs' c='dimmed' mt='xs'>
							Across all courses
						</Text>
					</Card>
				</SimpleGrid>

				{/* Courses Section */}
				<SectionCard title='Available Courses' description='Enroll and track your learning progress'>
					<Stack gap='md'>
						{courses.map(course => (
							<Card key={course.id} withBorder p='md' radius='md'>
								<Group justify='space-between' mb='md' align='flex-start'>
									<div>
										<Group gap='xs' mb='xs'>
											<IconBook size={18} />
											<Title order={4}>{course.title}</Title>
										</Group>
										<Text size='sm' c='dimmed'>
											{course.completedModules} of {course.totalModules} modules completed
										</Text>
									</div>
									{getStatusBadge(course.status)}
								</Group>

								{/* Progress Bar */}
								<div
									style={{
										height: 8,
										backgroundColor: 'var(--mantine-color-gray-2)',
										borderRadius: 4,
										marginBottom: 12,
										overflow: 'hidden',
									}}
								>
									<div
										style={{
											height: '100%',
											width: `${course.progress}%`,
											backgroundColor:
												course.status === 'completed'
													? 'var(--mantine-color-green-6)'
													: 'var(--mantine-color-blue-6)',
											transition: 'width 0.3s ease',
										}}
									/>
								</div>

								<Text size='xs' fw={500} mb='md'>
									{course.progress}% Complete
								</Text>

								<Button
									size='sm'
									variant='light'
									disabled={course.status === 'completed'}
								>
									{course.status === 'completed' ? 'Completed' : 'Continue Learning'}
								</Button>
							</Card>
						))}
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default AgentLMSPage;
