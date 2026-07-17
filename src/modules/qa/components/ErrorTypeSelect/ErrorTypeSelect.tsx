import { Alert, Anchor, Select, Stack, Text } from '@mantine/core';
import type { ComboboxItem } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router';

import { useQuestionErrorTypesQuery } from '~/queries/qa/questionErrorTypesQueries';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './ErrorTypeSelect.module.css';
import type { ErrorTypeSelectProps } from './ErrorTypeSelect.types';

export default function ErrorTypeSelect({
	description,
	error,
	label,
	onChange,
	value,
}: ErrorTypeSelectProps) {
	const { t } = useTranslation('qa.forms');
	const errorTypesQuery = useQuestionErrorTypesQuery({ pagination: false });
	const errorTypes = useMemo(
		() => errorTypesQuery.data?.data ?? [],
		[errorTypesQuery.data]
	);
	const options = useMemo(() => {
		const activeOptions: ComboboxItem[] = errorTypes
			.filter((errorType) => errorType.isActive)
			.map((errorType) => ({
				label: `${errorType.code} — ${errorType.label}`,
				value: String(errorType.id),
			}));
		const selectedErrorType = errorTypes.find(
			(errorType) => String(errorType.id) === value
		);

		if (selectedErrorType && !selectedErrorType.isActive) {
			activeOptions.unshift({
				disabled: true,
				label: t('errorTypes.selector.inactiveOption', {
					code: selectedErrorType.code,
					label: selectedErrorType.label,
				}),
				value: String(selectedErrorType.id),
			});
		} else if (value && !selectedErrorType) {
			activeOptions.unshift({
				disabled: true,
				label: t('errorTypes.selector.unavailableOption', { id: value }),
				value,
			});
		}

		return activeOptions;
	}, [errorTypes, t, value]);
	const hasActiveOptions = errorTypes.some((errorType) => errorType.isActive);

	return (
		<Stack gap='xs'>
			<Select
				className={classes.select}
				clearable
				data={options}
				description={description}
				error={error}
				label={label}
				loading={errorTypesQuery.isLoading}
				nothingFoundMessage={t('errorTypes.selector.nothingFound')}
				onChange={onChange}
				placeholder={t('errorTypes.selector.placeholder')}
				searchable
				size='sm'
				value={value}
			/>
			{errorTypesQuery.isError ? (
				<Alert
					color='red'
					icon={<IconAlertTriangle size={16} />}
					variant='light'
				>
					{getErrorMessage(errorTypesQuery.error)}
				</Alert>
			) : null}
			{!errorTypesQuery.isLoading && !hasActiveOptions ? (
				<Text c='dimmed' size='sm'>
					{t('errorTypes.selector.empty')}{' '}
					<Anchor component={RouterLink} to='/forms/error-types'>
						{t('errorTypes.selector.manage')}
					</Anchor>
				</Text>
			) : null}
		</Stack>
	);
}
