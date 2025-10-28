import React from 'react';
import { Select } from '@mantine/core';
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
	label = 'Phone Number',
	description = 'Select the phone number for this campaign',
	placeholder = 'Choose a phone number',
	withAsterisk = false,
	error,
}) => {
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
			label={label}
			description={description}
			placeholder={placeholder}
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
