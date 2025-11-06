import { useMemo } from 'react';
import { useClientConfigByName } from '~/queries/useClientConfigs';
import { RegionalSettings } from '~/models/RegionalSettingsParam';
import ContentContainer from '~/components/ContentContainer';
import { Button, Text, Stack } from '@mantine/core';
import { IconEdit, IconX, IconInfoCircle } from '@tabler/icons-react';
import useRegionalSettingsParamsStore from './store/useRegionalSettingsParamsStore';
import RegionalSettingsParamsDetail from './RegionalSettingsParamsDetail';
import RegionalSettingsParamsForm from './RegionalSettingsParamsForm';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';

const RegionalSettingsParamsPage = () => {
	const { data } = useClientConfigByName('regional_settings');
	const { mode, setMode } = useRegionalSettingsParamsStore();

	const regionalSettings = useMemo<RegionalSettings>(() => {
		if (!data?.value)
			return { timezone: 'America/Santo_Domingo', locale: 'es-DO' };
		try {
			return JSON.parse(data.value);
		} catch {
			return { timezone: 'America/Santo_Domingo', locale: 'es-DO' };
		}
	}, [data]);

	const handleEdit = () => {
		setMode('edit');
	};

	const handleCancel = () => {
		setMode('view');
	};

	const rightSectionContent = (
		<RightSectionCard
			title='About Regional Settings'
			icon={IconInfoCircle}
			iconColor='var(--mantine-color-blue-6)'
		>
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					Regional settings configure the application's behavior for different
					geographic locations and cultural contexts. These settings ensure
					compliance with local regulations, proper date/time handling, and
					appropriate language support.
				</Text>
				<Text size='sm' c='dimmed'>
					<strong>Timezone Configuration:</strong> Determines the time zone for
					scheduling calls, managing business hours, and ensuring regulatory
					compliance with local calling restrictions and business operation
					requirements.
				</Text>
				<Text size='sm' c='dimmed'>
					<strong>Locale Settings:</strong> Defines language preferences, number
					formatting, date formats, and cultural conventions that affect how the
					application communicates with users and processes data.
				</Text>
				<Text size='sm' c='dimmed'>
					Proper regional configuration is essential for maintaining compliance
					with international telecommunications regulations and providing a
					localized user experience.
				</Text>
			</Stack>
		</RightSectionCard>
	);

	return (
		<ContentContainer
			title='Regional Settings'
			description='Configure the default regional settings'
			rightSection={rightSectionContent}
			titleRight={
				mode === 'view' ? (
					<Button
						leftSection={<IconEdit size={16} />}
						onClick={handleEdit}
						size='sm'
					>
						Edit Settings
					</Button>
				) : (
					<Button
						leftSection={<IconX size={16} />}
						onClick={handleCancel}
						size='sm'
						variant='light'
					>
						Cancel
					</Button>
				)
			}
		>
			{mode === 'view' ? (
				<RegionalSettingsParamsDetail regionalSettings={regionalSettings} />
			) : (
				<RegionalSettingsParamsForm
					regionalSettings={regionalSettings}
					config={data}
					onCancel={handleCancel}
				/>
			)}
		</ContentContainer>
	);
};

export default RegionalSettingsParamsPage;
