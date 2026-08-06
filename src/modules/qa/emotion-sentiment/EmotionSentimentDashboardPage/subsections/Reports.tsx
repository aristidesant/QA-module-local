import { useState } from 'react';
import { Stack, Card, Text, Badge, Button, Group, Table, Select, Checkbox, Modal } from '@mantine/core';
import { IconDownload, IconMail, IconFileText, IconClock, IconSettings, IconPlus } from '@tabler/icons-react';

const mockReportTemplates = [
	{
		id: 1,
		name: 'Weekly Sentiment Summary',
		description: 'High-level sentiment trends and top insights',
		icon: '📊',
	},
	{
		id: 2,
		name: 'Campaign Performance Report',
		description: 'Detailed sentiment analysis by campaign',
		icon: '📈',
	},
	{
		id: 3,
		name: 'Agent Empathy Scorecard',
		description: 'Individual agent performance metrics',
		icon: '👤',
	},
	{
		id: 4,
		name: 'Risk Assessment Report',
		description: 'At-risk agents and recommendations',
		icon: '⚠️',
	},
];

const mockReportHistory = [
	{
		id: 1,
		name: 'Weekly Summary - Week 32',
		generated: '2026-08-05',
		recipient: 'team@company.com',
		status: 'sent',
		format: 'PDF',
	},
	{
		id: 2,
		name: 'Campaign Performance - Aug',
		generated: '2026-08-02',
		recipient: 'manager@company.com',
		status: 'downloaded',
		format: 'Excel',
	},
	{
		id: 3,
		name: 'Empathy Scorecard - July',
		generated: '2026-07-28',
		recipient: 'team@company.com',
		status: 'created',
		format: 'PDF',
	},
	{
		id: 4,
		name: 'Risk Assessment - Jul',
		generated: '2026-07-21',
		recipient: 'leadership@company.com',
		status: 'sent',
		format: 'PDF',
	},
];

const getStatusColor = (status: string) => {
	if (status === 'sent') return 'green';
	if (status === 'downloaded') return 'blue';
	return 'gray';
};

