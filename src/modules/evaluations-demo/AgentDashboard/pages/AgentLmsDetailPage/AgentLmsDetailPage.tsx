import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Badge,
	Button,
	Card,
	Group,
	Progress,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { DEMO_LMS_CONTENTS } from '../../mockData';
import styles from './AgentLmsDetailPage.module.css';

const AgentLmsDetailPage: React.FC = () => {
	const { contentId } = useParams();
	const navigate = useNavigate();

	const content = useMemo(
		() => DEMO_LMS_CONTENTS.find((c) => c.id === contentId),
		[contentId]
	);

	if (!content) {
		return (
			<ContentContainer>
				<Stack align='center' justify='center' gap='lg' py='xl'>
					<Text size='lg'>Material not found</Text>
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

				<Card withBorder radius='md' p='lg'>
					<Stack gap='md'>
						<div>
							<Group justify='space-between' align='flex-start' mb='md'>
								<div>
									<Title order={2}>{content.title}</Title>
									<Text size='sm' c='dimmed'>
										{content.type}
									</Text>
								</div>
								<Badge
									color={content.mandatory ? 'red' : 'gray'}
									variant='light'
									size='lg'
								>
									{content.mandatory
										? 'Mandatory'
										: 'Optional'}
								</Badge>
							</Group>

							<Group gap='xl'>
								{content.durationMin && (
									<div>
										<Text size='sm' fw={600} c='dimmed'>
											Duration
										</Text>
										<Text size='lg'>
											{content.durationMin} minutes
										</Text>
									</div>
								)}
								{content.deadline && (
									<div>
										<Text size='sm' fw={600} c='dimmed'>
											Deadline
										</Text>
										<Text size='lg'>
											{new Date(
												content.deadline
											).toLocaleDateString(
												'en-US',
												{
													month: 'short',
													day: 'numeric',
													year: 'numeric',
												}
											)}
										</Text>
									</div>
								)}
							</Group>
						</div>
					</Stack>
				</Card>

				<Card withBorder radius='md' p='lg'>
					<Stack gap='md'>
						<div>
							<Text size='sm' fw={600} mb='sm'>
								Progress
							</Text>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' c='dimmed'>
									Completion
								</Text>
								<Text size='sm' fw={600}>
									{content.completionPercent || 0}%
								</Text>
							</Group>
							<Progress
								value={content.completionPercent || 0}
								color={
									content.completed
										? 'green'
										: content.completionPercent &&
										  content.completionPercent > 0
										? 'blue'
										: 'gray'
								}
								size='lg'
								radius='md'
							/>
						</div>
					</Stack>
				</Card>

				<Card withBorder radius='md' p='lg' className={styles.viewer}>
					<Stack align='center' justify='center' gap='lg' py='xl'>
{/* inline-style-allow: */}
						<div style={{ textAlign: 'center' }}>
							<Text size='lg' fw={600}>
								{content.type} Content
							</Text>
							<Text size='sm' c='dimmed' mt='xs'>
								[{content.type} Preview - {content.title}]
							</Text>
						</div>
						<Text size='sm' c='dimmed'>
							This is a mockup preview. In production, this would
							display a{' '}
							{content.type === 'Video'
								? 'video player'
								: content.type === 'PDF'
								? 'PDF viewer'
								: content.type === 'Course'
								? 'course player'
								: 'article content'}
							.
						</Text>
					</Stack>
				</Card>

				<Group grow>
					<Button variant='default' disabled>
						<IconDownload size={18} />
						Download
					</Button>
					<Button color='green' disabled={content.completed}>
						{content.completed
							? 'Completed ✓'
							: 'Mark Complete'}
					</Button>
				</Group>
			</Stack>
		</ContentContainer>
	);
};

export default AgentLmsDetailPage;
