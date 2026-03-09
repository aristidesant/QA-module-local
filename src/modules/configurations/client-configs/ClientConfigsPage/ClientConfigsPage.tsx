import { useState } from 'react';
import { IconSettings } from '@tabler/icons-react';
import SectionCard, { type CardActionsConfig } from '~/components/SectionCard';
import { ClientConfigsContent } from '../ClientConfigsContent';
import { useTranslation } from 'react-i18next';

export default function ClientConfigsPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);
	const { t } = useTranslation('client-configs');

	const sectionActions: CardActionsConfig = {
		primary: {
			kind: 'add',
			label: t('page.actions.create'),
			onClick: () => setCreateModalOpened(true),
		},
	};

	return (
		<SectionCard
			title={t('page.title')}
			description={t('page.description')}
			icon={IconSettings}
			actions={sectionActions}
		>
			<ClientConfigsContent
				createModalOpened={createModalOpened}
				setCreateModalOpened={setCreateModalOpened}
			/>
		</SectionCard>
	);
}
