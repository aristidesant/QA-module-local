import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
	Alert,
	Button,
	ColorInput,
	FileInput,
	Group,
	Loader,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconPhotoOff,
	IconUpload,
	IconInfoCircle,
	IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import SectionCard from '~/components/SectionCard';
import { useGetFileTypes, useUploadFile } from '~/queries/fileQueries';
import {
	ALLOWED_LOGO_MIME_TYPES,
	MAX_BRAND_NAME_LENGTH,
	MAX_LOGO_SIZE_BYTES,
	isAllowedLogoMime,
	isValidHexColor,
} from '~/utils/clientTheme';
import { getErrorMessage } from '~/utils/httpClient';
import { CLIENT_FORM_FIELD_IDS } from './ClientForm.constants';
import classes from './ClientThemeSection.module.css';

export interface ClientThemeFormValue {
	brandName: string;
	primaryColor: string;
	secondaryColor: string;
	logoFileId: number | null;
	logoUrl: string | null;
}

export interface ClientThemeSectionProps {
	clientId: number;
	value: ClientThemeFormValue;
	onChange: (next: ClientThemeFormValue) => void;
	onUploadingChange?: (isUploading: boolean) => void;
	errors?: Partial<Record<keyof ClientThemeFormValue, ReactNode>>;
	disabled?: boolean;
}

