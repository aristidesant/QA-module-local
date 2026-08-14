import React from 'react';
import {
	Stack,
	Card,
	Text,
	Group,
	Badge,
	Button,
	Title,
	Table,
	Progress,
	ThemeIcon,
	Alert,
} from '@mantine/core';
import {
	IconBriefcase,
	IconChecks,
	IconClipboardList,
	IconAlertCircle,
} from '@tabler/icons-react';

interface CoachingReport {
	id: string;
	date: string;
	topic: string;
	supervisor: string;
	status: 'in_progress' | 'completed' | 'scheduled';
}

interface TrainingModule {
	id: string;
	name: string;
	dueDate: string;
	progress: number;
	status: 'not_started' | 'in_progress' | 'completed';
}

interface Recommendation {
	id: string;
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
}

interface CoachingDevelopmentSectionProps {
	coachingReports?: CoachingReport[];
	trainingModules?: TrainingModule[];
	recommendations?: Recommendation[];
	onScheduleCoaching?: () => void;
	onAssignTraining?: () => void;
}

const CoachingDevelopmentSection: React.FC<CoachingDevelopmentSectionProps> = ({
	coachingReports = [],
	trainingModules = [],
	recommendations = [],
	onScheduleCoaching,
	onAssignTraining,
}) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
			case 'in_progress':
				return 'blue';
			case 'scheduled':
			case 'not_started':
				return 'gray';
			default:
				return 'gray';
		}
	};

	const getProgressColor = (progress: number) => {
		if (progress === 100) return 'green';
		if (progress >= 50) return 'blue';
		return 'orange';
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'red';
			case 'medium':
				return 'orange';
			case 'low':
				return 'blue';
			default:
				return 'gray';
		}
	};

	return (
		<Stack gap='lg'>
			{/* Coaching Reports Section */}
			<Card withBorder p='md'>
				<Stack gap='md'>
					<Group justify='space-between' align='center'>
						<Group gap='md'>
							<ThemeIcon size='lg' radius='md' variant='light' color='blue'>
								<IconBriefcase size={20} />
							</ThemeIcon>
							<Title order={4}>Coaching Reports</Title>
						</Group>
						<Button size='sm' onClick={onScheduleCoaching}>
							Schedule Coaching
						</Button>
					</Group>

					{coachingReports.length > 0 ? (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Date</Table.Th>
									<Table.Th>Topic</Table.Th>
									<Table.Th>Supervisor</Table.Th>
									<Table.Th>Status</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{coachingReports.map((report) => (
									<Table.Tr key={report.id}>
										<Table.Td>
											<Text size='sm'>{report.date}</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{report.topic}</Text>
										</Table.Td>
										<Table.Td>
											<Text size='sm'>{report.supervisor}</Text>
										</Table.Td>
										<Table.Td>
											<Badge
												size='sm'
												color={getStatusColor(report.status)}
												variant='light'
											>
												{report.status.replace('_', ' ')}
											</Badge>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					) : (
						<Text c='dimmed' size='sm' ta='center' py='md'>
							No coaching reports yet
						</Text>
					)}
				</Stack>
			</Card>

			{/* Training Assignments Section */}
			<Card withBorder p='md'>
				<Stack gap='md'>
					<Group justify='space-between' align='center'>
						<Group gap='md'>
							<ThemeIcon size='lg' radius='md' variant='light' color='green'>
								<IconClipboardList size={20} />
							</ThemeIcon>
							<Title order={4}>Training Assignments</Title>
						</Group>
						<Button size='sm' onClick={onAssignTraining}>
							Assign Training
						</Button>
					</Group>

					{trainingModules.length > 0 ? (
						<Stack gap='md'>
							{trainingModules.map((module) => (
								<div key={module.id}>
									<Group justify='space-between' mb='xs'>
										<div>
											<Text fw={500} size='sm'>
												{module.name}
											</Text>
											<Text size='xs' c='dimmed'>
												Due: {module.dueDate}
											</Text>
										</div>
										<Text size='sm' fw={700}>
											{module.progress}%
										</Text>
									</Group>
									<Progress
										value={module.progress}
										size='md'
										color={getProgressColor(module.progress)}
										mb='md'
									/>
								</div>
							))}
						</Stack>
					) : (
						<Text c='dimmed' size='sm' ta='center' py='md'>
							No training assignments yet
						</Text>
					)}
				</Stack>
			</Card>

			{/* Recommendations Section */}
			{recommendations.length > 0 && (
				<Card withBorder p='md'>
					<Stack gap='md'>
						<Group gap='md'>
							<ThemeIcon size='lg' radius='md' variant='light' color='orange'>
								<IconChecks size={20} />
							</ThemeIcon>
							<Title order={4}>Recommended Next Steps</Title>
						</Group>

						<Stack gap='md'>
							{recommendations.map((rec) => (
								<Alert
									key={rec.id}
									icon={<IconAlertCircle size={16} />}
									color={getPriorityColor(rec.priority)}
									variant='light'
									title={rec.title}
								>
									<Text size='sm'>{rec.description}</Text>
								</Alert>
							))}
						</Stack>
					</Stack>
				</Card>
			)}
		</Stack>
	);
};

export default CoachingDevelopmentSection;
