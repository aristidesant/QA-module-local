import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconSettings, IconPlus } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { ClientConfigsContent } from '../ClientConfigsContent';
import { useTranslation } from 'react-i18next';

export default function ClientConfigsPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);
	const { t } = useTranslation('client-configs');

	return (
		<ContentContainer
			title={t('page.title')}
			description={t('page.description')}
			titleIcon={<IconSettings size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					{t('page.actions.create')}
				</Button>
			}
		>
			<ClientConfigsContent
				createModalOpened={createModalOpened}
				setCreateModalOpened={setCreateModalOpened}
			/>
		</ContentContainer>
	);
}