const ClientThemeSection: React.FC<ClientThemeSectionProps> = ({
	clientId,
	value,
	onChange,
	onUploadingChange,
	errors,
	disabled,
}) => {
	const { t } = useTranslation('clients');
	const { data: fileTypes = [] } = useGetFileTypes();
	const uploadMutation = useUploadFile();
	const [isUploading, setIsUploading] = useState(false);
	const [logoPreviewBroken, setLogoPreviewBroken] = useState(false);
	const isMountedRef = useRef(true);
	const uploadInProgressRef = useRef(false);
	const onUploadingChangeRef = useRef(onUploadingChange);

	useEffect(() => {
		onUploadingChangeRef.current = onUploadingChange;
	}, [onUploadingChange]);

	useEffect(() => {
		isMountedRef.current = true;

		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const logoType = fileTypes.find((ft) => ft.code === 'logo');

	const update = (patch: Partial<ClientThemeFormValue>) => {
		onChange({ ...value, ...patch });
	};

	const validateColor = (input: string): string | null => {
		if (!input) return null;
		return isValidHexColor(input) ? null : t('form.fields.color.invalid');
	};

	const errorToString = (node: ReactNode): string | null => {
		if (node == null || node === false) return null;
		if (typeof node === 'string') return node;
		if (typeof node === 'number') return String(node);
		return null;
	};

	const handleLogoChange = async (file: File | null) => {
		if (uploadInProgressRef.current) return;

		setLogoPreviewBroken(false);

		if (!file) {
			update({ logoFileId: null, logoUrl: null });
			return;
		}

		if (!isAllowedLogoMime(file.type)) {
			notifications.show({
				title: t('form.fields.logo.errors.wrongType.title'),
				message: t('form.fields.logo.errors.wrongType.message'),
				color: 'red',
			});
			return;
		}

		if (file.size > MAX_LOGO_SIZE_BYTES) {
			notifications.show({
				title: t('form.fields.logo.errors.tooBig.title'),
				message: t('form.fields.logo.errors.tooBig.message'),
				color: 'red',
			});
			return;
		}

		if (!logoType) {
			notifications.show({
				title: t('form.fields.logo.errors.fileTypeMissing.title'),
				message: t('form.fields.logo.errors.fileTypeMissing.message'),
				color: 'red',
			});
			return;
		}

		uploadInProgressRef.current = true;
		setIsUploading(true);
		const notifyUploadingChange = onUploadingChangeRef.current;
		notifyUploadingChange?.(true);
		try {
			const uploaded = await uploadMutation.mutateAsync({
				file,
				codeType: logoType.code,
				typeId: logoType.id,
				targetClientId: clientId,
			});

			if (isMountedRef.current) {
				update({
					logoFileId: uploaded.id,
					logoUrl: uploaded.repositoryRoute,
				});
			}
		} catch (error) {
			if (isMountedRef.current) {
				notifications.show({
					title: t('form.fields.logo.errors.uploadFailed.title'),
					message: getErrorMessage(error),
					color: 'red',
				});
			}
		} finally {
			uploadInProgressRef.current = false;
			notifyUploadingChange?.(false);

			if (isMountedRef.current) {
				setIsUploading(false);
			}
		}
	};

	const handleRemoveLogo = () => {
		setLogoPreviewBroken(false);
		update({ logoFileId: null, logoUrl: null });
	};

	const showLogoPreview =
		value.logoFileId != null && value.logoUrl != null && !logoPreviewBroken;

	return (
		<SectionCard
			title={
				<span id='branding-heading'>{t('form.sections.branding.title')}</span>
			}
			description={t('form.sections.branding.description')}
			contentSpacing='sm'
			padding='md'
		>
			<Stack gap='sm'>
				<div className={classes.logoBlock}>
					<div className={classes.logoPreview}>
						{showLogoPreview ? (
							<img
								className={classes.logoImage}
								src={value.logoUrl ?? ''}
								alt={t('form.fields.logo.previewAlt')}
								onError={() => setLogoPreviewBroken(true)}
							/>
						) : (
							<IconPhotoOff
								size={32}
								className={classes.logoPlaceholder}
								aria-hidden
							/>
						)}
					</div>
					<div className={classes.logoActions}>
						{value.logoFileId != null ? (
							<Group gap='xs'>
								<FileInput
									placeholder={t('form.fields.logo.replace')}
									leftSection={<IconUpload size={16} />}
									accept={ALLOWED_LOGO_MIME_TYPES.join(',')}
									onChange={handleLogoChange}
									disabled={disabled || isUploading}
									size='sm'
									flex={1}
								/>
								<Button
									variant='default'
									size='sm'
									leftSection={<IconX size={16} />}
									onClick={handleRemoveLogo}
									disabled={disabled || isUploading}
								>
									{t('form.fields.logo.remove')}
								</Button>
							</Group>
						) : (
							<FileInput
								placeholder={t('form.fields.logo.placeholder')}
								leftSection={<IconUpload size={16} />}
								rightSection={isUploading ? <Loader size={14} /> : undefined}
								accept={ALLOWED_LOGO_MIME_TYPES.join(',')}
								onChange={handleLogoChange}
								disabled={disabled || isUploading}
								size='sm'
							/>
						)}
						{isUploading && (
							<Text size='xs' c='dimmed'>
								{t('form.fields.logo.uploading')}
							</Text>
						)}
						{!logoType && (
							<Alert
								icon={<IconInfoCircle size={14} />}
								color='yellow'
								variant='light'
								className={classes.warningAlert}
							>
								{t('form.fields.logo.fileTypeMissingHint')}
							</Alert>
						)}
					</div>
				</div>

				<div className={classes.colorRow}>
					<ColorInput
						id={CLIENT_FORM_FIELD_IDS.primaryColor}
						label={t('form.fields.primaryColor.label')}
						description={t('form.fields.primaryColor.description')}
						format='hex'
						fixOnBlur
						value={value.primaryColor}
						onChange={(v) => update({ primaryColor: v })}
						error={
							errorToString(errors?.primaryColor) ??
							validateColor(value.primaryColor)
						}
						disabled={disabled}
						size='sm'
					/>
					<ColorInput
						id={CLIENT_FORM_FIELD_IDS.secondaryColor}
						label={t('form.fields.secondaryColor.label')}
						description={t('form.fields.secondaryColor.description')}
						format='hex'
						fixOnBlur
						value={value.secondaryColor}
						onChange={(v) => update({ secondaryColor: v })}
						error={
							errorToString(errors?.secondaryColor) ??
							validateColor(value.secondaryColor)
						}
						disabled={disabled}
						size='sm'
					/>
				</div>

				<TextInput
					id={CLIENT_FORM_FIELD_IDS.brandName}
					className={classes.brandNameField}
					label={t('form.fields.brandName.label')}
					placeholder={t('form.fields.brandName.placeholder')}
					maxLength={MAX_BRAND_NAME_LENGTH}
					value={value.brandName}
					onChange={(e) => update({ brandName: e.currentTarget.value })}
					error={errorToString(errors?.brandName)}
					disabled={disabled}
					size='sm'
				/>
			</Stack>
		</SectionCard>
	);
};

export default ClientThemeSection;
