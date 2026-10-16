import { Badge, Button, Group, Stack } from '@mantine/core';
import { IconDeviceFloppy, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useCampaignsStore } from '~/stores/qa/campaignsStore';
import {
	fromCampaignSource,
	toCampaignSource,
	validateCallSource,
} from './callSource.helpers';
import type { CallSourceErrors, CallSourceValues } from './callSource.types';
import CallSourceSection from './components/CallSourceSection';
import ManualUploadModal from './components/ManualUploadModal';
import { CONFIGURED_FTPS } from './configuredFtps';

export interface CallSourceTabProps {
	campaignId: string;
}

/** The configured FTP server a campaign pulls its calls from, plus a Manual upload for single files and ZIPs. */
export default function CallSourceTab({ campaignId }: CallSourceTabProps) {
	const { t } = useTranslation('qa.campaigns');
	const saved = useCampaignsStore((state) => state.callSources[campaignId]);
	const uploadedCount = useCampaignsStore(
		(state) => state.uploads[campaignId]?.length ?? 0
	);
	const savedFtpId = saved?.ftpId ?? '';
	const [values, setValues] = useState<CallSourceValues>(() => ({
		// With a single configured FTP there is nothing to choose: preselect it.
		ftpId:
			savedFtpId || (CONFIGURED_FTPS.length === 1 ? CONFIGURED_FTPS[0].id : ''),
	}));
	const [errors, setErrors] = useState<CallSourceErrors>({});
	const [uploadOpen, setUploadOpen] = useState(false);

	const dirty = values.ftpId !== savedFtpId;

	const change = (patch: Partial<CallSourceValues>) => {
		setValues((current) => ({ ...current, ...patch }));
		setErrors({});
	};

	const discard = () => {
		setValues(fromCampaignSource(saved));
		setErrors({});
	};

	const save = () => {
		const found = validateCallSource(values, (key: string) => t(key));
		if (Object.keys(found).length > 0) {
			setErrors(found);
			notifyWarning(t('callSource.fixFields'));
			return;
		}
		const source = toCampaignSource(values);
		if (!source) return;
		useCampaignsStore.getState().setCallSource(campaignId, source);
		notifySuccess(t('callSource.saved'));
	};

	return (
		<Stack gap='md' maw={720}>
			<CallSourceSection
				actions={
					<Button
						leftSection={<IconUpload size={16} />}
						onClick={() => setUploadOpen(true)}
						rightSection={
							uploadedCount > 0 ? (
								<Badge circle size='sm' variant='filled'>
									{uploadedCount}
								</Badge>
							) : undefined
						}
						size='xs'
						variant='light'
					>
						{t('callSource.manual.button')}
					</Button>
				}
				configured={Boolean(saved)}
				errors={errors}
				ftps={CONFIGURED_FTPS}
				onChange={change}
				value={values}
			/>

			<Group gap='xs' justify='flex-end'>
				{dirty && saved ? (
					<Button onClick={discard} variant='subtle'>
						{t('callSource.discard')}
					</Button>
				) : null}
				<Button
					disabled={!dirty}
					leftSection={<IconDeviceFloppy size={16} />}
					onClick={save}
				>
					{t('callSource.save')}
				</Button>
			</Group>

			<ManualUploadModal
				campaignId={campaignId}
				onClose={() => setUploadOpen(false)}
				opened={uploadOpen}
			/>
		</Stack>
	);
}
