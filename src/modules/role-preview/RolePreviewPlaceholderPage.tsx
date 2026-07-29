import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { IconClock } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { ROLE_PREVIEW_PLACEHOLDERS } from '~/constants/rolePreviewPlaceholders';

const RolePreviewPlaceholderPage: React.FC = () => {
	const { section } = useParams<{ section: string }>();
	const { t } = useTranslation('common');

	const config = section ? ROLE_PREVIEW_PLACEHOLDERS[section] : undefined;
	const Icon = config?.icon ?? IconClock;
	const title = config
		? t(config.titleKey)
		: t('rolePreview.placeholder.genericTitle');

	return (
		<SectionCard icon={config?.icon} title={title}>
			<EmptyState
				icon={<Icon size={48} stroke={1.5} />}
				message={t('rolePreview.placeholder.genericTitle')}
				description={t('rolePreview.placeholder.description')}
			/>
		</SectionCard>
	);
};

export default RolePreviewPlaceholderPage;
