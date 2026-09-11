import React from 'react';
import { Stack, Title, Text } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { AutoTriggersManager } from '../components';

interface Trigger {
	id: number;
	name: string;
	type: 'threshold' | 'trend' | 'streak';
	metric: string;
	condition: string;
	value: number;
	enabled: boolean;
	isRecognition: boolean;
}

const AutoTriggersPage: React.FC = () => {
	const initialTriggers: Trigger[] = [
		{
			id: 1,
			name: 'Low QA Score Alert',
			type: 'threshold',
			metric: 'qa_score',
			condition: '<',
			value: 70,
			enabled: true,
			isRecognition: false,
		},
		{
			id: 2,
			name: 'Performance Decline',
			type: 'trend',
			metric: 'qa_score',
			condition: '↓',
			value: 10,
			enabled: true,
			isRecognition: false,
		},
		{
			id: 3,
			name: 'Consecutive Low Scores',
			type: 'streak',
			metric: 'qa_score',
			condition: '<70%',
			value: 3,
			enabled: true,
			isRecognition: false,
		},
		{
			id: 4,
			name: 'QA Excellence Badge',
			type: 'threshold',
			metric: 'qa_score',
			condition: '≥',
			value: 90,
			enabled: true,
			isRecognition: true,
		},
		{
			id: 5,
			name: 'Sentiment Champion',
			type: 'streak',
			metric: 'sentiment',
			condition: 'very_positive',
			value: 3,
			enabled: true,
			isRecognition: true,
		},
	];

	const handleSaveTriggers = (triggers: Trigger[]) => {
		console.log('Saving triggers:', triggers);
		// In a real app, this would call the API
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Auto Triggers Configuration</Title>
					<Text c='dimmed' mt='xs'>
						Configure automatic alerts and recognition rules for your team
					</Text>
				</div>

				<SectionCard
					title='How Auto Triggers Work'
					description='Automatically generate alerts and badges'
				>
					<Stack gap='md'>
						<div>
							<Text fw={500} size='sm' mb='xs'>
								Alert Triggers (Red Flag 🚨)
							</Text>
							<Text size='sm' c='dimmed'>
								When an agent's performance falls below configured thresholds,
								a system alert is automatically created. Alerts notify the
								supervisor and agent via in-app, email, and dashboard badges.
								Examples:
							</Text>
							<ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
								<li>QA Score drops below 70%</li>
								<li>3+ consecutive evaluations below standard</li>
								<li>Score declines 10% vs previous week</li>
								<li>Compliance violation detected</li>
							</ul>
						</div>

						<div>
							<Text fw={500} size='sm' mb='xs'>
								Recognition Triggers (Gold Star ⭐)
							</Text>
							<Text size='sm' c='dimmed'>
								When an agent achieves excellence, the system automatically
								awards badges and sends recognition notifications. Examples:
							</Text>
							<ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px' }}>
								<li>QA Score ≥ 90% → QA Excellence badge</li>
								<li>
									3+ consecutive calls with "Very Positive" sentiment →
									Sentiment Champion badge
								</li>
								<li>
									Zero compliance violations in 10 calls → Compliance
									Guardian badge
								</li>
								<li>
									Highest team score this month → Leaderboard spotlight
								</li>
							</ul>
						</div>

						<div>
							<Text fw={500} size='sm' mb='xs'>
								Role-Based Configuration
							</Text>
							<Text size='sm' c='dimmed'>
								QA Managers set global thresholds for the entire client.
								Supervisors can customize rules for their team within the
								QA Manager's limits. This ensures consistency while allowing
								team-specific adjustments.
							</Text>
						</div>
					</Stack>
				</SectionCard>

				<AutoTriggersManager
					triggers={initialTriggers}
					onSave={handleSaveTriggers}
				/>

				<SectionCard
					title='Trigger Distribution'
					description='How alerts and recognition are routed'
				>
					<Stack gap='md'>
						<div>
							<Text fw={500} size='sm' mb='xs'>
								Alert Channels
							</Text>
							<Stack gap='xs'>
								<Text size='sm'>
									✓ <strong>In-App Inbox</strong> - Immediate notification in
									the Alerts dashboard
								</Text>
								<Text size='sm'>
									✓ <strong>Email</strong> - Configurable email to agent,
									supervisor, QA Manager
								</Text>
								<Text size='sm'>
									✓ <strong>Dashboard Badge</strong> - Visible in team rankings
									and agent profile
								</Text>
							</Stack>
						</div>

						<div>
							<Text fw={500} size='sm' mb='xs'>
								Recognition Notifications
							</Text>
							<Stack gap='xs'>
								<Text size='sm'>
									✓ <strong>Badge Award</strong> - Displayed in agent profile
									+ team leaderboard
								</Text>
								<Text size='sm'>
									✓ <strong>In-App Notification</strong> - "You earned QA
									Excellence badge!"
								</Text>
								<Text size='sm'>
									✓ <strong>Team Shout-Out</strong> - Optional public
									recognition in team channel
								</Text>
							</Stack>
						</div>
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default AutoTriggersPage;
