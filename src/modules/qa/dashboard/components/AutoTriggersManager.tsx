import React, { useState } from 'react';
import {
	Stack,
	Group,
	Button,
	Switch,
	Paper,
	Badge,
	Text,
	Tabs,
	ActionIcon,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

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

interface AutoTriggersManagerProps {
	triggers?: Trigger[];
	onSave?: (triggers: Trigger[]) => void;
}

export const AutoTriggersManager: React.FC<AutoTriggersManagerProps> = ({
	triggers: initialTriggers = [],
	onSave,
}) => {
	const [triggers, setTriggers] = useState<Trigger[]>(initialTriggers);

	const alertTriggers = triggers.filter(t => !t.isRecognition);
	const recognitionTriggers = triggers.filter(t => t.isRecognition);

	const handleAddTrigger = (isRecognition: boolean) => {
		const newTrigger: Trigger = {
			id: Date.now(),
			name: 'New Trigger',
			type: 'threshold',
			metric: 'qa_score',
			condition: '<',
			value: 70,
			enabled: true,
			isRecognition,
		};
		setTriggers([...triggers, newTrigger]);
	};

	const handleDelete = (id: number) => {
		setTriggers(triggers.filter(t => t.id !== id));
	};

	const handleToggle = (id: number) => {
		setTriggers(
			triggers.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
		);
	};

	const handleSave = () => {
		onSave?.(triggers);
	};

	const TriggerRow: React.FC<{ trigger: Trigger }> = ({ trigger }) => (
		<Paper p='md' radius='md' withBorder key={trigger.id}>
			<Group justify='space-between' align='flex-start'>
				<Stack gap='sm' style={{ flex: 1 }}>
					<Group gap='sm'>
						<Text fw={500} size='sm'>
							{trigger.name}
						</Text>
						<Badge
							color={trigger.isRecognition ? 'green' : 'red'}
							variant='light'
							size='sm'
						>
							{trigger.isRecognition ? 'Recognition' : 'Alert'}
						</Badge>
						<Badge
							color={trigger.type === 'threshold' ? 'blue' : 'orange'}
							variant='dot'
							size='sm'
						>
							{trigger.type}
						</Badge>
					</Group>

					<Group gap='xs'>
						<Text size='xs' c='dimmed'>
							{trigger.metric} {trigger.condition} {trigger.value}
						</Text>
					</Group>
				</Stack>

				<Group gap='xs'>
					<Switch
						checked={trigger.enabled}
						onChange={() => handleToggle(trigger.id)}
						label='Enabled'
						size='sm'
					/>
					<ActionIcon
						color='red'
						variant='subtle'
						onClick={() => handleDelete(trigger.id)}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</Group>
			</Group>
		</Paper>
	);

	return (
		<SectionCard
			title='Auto Triggers Configuration'
			description='Set up automatic alerts and recognition rules'
		>
			<Tabs defaultValue='alerts'>
				<Tabs.List>
					<Tabs.Tab value='alerts'>
						Alert Triggers ({alertTriggers.length})
					</Tabs.Tab>
					<Tabs.Tab value='recognition'>
						Recognition Triggers ({recognitionTriggers.length})
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='alerts' pt='lg'>
					<Stack gap='md'>
						{alertTriggers.length === 0 ? (
							<Text c='dimmed' ta='center' py='lg'>
								No alert triggers configured
							</Text>
						) : (
							alertTriggers.map(trigger => (
								<TriggerRow key={trigger.id} trigger={trigger} />
							))
						)}

						<Button
							leftSection={<IconPlus size={14} />}
							variant='light'
							onClick={() => handleAddTrigger(false)}
						>
							Add Alert Trigger
						</Button>

						<Stack gap='md' mt='md'>
							<Text fw={500} size='sm'>
								Trigger Types Available:
							</Text>
							<Stack gap='xs'>
								<Paper p='sm' bg='gray' radius='sm'>
									<Text size='xs' fw={500}>
										Threshold
									</Text>
									<Text size='xs' c='dimmed'>
										Alert when metric falls below/above a value
									</Text>
								</Paper>
								<Paper p='sm' bg='gray' radius='sm'>
									<Text size='xs' fw={500}>
										Trend
									</Text>
									<Text size='xs' c='dimmed'>
										Alert when metric declines X% vs previous period
									</Text>
								</Paper>
								<Paper p='sm' bg='gray' radius='sm'>
									<Text size='xs' fw={500}>
										Streak
									</Text>
									<Text size='xs' c='dimmed'>
										Alert after N consecutive evaluations below standard
									</Text>
								</Paper>
							</Stack>
						</Stack>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='recognition' pt='lg'>
					<Stack gap='md'>
						{recognitionTriggers.length === 0 ? (
							<Text c='dimmed' ta='center' py='lg'>
								No recognition triggers configured
							</Text>
						) : (
							recognitionTriggers.map(trigger => (
								<TriggerRow key={trigger.id} trigger={trigger} />
							))
						)}

						<Button
							leftSection={<IconPlus size={14} />}
							variant='light'
							color='green'
							onClick={() => handleAddTrigger(true)}
						>
							Add Recognition Trigger
						</Button>

						<Stack gap='md' mt='md'>
							<Text fw={500} size='sm'>
								Recognition Examples:
							</Text>
							<Stack gap='xs'>
								<Paper p='sm' bg='green' opacity={0.1} radius='sm'>
									<Text size='xs' fw={500}>
										Achievement Milestone
									</Text>
									<Text size='xs'>
										QA score ≥ 90% → Award badge
									</Text>
								</Paper>
								<Paper p='sm' bg='green' opacity={0.1} radius='sm'>
									<Text size='xs' fw={500}>
										Sentiment Excellence
									</Text>
									<Text size='xs'>
										3+ consecutive calls with "Very Positive"
										sentiment
									</Text>
								</Paper>
								<Paper p='sm' bg='green' opacity={0.1} radius='sm'>
									<Text size='xs' fw={500}>
										Compliance Perfection
									</Text>
									<Text size='xs'>
										Zero violations in 10 evaluations → Compliance
										Guardian badge
									</Text>
								</Paper>
							</Stack>
						</Stack>
					</Stack>
				</Tabs.Panel>
			</Tabs>

			<Group justify='flex-end' mt='lg'>
				<Button variant='default' onClick={() => setTriggers(initialTriggers)}>
					Cancel
				</Button>
				<Button onClick={handleSave}>Save Configuration</Button>
			</Group>
		</SectionCard>
	);
};
