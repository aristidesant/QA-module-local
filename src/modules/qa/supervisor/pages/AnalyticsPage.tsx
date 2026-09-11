import React from 'react';
import { Container, Stack, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const AnalyticsPage: React.FC = () => {
	const { t } = useTranslation('common');

	return (
		<Container size='lg' py='lg'>
			<Stack gap='lg'>
				<div>
					<Title order={1} size='h2'>
						{t('sidebar.rolePreview.items.analytics')}
					</Title>
					<Text c='dimmed' mt='xs'>
						{t('rolePreview.placeholder.description')}
					</Text>
				</div>
			</Stack>
		</Container>
	);
};

export default AnalyticsPage;
