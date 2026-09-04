import React from 'react';
import {
	Stack,
	Title,
	Text,
	SimpleGrid,
	Group,
	Avatar,
	Badge,
	Tabs,
} from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	DashboardMetricCard,
	TranscriptWithMarkers,
	AudioPlayerWithClipping,
} from '../components';

interface Marker {
	id: number;
	startTime: number;
	endTime: number;
	type: 'violation' | 'opportunity' | 'note';
	label: string;
	description: string;
	evaluatorComment: string;
	suggestion: string;
}

interface TranscriptSegment {
	id: number;
	timestamp: number;
	speaker: 'agent' | 'customer';
	text: string;
	markerId?: number;
}

const CallDetailPage: React.FC = () => {
	const transcriptSegments: TranscriptSegment[] = [
		{
			id: 1,
			timestamp: 0,
			speaker: 'agent',
			text: 'Good morning, this is Sarah from Acme Corp. How can I help you today?',
		},
		{
			id: 2,
			timestamp: 15,
			speaker: 'customer',
			text: 'Hi Sarah, I have a question about my recent order. The tracking says it arrived but I did not receive it.',
		},
		{
			id: 3,
			timestamp: 35,
			speaker: 'agent',
			text: 'I understand your frustration. Let me look into that for you.',
		},
		{
			id: 4,
			timestamp: 55,
			speaker: 'agent',
			text: 'I see the issue here. The package was marked delivered but there was a routing error. Unfortunately, I can only refund your money - I cannot reship the package.',
		},
		{
			id: 5,
			timestamp: 85,
			speaker: 'customer',
			text: 'That is not acceptable. I need a replacement, not a refund.',
		},
		{
			id: 6,
			timestamp: 105,
			speaker: 'agent',
			text: 'I apologize, but our policy does not allow reshipping in this case. You can use the refund to purchase again.',
		},
	];

	const markers: Marker[] = [
		{
			id: 1,
			startTime: 55,
			endTime: 85,
			type: 'violation',
			label: 'Unhandled Objection',
			description: 'Customer expressed strong dissatisfaction but objection was not resolved',
			evaluatorComment: 'Agent did not explore alternative solutions or escalate to supervisor.',
			suggestion:
				'When a customer is upset, acknowledge their feelings and offer alternatives. Consider: "Let me check with my supervisor if we can make an exception in this case."',
		},
		{
			id: 2,
			startTime: 35,
			endTime: 55,
			type: 'opportunity',
			label: 'Early Objection Detection',
			description: 'Customer frustration was evident early in the call',
			evaluatorComment: 'Agent could have identified and addressed concerns proactively.',
			suggestion:
				'Ask clarifying questions earlier: "When did you expect to receive it?" This helps gather info faster.',
		},
	];

	const audioClips = [
		{
			id: 1,
			label: 'Unhandled Objection (55-85s)',
			startTime: 55,
			endTime: 85,
			description:
				'Customer clearly states dissatisfaction and agent does not offer solutions',
		},
		{
			id: 2,
			label: 'Policy Limitation (85-105s)',
			startTime: 85,
			endTime: 105,
			description: 'Agent repeatedly cites policy without exploring alternatives',
		},
	];

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Group gap='md' align='flex-start'>
						<Avatar name='Sarah Johnson' size='lg' color='blue' radius='md' />
						<div>
							<Title order={1}>Call #12451</Title>
							<Text c='dimmed'>
								Agent: Sarah Johnson • Customer: John Doe
							</Text>
							<Text size='sm' c='dimmed' mt='xs'>
								Sep 3, 2026 • 10:45 AM • Duration: 4:32
							</Text>
						</div>
					</Group>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='QA Score'
						value={72}
						unit='%'
						progress={72}
						trend='down'
						trendValue='-5% vs agent avg'
						color='orange'
					/>
					<DashboardMetricCard
						label='Sentiment'
						value='Negative'
						progress={35}
						color='red'
					/>
					<DashboardMetricCard
						label='Compliance'
						value={95}
						unit='%'
						progress={95}
						color='green'
					/>
					<DashboardMetricCard
						label='Handle Time'
						value={4}
						unit='min 32s'
					/>
				</SimpleGrid>

				<SectionCard
					title='Evaluation Summary'
					description='QA Manager Assessment'
				>
					<Stack gap='md'>
						<div>
							<Group mb='xs'>
								<Text fw={500} size='sm'>
									QA Assessment
								</Text>
								<Badge color='orange' variant='light'>
									Below Standard
								</Badge>
							</Group>
							<Text size='sm' c='dimmed'>
								Agent failed to handle customer objection effectively and did not
								explore alternative solutions. Multiple opportunities for improvement
								identified in transcript.
							</Text>
						</div>

						<div>
							<Group mb='xs'>
								<Text fw={500} size='sm'>
									Key Issues
								</Text>
							</Group>
							<Stack gap='xs'>
								<Text size='sm'>
									• Unhandled objection - Customer remained upset
								</Text>
								<Text size='sm'>
									• Limited problem-solving - Only offered refund, no alternatives
								</Text>
								<Text size='sm'>
									• Policy over customer - Focused on constraints instead of solutions
								</Text>
							</Stack>
						</div>

						<div>
							<Group mb='xs'>
								<Text fw={500} size='sm'>
									Coaching Suggestion
								</Text>
							</Group>
							<Text size='sm' c='dimmed'>
								Consider practicing empathy statements and asking "what if" questions
								to explore alternatives before citing policy limitations. An escalation
								might have resulted in a better outcome.
							</Text>
						</div>
					</Stack>
				</SectionCard>

				<Tabs defaultValue='transcript'>
					<Tabs.List>
						<Tabs.Tab value='transcript'>Transcript</Tabs.Tab>
						<Tabs.Tab value='audio'>Audio</Tabs.Tab>
						<Tabs.Tab value='evaluation'>Full Evaluation</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='transcript' pt='lg'>
						<TranscriptWithMarkers
							segments={transcriptSegments}
							markers={markers}
							onMarkerClick={marker =>
								console.log('Marker clicked:', marker)
							}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='audio' pt='lg'>
						<AudioPlayerWithClipping
							audioUrl='https://example.com/call-12451.mp3'
							duration={272}
							clips={audioClips}
							onClipSelect={clip => console.log('Clip selected:', clip)}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='evaluation' pt='lg'>
						<SectionCard
							title='Complete Evaluation Details'
							description='All evaluation metrics'
						>
							<Tabs defaultValue='qa'>
								<Tabs.List>
									<Tabs.Tab value='qa'>QA</Tabs.Tab>
									<Tabs.Tab value='sentiment'>Sentiment</Tabs.Tab>
									<Tabs.Tab value='compliance'>
										Compliance
									</Tabs.Tab>
									<Tabs.Tab value='business'>
										Business Insights
									</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value='qa' pt='md'>
									<Stack gap='sm'>
										<Text fw={500} size='sm'>
											QA Method: COPC
										</Text>
										<Group>
											<Badge>Error Type: Handling</Badge>
											<Badge>Error Type: Empathy</Badge>
											<Badge>Error Type: Closing</Badge>
										</Group>
										<Text size='sm' c='dimmed'>
											Agent made 3 errors during this call,
											resulting in a score of 72%.
										</Text>
									</Stack>
								</Tabs.Panel>

								<Tabs.Panel value='sentiment' pt='md'>
									<Stack gap='sm'>
										<Text fw={500} size='sm'>
											Overall Sentiment: Negative
										</Text>
										<Text size='sm'>
											Customer Emotion: Frustrated
										</Text>
										<Text size='sm' c='dimmed'>
											The customer's sentiment deteriorated
											throughout the call as their concern
											remained unresolved.
										</Text>
										<Text size='sm' fw={500} mt='md'>
											Forecast NPS: 3/10 (Detractor)
										</Text>
									</Stack>
								</Tabs.Panel>

								<Tabs.Panel value='compliance' pt='md'>
									<Stack gap='sm'>
										<Text fw={500} size='sm'>
											Compliance Score: 95%
										</Text>
										<Badge color='green'>
											All required disclosures made
										</Badge>
										<Badge color='green'>
											Privacy protocol followed
										</Badge>
										<Text size='sm' c='dimmed'>
											No regulatory violations detected.
										</Text>
									</Stack>
								</Tabs.Panel>

								<Tabs.Panel value='business' pt='md'>
									<Stack gap='sm'>
										<Text fw={500} size='sm'>
											Opportunities Identified:
										</Text>
										<Stack gap='xs'>
											<Group>
												<Badge color='blue'>
													Unhandled Objection
												</Badge>
												<Text size='sm'>
													Could have offered alternative
													solutions
												</Text>
											</Group>
											<Group>
												<Badge color='blue'>
													Churn Risk
												</Badge>
												<Text size='sm'>
													Customer likely to switch providers
												</Text>
											</Group>
										</Stack>
									</Stack>
								</Tabs.Panel>
							</Tabs>
						</SectionCard>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default CallDetailPage;
