import { Alert, Radio, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { ConfiguredFtp } from '../../callSource.types';

export interface FtpSourcePickerProps {
	/** FTP servers configured in the admin configuration. */
	ftps: ConfiguredFtp[];
	value: string;
	error?: string;
	onChange: (ftpId: string) => void;
}

/** Pick one of the FTP servers an administrator already set up; only their names are shown. */
export default function FtpSourcePicker({
	ftps,
	value,
	error,
	onChange,
}: FtpSourcePickerProps) {
	const { t } = useTranslation('qa.campaigns');

	if (ftps.length === 0) {
		return (
			<Alert color='yellow' icon={<IconInfoCircle size={16} />} variant='light'>
				{t('callSource.ftp.empty')}
			</Alert>
		);
	}

	return (
		<Radio.Group
			description={t('callSource.ftp.hint')}
			error={error}
			label={t('callSource.ftp.label')}
			onChange={onChange}
			required
			value={value}
		>
			<Stack gap='xs' mt='xs'>
				{ftps.map((ftp) => (
					<Radio key={ftp.id} label={ftp.name} value={ftp.id} />
				))}
			</Stack>
		</Radio.Group>
	);
}
