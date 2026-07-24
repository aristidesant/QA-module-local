import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { ROLE_PREVIEW_PLACEHOLDERS } from '~/constants/rolePreviewPlaceholders';

const RolePreviewPlaceholderPage: React.FC = () => {
	const { section } = useParams<{ section: string }>();
	const { t } = useTranslation('common');

	const config = section ? ROLE_PREVIEW_PLACEHOLDERS[section] : undefined;
	const title = config
		? t(config.titleKey)
		: t('rolePreview.placeholder.genericTitle');

	return (
		<SectionCard
			icon={config?.icon}
			title={title}
			description={t('rolePreview.placeholder.description')}
		/>
	);
};

export default RolePreviewPlaceholderPage;
