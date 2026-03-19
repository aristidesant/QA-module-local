import React from 'react';
import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useSimplePhoneNumberList } from '~/queries/phoneNumberQueries';
import type { SimplePhoneNumberListParams } from '~/api/phoneNumberApi';

interface PhoneNumberSelectorProps {
	campaignType: 'INBOUND' | 'OUTBOUND';
	value: number | null;
	onChange: (value: number | null) => void;
	label?: string;
	description?: string;
	placeholder?: string;
	withAsterisk?: boolean;
	error?: string;
}

const PhoneNumberSelector: React.FC<PhoneNumberSelectorProps> = ({
	campaignType,
	value,
	onChange,
	label,
	description,
	placeholder,
	withAsterisk = false,
	error,
}) => {
	const { t } = useTranslation(['campaigns.create', 'common']);
	const params: SimplePhoneNumberListParams = {
		type: campaignType,
	};

	const { data: phoneNumbers, isLoading } = useSimplePhoneNumberList(params);

	const selectData =
		phoneNumbers?.map((phone) => ({
			value: phone.id.toString(),
			label: phone.phoneNumber,
		})) || [];

	return (
		<Select
			label={label || t('addNewCampaign.form.phoneNumber')}
			description={description || t('addNewCampaign.form.phoneNumberDesc')}
			placeholder={
				placeholder || t('addNewCampaign.form.phoneNumberPlaceholder')
			}
			withAsterisk={withAsterisk}
			data={selectData}
			value={value?.toString() || null}
			onChange={(val) => onChange(val ? parseInt(val, 10) : null)}
			searchable
			clearable
			disabled={isLoading}
			error={error}
		/>
	);
};

export default PhoneNumberSelector;
