import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Timeline } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import { useDateFormatter } from '~/modules/qa/hooks/useFormatters';
import {
	selectEvaluationVersions,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';

interface VersionHistoryDrawerProps {
	opened: boolean;
	onClose: () => void;
}

/** Every saved evaluation configuration, newest first. */
export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
	opened,
	onClose,
}) => {
	const { t } = useTranslation('qa.globalConfig');
	const versions = useGlobalConfigStore(selectEvaluationVersions);
	const dateTime = useDateFormatter('dateTime');

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='md'
			icon={<IconHistory size={20} />}
			title={t('evaluation.history.title')}
			description={t('evaluation.history.description')}
		>
			<Timeline active={0} bulletSize={18} lineWidth={2} color='gray'>
				{versions.map((entry) => (
					<Timeline.Item
						key={entry.version}
						title={t('common.version', { n: entry.version })}
					>
						<Text size='sm'>{entry.summary}</Text>
						<Text size='xs' c='dimmed'>
							{t('evaluation.history.savedBy', {
								who: entry.savedBy,
								when: dateTime.format(new Date(entry.savedAt)),
							})}
						</Text>
					</Timeline.Item>
				))}
			</Timeline>
		</AppDrawer>
	);
};

export default VersionHistoryDrawer;
