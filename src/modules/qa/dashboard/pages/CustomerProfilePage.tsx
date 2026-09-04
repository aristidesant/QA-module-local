import React from 'react';
import { Stack, Title, Text, SimpleGrid, Avatar, Group, Badge } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { DashboardMetricCard } from '../components';

const CustomerProfilePage: React.FC = () => {
	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group align='flex-end'>
					<Avatar name='John Doe' size='lg' color='green' radius='md' />
					<div>
						<Title order={1}>John Doe</Title>
						<Text c='dimmed'>Customer ID: CUST-12847 • Account Status: Active</Text>
					</div>
				</Group>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='md'>
					<DashboardMetricCard
						label='Total Interactions'
						value={24}
						trend='up'
						trendValue='+3 this month'
					/>
					<DashboardMetricCard
						label='Overall NPS'
						value={8.5}
						unit='/10'
						progress={85}
						color='green'
						trend='up'
						trendValue='+0.5 vs last month'
					/>
					<DashboardMetricCard
						label='Primary Sentiment'
						value='Positive'
						progress={76}
						color='green'
					/>
					<DashboardMetricCard
						label='Avg Agent Rating'
						value={4.3}
						unit='/5.0'
						progress={86}
					/>
				</SimpleGrid>

				<SimpleGrid cols={{ base: 1, md: 2 }} spacing='lg'>
					<SectionCard
						title='Sentiment History'
						description='Emotional feedback trends'
					>
						<Stack gap='md'>
							<DashboardMetricCard
								label='Very Positive'
								value={35}
								unit='%'
							/>
							<DashboardMetricCard
								label='Positive'
								value={32}
								unit='%'
							/>
							<DashboardMetricCard
								label='Neutral'
								value={20}
								unit='%'
							/>
							<DashboardMetricCard
								label='Negative'
								value={13}
								unit='%'
							/>
						</Stack>
					</SectionCard>

					<SectionCard
						title='Contact History'
						description='Interactions with agents'
					>
						<Stack gap='md'>
							<DashboardMetricCard
								label='Last 7 Days'
								value={3}
								unit='calls'
							/>
							<DashboardMetricCard
								label='Last 30 Days'
								value={12}
								unit='calls'
							/>
							<DashboardMetricCard
								label='This Quarter'
								value={24}
								unit='calls'
							/>
							<DashboardMetricCard
								label='Avg Resolution Time'
								value={4.2}
								unit='mins'
							/>
						</Stack>
					</SectionCard>
				</SimpleGrid>

				<SectionCard
					title='Business Opportunities Identified'
					description='Potential upsell/cross-sell opportunities'
				>
					<Stack gap='sm'>
						{[
							{
								title: 'Unhandled Objection',
								description: 'Customer mentioned budget concerns but was not addressed',
								date: 'Sep 2, 2026',
							},
							{
								title: 'Best Time Frame Interest',
								description: 'Customer showed interest in yearly plan during call',
								date: 'Sep 1, 2026',
							},
							{
								title: 'Competitor Mentioned',
								description: 'Customer compared with competitor pricing',
								date: 'Aug 28, 2026',
							},
						].map((opp, idx) => (
							<div
								key={idx}
								style={{
									padding: '12px',
									borderBottom:
										idx < 2 ? '1px solid var(--mantine-color-gray-2)' : 'none',
								}}
							>
								<Group justify='space-between' mb='xs'>
									<Text size='sm' fw={500}>
										{opp.title}
									</Text>
									<Badge size='sm' variant='light'>
										Opportunity
									</Badge>
								</Group>
								<Text size='xs' c='dimmed'>
									{opp.description}
								</Text>
								<Text size='xs' c='dimmed' mt='xs'>
									{opp.date}
								</Text>
							</div>
						))}
					</Stack>
				</SectionCard>

				<SectionCard
					title='Recent Interactions'
					description='Calls and contacts'
				>
					<Stack gap='sm'>
						{[1, 2, 3, 4, 5].map(i => (
							<div
								key={i}
								style={{
									padding: '12px',
									borderBottom:
										i < 5 ? '1px solid var(--mantine-color-gray-2)' : 'none',
								}}
							>
								<Group justify='space-between'>
									<div>
										<Text size='sm' fw={500}>
											Call #{12500 - i}
										</Text>
										<Text size='xs' c='dimmed'>
											Agent: Sarah Johnson
										</Text>
									</div>
									<Badge
										color={i % 2 === 0 ? 'green' : 'blue'}
										variant='light'
									>
										{i % 2 === 0 ? 'Positive' : 'Neutral'}
									</Badge>
								</Group>
							</div>
						))}
					</Stack>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default CustomerProfilePage;
