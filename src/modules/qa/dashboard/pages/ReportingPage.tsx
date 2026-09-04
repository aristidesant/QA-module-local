import React, { useState } from 'react';
import { Stack, Title, Text, SimpleGrid, Badge, Group, Button, Tabs } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { ReportBuilder } from '../components';

interface GeneratedReport {
	id: number;
	name: string;
	generatedDate: string;
	format: 'pdf' | 'csv' | 'excel';
	size: string;
	rows: number;
}

const ReportingPage: React.FC = () => {
	const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
		{
			id: 1,
			name: 'Weekly Team Report',
			generatedDate: 'Sep 3, 2026',
			format: 'pdf',
			size: '2.4 MB',
			rows: 847,
		},
		{
			id: 2,
			name: 'Monthly Compliance Summary',
			generatedDate: 'Sep 1, 2026',
			format: 'excel',
			size: '1.8 MB',
			rows: 2341,
		},
		{
			id: 3,
			name: 'Agent Performance Q3',
			generatedDate: 'Aug 25, 2026',
			format: 'pdf',
			size: '3.1 MB',
			rows: 1023,
		},
		{
			id: 4,
			name: 'Sentiment Trends - Last 30 Days',
			generatedDate: 'Aug 20, 2026',
			format: 'csv',
			size: '542 KB',
			rows: 5234,
		},
	]);

	const handleGenerateReport = (filter: any) => {
		console.log('Generating report with filter:', filter);
		alert('Report generation started! Check your email for the download link.');
	};

	const handleSaveTemplate = (filter: any, name: string) => {
		console.log('Saving template:', name, filter);
		alert(`Template "${name}" saved successfully!`);
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<div>
					<Title order={1}>Reports & Analytics</Title>
					<Text c='dimmed' mt='xs'>
						Create, download, and schedule custom reports
					</Text>
				</div>

				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='md'>
					<SectionCard title='Quick Stats' description='Report overview'>
						<Stack gap='md'>
							<div>
								<Text size='sm' c='dimmed'>
									Total Reports Generated
								</Text>
								<Text fw={700} size='lg'>
									{generatedReports.length}
								</Text>
							</div>
							<div>
								<Text size='sm' c='dimmed'>
									This Month
								</Text>
								<Text fw={700} size='lg'>
									{generatedReports.filter(r =>
										r.generatedDate.includes('Sep')
									).length}
								</Text>
							</div>
							<div>
								<Text size='sm' c='dimmed'>
									Average Size
								</Text>
								<Text fw={700} size='lg'>
									2.3 MB
								</Text>
							</div>
						</Stack>
					</SectionCard>

					<SectionCard
						title='Auto-Generation'
						description='Scheduled reports'
					>
						<Stack gap='md'>
							<div>
								<Text size='sm' c='dimmed'>
									Active Schedules
								</Text>
								<Text fw={700} size='lg'>
									2
								</Text>
							</div>
							<Stack gap='xs'>
								<Badge size='sm'>
									Weekly - Every Monday 9 AM
								</Badge>
								<Badge size='sm'>
									Monthly - 1st of month 8 AM
								</Badge>
							</Stack>
						</Stack>
					</SectionCard>

					<SectionCard
						title='Distribution'
						description='Email recipients'
					>
						<Stack gap='md'>
							<div>
								<Text size='sm' c='dimmed'>
									Active Recipients
								</Text>
								<Text fw={700} size='lg'>
									4
								</Text>
							</div>
							<Stack gap='xs'>
								<Badge size='sm' variant='dot'>
									qa1@company.com
								</Badge>
								<Badge size='sm' variant='dot'>
									supervisor@company.com
								</Badge>
							</Stack>
						</Stack>
					</SectionCard>
				</SimpleGrid>

				<Tabs defaultValue='builder'>
					<Tabs.List>
						<Tabs.Tab value='builder'>Build New Report</Tabs.Tab>
						<Tabs.Tab value='history'>Report History</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='builder' pt='lg'>
						<ReportBuilder
							onGenerateReport={handleGenerateReport}
							onSaveTemplate={handleSaveTemplate}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='history' pt='lg'>
						<SectionCard
							title='Generated Reports'
							description={`${generatedReports.length} reports`}
						>
							<Stack gap='md'>
								{generatedReports.map(report => (
									<div
										key={report.id}
										style={{
											padding: '12px',
											borderBottom:
												'1px solid var(--mantine-color-gray-2)',
										}}
									>
										<Group justify='space-between' align='flex-start'>
											<div>
												<Group gap='sm' mb='xs'>
													<Text fw={500} size='sm'>
														{report.name}
													</Text>
													<Badge
														color={
															report.format === 'pdf'
																? 'red'
																: report.format ===
																	  'excel'
																	? 'green'
																	: 'blue'
														}
														size='xs'
														variant='light'
													>
														{report.format.toUpperCase()}
													</Badge>
												</Group>
												<Text size='xs' c='dimmed'>
													Generated: {report.generatedDate}
													&nbsp;• {report.rows} rows • {report.size}
												</Text>
											</div>
											<Button
												size='xs'
												leftSection={
													<IconDownload size={14} />
												}
												variant='light'
												onClick={() =>
													alert(
														`Downloading ${report.name}...`
													)
												}
											>
												Download
											</Button>
										</Group>
									</div>
								))}
							</Stack>
						</SectionCard>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default ReportingPage;