export function Reports() {
	const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
	const [isConfigureTemplateModalOpen, setIsConfigureTemplateModalOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<typeof mockReportTemplates[0] | null>(null);

	return (
		<>
			{/* Configure Template Modal */}
			<Modal
				opened={isConfigureTemplateModalOpen}
				onClose={() => {
					setIsConfigureTemplateModalOpen(false);
					setSelectedTemplate(null);
				}}
				title={selectedTemplate ? `Configure: ${selectedTemplate.name}` : 'Create New Template'}
				centered
				size='lg'
			>
				<Stack gap='md'>
					<Select
						label='Template Name'
						placeholder='Enter template name...'
						defaultValue={selectedTemplate?.name}
						data={mockReportTemplates.map((t) => ({ value: t.name, label: t.name }))}
						searchable
					/>
					<Select
						label='Report Type'
						placeholder='Select report type...'
						data={[
							'Sentiment Summary',
							'Campaign Performance',
							'Agent Scorecard',
							'Risk Assessment',
							'Custom Report',
						]}
					/>
					<Text size='sm' fw={500}>
						Report Components
					</Text>
					<Group gap='xs'>
						<Checkbox label='Sentiment Metrics' defaultChecked />
						<Checkbox label='Agent Performance' defaultChecked />
						<Checkbox label='Campaign Analysis' />
						<Checkbox label='Risk Alerts' />
					</Group>
					<Select
						label='Default Frequency'
						placeholder='Select frequency...'
						data={['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly']}
					/>
					<Group justify='flex-end' gap='xs'>
						<Button
							variant='default'
							onClick={() => {
								setIsConfigureTemplateModalOpen(false);
								setSelectedTemplate(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setIsConfigureTemplateModalOpen(false);
								setSelectedTemplate(null);
							}}
						>
							Save Template
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Schedule Reports Modal */}
			<Modal
				opened={isScheduleModalOpen}
				onClose={() => setIsScheduleModalOpen(false)}
				title='Schedule Report'
				centered
			>
				<Stack gap='md'>
					<Select
						label='Select Report Template'
						placeholder='Choose a template...'
						data={mockReportTemplates.map((t) => ({
							value: t.id.toString(),
							label: t.name,
						}))}
					/>
					<Select
						label='Frequency'
						placeholder='Select frequency...'
						data={['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly']}
					/>
					<Select
						label='Day of Week'
						placeholder='Select day...'
						data={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
					/>
					<Group gap='xs'>
						<Checkbox label='Send via Email' defaultChecked />
						<Checkbox label='Include Attachments' defaultChecked />
					</Group>
					<Group justify='flex-end' gap='xs'>
						<Button variant='default' onClick={() => setIsScheduleModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={() => setIsScheduleModalOpen(false)}>
							Schedule Report
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Templates Section */}
			<Stack gap='md'>
				<Card withBorder radius='md' p='md'>
					<Card.Section withBorder inheritPadding py='md'>
						<Group justify='space-between'>
							<Text fw={600} size='lg'>
								Report Templates
							</Text>
							<Button
								size='sm'
								variant='light'
								leftSection={<IconPlus size={16} />}
								onClick={() => {
									setSelectedTemplate(null);
									setIsConfigureTemplateModalOpen(true);
								}}
							>
								Create Template
							</Button>
						</Group>
					</Card.Section>
					<Card.Section inheritPadding pb='md'>
						{/* inline-style-allow: */}
					<div style={{ overflowX: 'auto' }}>
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Icon</Table.Th>
										<Table.Th>Template Name</Table.Th>
										<Table.Th>Description</Table.Th>
										<Table.Th>Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{mockReportTemplates.map((template) => (
										<Table.Tr key={template.id}>
											<Table.Td>
												<Text size='xl'>{template.icon}</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<Text fw={500}>{template.name}</Text>
													<Badge size='sm' variant='light'>
														Template
													</Badge>
												</Group>
											</Table.Td>
											<Table.Td>
												<Text size='sm' c='dimmed'>
													{template.description}
												</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<Button
														size='xs'
														variant='light'
														leftSection={<IconSettings size={14} />}
														onClick={() => {
															setSelectedTemplate(template);
															setIsConfigureTemplateModalOpen(true);
														}}
													>
														Configure
													</Button>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>
					</Card.Section>
				</Card>

				{/* Reports Table */}
				<Card withBorder radius='md' p='md'>
					<Card.Section withBorder inheritPadding py='md'>
						<Group justify='space-between'>
							<Text fw={600} size='lg'>
								Reports
							</Text>
							<Group gap='xs'>
								<Badge color='blue'>{mockReportHistory.length} Reports</Badge>
								<Button
									size='sm'
									variant='light'
									leftSection={<IconClock size={16} />}
									onClick={() => setIsScheduleModalOpen(true)}
								>
									Schedule Report
								</Button>
							</Group>
						</Group>
					</Card.Section>
					<Card.Section inheritPadding pb='md'>
						{/* inline-style-allow: */}
					<div style={{ overflowX: 'auto' }}>
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Report Name</Table.Th>
										<Table.Th>Generated</Table.Th>
										<Table.Th>Recipient</Table.Th>
										<Table.Th>Status</Table.Th>
										<Table.Th>Format</Table.Th>
										<Table.Th>Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{mockReportHistory.map((report) => (
										<Table.Tr key={report.id}>
											<Table.Td>
												<Group gap='xs'>
													<IconFileText size={16} />
													<Text size='sm'>{report.name}</Text>
												</Group>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{report.generated}</Text>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{report.recipient}</Text>
											</Table.Td>
											<Table.Td>
												<Badge color={getStatusColor(report.status)} size='sm'>
													{report.status.charAt(0).toUpperCase() + report.status.slice(1)}
												</Badge>
											</Table.Td>
											<Table.Td>
												<Text size='sm'>{report.format}</Text>
											</Table.Td>
											<Table.Td>
												<Group gap='xs'>
													<Button
														size='xs'
														variant='subtle'
														leftSection={<IconDownload size={14} />}
													>
														Download
													</Button>
													<Button
														size='xs'
														variant='subtle'
														leftSection={<IconMail size={14} />}
													>
														Email
													</Button>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</div>
					</Card.Section>
				</Card>
			</Stack>
		</>
	);
}
