import React, { useState } from 'react';
import {
	Stack,
	Group,
	Select,
	MultiSelect,
	Button,
	Checkbox,
	Tabs,
	Text,
	Badge,
	Paper,
	TextInput,
} from '@mantine/core';
import { IconDownload, IconBell } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';

interface ReportFilter {
	campaigns: string[];
	supervisors: string[];
	evaluationType: string;
	dateFrom: string;
	dateTo: string;
	metrics: string[];
	format: 'pdf' | 'csv' | 'excel';
	autoGenerate: boolean;
	generateSchedule?: 'daily' | 'weekly' | 'monthly';
	emailRecipients: string[];
}

interface ReportBuilderProps {
	onGenerateReport?: (filter: ReportFilter) => void;
	onSaveTemplate?: (filter: ReportFilter, name: string) => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
	onGenerateReport,
	onSaveTemplate,
}) => {
	const [filter, setFilter] = useState<ReportFilter>({
		campaigns: [],
		supervisors: [],
		evaluationType: 'all',
		dateFrom: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
		dateTo: new Date().toISOString().split('T')[0],
		metrics: ['qa_score', 'sentiment', 'compliance'],
		format: 'pdf',
		autoGenerate: false,
		emailRecipients: [],
	});

	const [templateName, setTemplateName] = useState('');

	const handleGenerate = () => {
		onGenerateReport?.(filter);
	};

	const handleSaveTemplate = () => {
		if (templateName.trim()) {
			onSaveTemplate?.(filter, templateName);
			setTemplateName('');
		}
	};

	return (
		<SectionCard
			title='Report Builder'
			description='Create flexible reports with custom filters'
		>
			<Tabs defaultValue='filters'>
				<Tabs.List>
					<Tabs.Tab value='filters'>Filters</Tabs.Tab>
					<Tabs.Tab value='metrics'>Metrics</Tabs.Tab>
					<Tabs.Tab value='delivery'>Delivery</Tabs.Tab>
					<Tabs.Tab value='templates'>Saved Templates</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='filters' pt='lg'>
					<Stack gap='md'>
						<div>
							<Text fw={500} size='sm' mb='xs'>
								Date Range
							</Text>
							<Group grow>
								<TextInput
									label='From'
									type='date'
									value={filter.dateFrom}
									onChange={e =>
										setFilter({ ...filter, dateFrom: e.currentTarget.value })
									}
								/>
								<TextInput
									label='To'
									type='date'
									value={filter.dateTo}
									onChange={e =>
										setFilter({ ...filter, dateTo: e.currentTarget.value })
									}
								/>
							</Group>
						</div>

						<MultiSelect
							label='Campaigns'
							placeholder='All campaigns'
							data={[
								{ value: 'q3_cs', label: 'Q3 Customer Service' },
								{ value: 'sales_training', label: 'Sales Training' },
								{ value: 'q2_program', label: 'Q2 Training Program' },
							]}
							value={filter.campaigns}
							onChange={campaigns =>
								setFilter({ ...filter, campaigns })
							}
							searchable
							clearable
						/>

						<MultiSelect
							label='Supervisors'
							placeholder='All supervisors'
							data={[
								{ value: 'david_m', label: 'David Martinez' },
								{ value: 'lisa_w', label: 'Lisa Wong' },
								{ value: 'james_w', label: 'James Wilson' },
							]}
							value={filter.supervisors}
							onChange={supervisors =>
								setFilter({ ...filter, supervisors })
							}
							searchable
							clearable
						/>

						<Select
							label='Evaluation Type'
							data={[
								{ value: 'all', label: 'All Types' },
								{ value: 'qa', label: 'QA Only' },
								{ value: 'sentiment', label: 'Sentiment Only' },
								{ value: 'compliance', label: 'Compliance Only' },
								{
									value: 'business',
									label: 'Business Insights Only',
								},
							]}
							value={filter.evaluationType}
							onChange={type =>
								setFilter({
									...filter,
									evaluationType: type || 'all',
								})
							}
						/>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='metrics' pt='lg'>
					<Stack gap='md'>
						<Text size='sm' c='dimmed'>
							Select which metrics to include in the report
						</Text>
						<Checkbox
							label='QA Score'
							checked={filter.metrics.includes('qa_score')}
							onChange={e => {
								const metrics = e.currentTarget.checked
									? [...filter.metrics, 'qa_score']
									: filter.metrics.filter(m => m !== 'qa_score');
								setFilter({ ...filter, metrics });
							}}
						/>
						<Checkbox
							label='Sentiment & Emotion'
							checked={filter.metrics.includes('sentiment')}
							onChange={e => {
								const metrics = e.currentTarget.checked
									? [...filter.metrics, 'sentiment']
									: filter.metrics.filter(m => m !== 'sentiment');
								setFilter({ ...filter, metrics });
							}}
						/>
						<Checkbox
							label='Compliance'
							checked={filter.metrics.includes('compliance')}
							onChange={e => {
								const metrics = e.currentTarget.checked
									? [...filter.metrics, 'compliance']
									: filter.metrics.filter(m => m !== 'compliance');
								setFilter({ ...filter, metrics });
							}}
						/>
						<Checkbox
							label='Business Insights'
							checked={filter.metrics.includes('business')}
							onChange={e => {
								const metrics = e.currentTarget.checked
									? [...filter.metrics, 'business']
									: filter.metrics.filter(m => m !== 'business');
								setFilter({ ...filter, metrics });
							}}
						/>
						<Checkbox
							label='Agent Performance'
							checked={filter.metrics.includes('performance')}
							onChange={e => {
								const metrics = e.currentTarget.checked
									? [...filter.metrics, 'performance']
									: filter.metrics.filter(m => m !== 'performance');
								setFilter({ ...filter, metrics });
							}}
						/>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='delivery' pt='lg'>
					<Stack gap='md'>
						<Select
							label='Export Format'
							data={[
								{ value: 'pdf', label: 'PDF (Formatted)' },
								{ value: 'excel', label: 'Excel' },
								{ value: 'csv', label: 'CSV' },
							]}
							value={filter.format}
							onChange={format =>
								setFilter({
									...filter,
									format: (format || 'pdf') as typeof filter.format,
								})
							}
						/>

						<Checkbox
							label='Auto-generate this report'
							checked={filter.autoGenerate}
							onChange={e =>
								setFilter({ ...filter, autoGenerate: e.currentTarget.checked })
							}
						/>

						{filter.autoGenerate && (
							<Select
								label='Generation Schedule'
								data={[
									{ value: 'daily', label: 'Daily' },
									{ value: 'weekly', label: 'Weekly' },
									{ value: 'monthly', label: 'Monthly' },
								]}
								value={filter.generateSchedule}
								onChange={schedule =>
									setFilter({
										...filter,
										generateSchedule: schedule as any,
									})
								}
							/>
						)}

						<MultiSelect
							label='Email Recipients'
							placeholder='Add email addresses'
							data={[
								{ value: 'qa1@company.com', label: 'qa1@company.com' },
								{
									value: 'qa2@company.com',
									label: 'qa2@company.com',
								},
								{
									value: 'supervisor@company.com',
									label: 'supervisor@company.com',
								},
							]}
							value={filter.emailRecipients}
							onChange={recipients =>
								setFilter({ ...filter, emailRecipients: recipients })
							}
							searchable
						/>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='templates' pt='lg'>
					<Stack gap='md'>
						<Text size='sm' c='dimmed'>
							Save current report configuration as a template for future use
						</Text>

						<Group grow>
							<input
								type='text'
								placeholder='Template name (e.g., "Weekly Team Report")'
								value={templateName}
								onChange={e => setTemplateName(e.target.value)}
								style={{
									padding: '8px 12px',
									border: '1px solid var(--mantine-color-gray-3)',
									borderRadius: '4px',
								}}
							/>
							<Button onClick={handleSaveTemplate} variant='light'>
								Save as Template
							</Button>
						</Group>

						<div>
							<Text fw={500} size='sm' mb='md'>
								Existing Templates
							</Text>
							<Stack gap='sm'>
								<Paper p='md' radius='md' withBorder>
									<Group justify='space-between'>
										<div>
											<Text fw={500} size='sm'>
												Weekly Team Report
											</Text>
											<Text size='xs' c='dimmed'>
												Last generated: Sep 3, 2026
											</Text>
										</div>
										<Group gap='xs'>
											<Badge size='sm'>7 days</Badge>
											<Button size='xs' variant='light'>
												Use
											</Button>
										</Group>
									</Group>
								</Paper>
								<Paper p='md' radius='md' withBorder>
									<Group justify='space-between'>
										<div>
											<Text fw={500} size='sm'>
												Monthly Compliance Report
											</Text>
											<Text size='xs' c='dimmed'>
												Last generated: Sep 1, 2026
											</Text>
										</div>
										<Group gap='xs'>
											<Badge size='sm'>30 days</Badge>
											<Button size='xs' variant='light'>
												Use
											</Button>
										</Group>
									</Group>
								</Paper>
							</Stack>
						</div>
					</Stack>
				</Tabs.Panel>
			</Tabs>

			<Group justify='flex-end' mt='lg' gap='sm'>
				<Button
					leftSection={<IconBell size={14} />}
					variant='subtle'
					onClick={() => console.log('Configure notifications')}
				>
					Notifications
				</Button>
				<Button
					leftSection={<IconDownload size={14} />}
					onClick={handleGenerate}
				>
					Generate Report
				</Button>
			</Group>
		</SectionCard>
	);
};
