import { Badge, Group } from '@mantine/core';
import { IconDatabaseImport } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import type {
	CallSourceErrors,
	CallSourceValues,
	ConfiguredFtp,
} from '../../callSource.types';
import FtpSourcePicker from '../FtpSourcePicker';

export interface CallSourceSectionProps {
	value: CallSourceValues;
	/** Messages keyed by field: 'ftpId'. */
	errors: CallSourceErrors;
	/** A source is already saved on the campaign. */
	configured: boolean;
	/** FTP servers set up in the admin configuration. */
	ftps: ConfiguredFtp[];
	/** Extra header controls, shown before the status badge (the Manual upload button). */
	actions?: ReactNode;
	onChange: (patch: Partial<CallSourceValues>) => void;
}

/** The configured FTP server the campaign pulls its calls from. */
export default function CallSourceSection({
	value,
	errors,
	configured,
	ftps,
	actions,
	onChange,
}: CallSourceSectionProps) {
	const { t } = useTranslation('qa.campaigns');

	return (
		<SectionCard
			description={t('callSource.description')}
			headerActions={
				<Group gap='xs'>
					{actions}
					<Badge color={configured ? 'green' : 'gray'} variant='light'>
						{configured
							? t('callSource.status.configured')
							: t('callSource.status.notConfigured')}
					</Badge>
				</Group>
			}
			icon={IconDatabaseImport}
			padding='md'
			title={t('callSource.title')}
		>
			<FtpSourcePicker
				error={errors.ftpId}
				ftps={ftps}
				onChange={(ftpId) => onChange({ ftpId })}
				value={value.ftpId}
			/>
		</SectionCard>
	);
}
