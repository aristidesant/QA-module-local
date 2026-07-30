import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Select,
	Card,
	Badge,
} from '@mantine/core';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { DEMO_QA_FORMS, type DemoQaForm } from '../DemoQaFormsListPage/mockQaForms';

const DemoQaFormEditPage: React.FC = () => {
	const { formId } = useParams();
	const navigate = useNavigate();

	const form = useMemo(() => DEMO_QA_FORMS.find((f) => f.id === formId), [formId]);

	const [formData, setFormData] = useState<DemoQaForm | null>(form ? { ...form } : null);

	if (!form || !formData) {
		return (
			<ContentContainer>
				<Stack align='center' justify='center' gap='lg' py='xl'>
					<Text size='lg'>Form not found</Text>
					<Button onClick={() => navigate(-1)}>Go back</Button>
				</Stack>
			</ContentContainer>
		);
	}

	const handleSave = () => {
		// For demo purposes, just show a success message and navigate back
		navigate(-1);
	};

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
							<Group justify='space-between' mb='md'>
								<div>
									<Text size='lg' fw={700} mb='xs'>
										Edit QA Form
									</Text>
									<Text size='sm' c='dimmed'>
										ID: {formData.id}
									</Text>
								</div>
								<Badge color={formData.status === 'Ready' ? 'green' : 'yellow'}>
									{formData.status}
								</Badge>
							</Group>
						</div>

						<TextInput
							label='Test Name'
							placeholder='Enter test name'
							value={formData.testName}
							onChange={(e) =>
								setFormData({ ...formData, testName: e.currentTarget.value })
							}
						/>

						<Select
							label='QA Type'
							placeholder='Select QA type'
							data={[
								'Sales',
								'Localization',
								'Retention',
								'Activation',
								'Accounts Receivable',
								'Compliance',
							]}
							value={formData.qaType}
							onChange={(value) =>
								setFormData({ ...formData, qaType: value || 'Sales' })
							}
						/>

						<TextInput
							label='Created By'
							placeholder='Author name'
							value={formData.createdBy}
							onChange={(e) =>
								setFormData({ ...formData, createdBy: e.currentTarget.value })
							}
						/>

						<TextInput
							label='Created Date'
							placeholder='Date (YYYY-MM-DD)'
							value={formData.createdDate}
							onChange={(e) =>
								setFormData({ ...formData, createdDate: e.currentTarget.value })
							}
						/>

						<Select
							label='Status'
							placeholder='Select status'
							data={[
								{ value: 'Ready', label: 'Ready' },
								{ value: 'Draft', label: 'Draft' },
							]}
							value={formData.status}
							onChange={(value) =>
								setFormData({
									...formData,
									status: (value as 'Ready' | 'Draft') || 'Draft',
								})
							}
						/>

						<Group justify='flex-end' mt='lg'>
							<Button variant='default' onClick={() => navigate(-1)}>
								Cancel
							</Button>
							<Button
								leftSection={<IconCheck size={18} />}
								onClick={handleSave}
								color='green'
							>
								Save Changes
							</Button>
						</Group>
					</Stack>
				</Card>
			</Stack>
		</ContentContainer>
	);
};

export default DemoQaFormEditPage;
