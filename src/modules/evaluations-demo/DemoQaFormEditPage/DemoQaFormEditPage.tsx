import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Textarea,
	Select,
	Card,
} from '@mantine/core';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import { DEMO_QA_FORMS } from '../mockData';

const DemoQaFormEditPage: React.FC = () => {
	const { formId } = useParams();
	const navigate = useNavigate();

	const form = useMemo(() => DEMO_QA_FORMS.find((f) => f.id === formId), [formId]);

	const [formData, setFormData] = useState(form ? { ...form } : null);

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
							<Text size='lg' fw={700} mb='md'>
								Edit QA Form
							</Text>
							<Text size='sm' c='dimmed'>
								{formData.id}
							</Text>
						</div>

						<TextInput
							label='Form Name'
							placeholder='Enter form name'
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.currentTarget.value })
							}
						/>

						<Textarea
							label='Description'
							placeholder='Enter form description'
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.currentTarget.value })
							}
							minRows={3}
						/>

						<Select
							label='QA Type'
							placeholder='Select QA type'
							data={['Compliance', 'Quality', 'Customer Experience', 'Technical']}
							value={formData.qaType}
							onChange={(value) =>
								setFormData({ ...formData, qaType: value || 'Compliance' })
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
							label='Last Modified'
							placeholder='Last modified date'
							value={formData.lastModified}
							onChange={(e) =>
								setFormData({ ...formData, lastModified: e.currentTarget.value })
							}
						/>

						<TextInput
							label='Form Version'
							placeholder='Version number'
							value={formData.version}
							onChange={(e) =>
								setFormData({ ...formData, version: e.currentTarget.value })
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
