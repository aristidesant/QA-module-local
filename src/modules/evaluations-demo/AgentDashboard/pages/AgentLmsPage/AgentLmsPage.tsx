import React from 'react';
import { Stack, Title, Text, Alert } from '@mantine/core';
import { useNavigate } from 'react-router';
import { IconAlertCircle } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import BaseTable from '~/components/BaseTable';
import { useLmsColumns } from './useLmsColumns';
import { DEMO_LMS_CONTENTS } from '../../mockData';

const AgentLmsPage: React.FC = () => {
	const navigate = useNavigate();
	const columns = useLmsColumns();

	const mandatoryMaterials = DEMO_LMS_CONTENTS.filter((c) => c.mandatory);
	const incompleteMandatory = mandatoryMaterials.filter(
		(c) => !c.completed
	);

	return (
		<ContentContainer>
			<Stack gap='lg'>
				<div>
					<Title order={2} mb='xs'>
						Learning Materials
					</Title>
					<Text size='sm' c='dimmed'>
						Access educational resources and training modules
					</Text>
				</div>

				{incompleteMandatory.length > 0 && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						title='Pending Mandatory Materials'
						color='orange'
						variant='light'
					>
						You have {incompleteMandatory.length} mandatory{' '}
						{incompleteMandatory.length === 1
							? 'material'
							: 'materials'}{' '}
						to complete. Please review them by the deadline.
					</Alert>
				)}

				<BaseTable
					data={DEMO_LMS_CONTENTS}
					columns={columns}
					getRowId={(content) => content.id}
					density='compact'
					filterMode='client'
					onRowClick={(content) =>
						navigate(
							`/role-preview/agent-dashboard/lms/${content.id}`
						)
					}
				/>

				<Text size='sm' c='dimmed'>
					{DEMO_LMS_CONTENTS.length} materials available
					{' · '}
					{DEMO_LMS_CONTENTS.filter((c) => c.mandatory).length}{' '}
					mandatory
					{' · '}
					{DEMO_LMS_CONTENTS.filter((c) => c.completed).length}{' '}
					completed
				</Text>
			</Stack>
		</ContentContainer>
	);
};

export default AgentLmsPage;
