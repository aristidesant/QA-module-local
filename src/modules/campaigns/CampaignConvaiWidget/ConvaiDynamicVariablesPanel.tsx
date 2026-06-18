import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Popover,
	ScrollArea,
	Stack,
	Switch,
	Text,
	TextInput,
	UnstyledButton,
} from '@mantine/core';
import {
	IconChevronRight,
	IconRestore,
	IconVariable,
	IconX,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCampaignConvai } from './CampaignConvaiContext';
import styles from './CampaignConvaiWidget.module.css';

const convertToInputValue = (value: string | number | boolean) => {
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return String(value);
};

const parseInputValue = (value: string) => {
	const trimmed = value.trim();
	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;
	if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
	return value;
};

const ConvaiDynamicVariablesPanel = () => {
	const { t } = useTranslation('campaign.detail.test');
	const [opened, setOpened] = useState(false);
	const {
		dynamicVariables,
		setDynamicVariables,
		resetDynamicVariables,
		dynamicVariablesDefaults,
	} = useCampaignConvai();

	const entries = useMemo(
		() => Object.entries(dynamicVariablesDefaults),
		[dynamicVariablesDefaults]
	);
	const overrideCount = entries.filter(
		([key, defaultValue]) => dynamicVariables[key] !== defaultValue
	).length;

	const resetOne = (key: string) => {
		setDynamicVariables({
			...dynamicVariables,
			[key]: dynamicVariablesDefaults[key],
		});
	};

	if (entries.length === 0) return null;

	return (
		<div className={styles.dynamicVariablesPanel}>
			<Popover
				opened={opened}
				onChange={setOpened}
				position='left-start'
				width={420}
				shadow='lg'
				radius='md'
				withArrow
				trapFocus
			>
				<Popover.Target>
					<UnstyledButton
						className={styles.dynamicVariablesTrigger}
						onClick={() => setOpened((value) => !value)}
						aria-expanded={opened}
					>
						<span className={styles.dynamicVariablesTriggerIcon}>
							<IconVariable size={17} />
						</span>
						<span className={styles.dynamicVariablesTriggerContent}>
							<Text className={styles.dynamicVariablesTitle}>
								{t('widget.dynamicVariables.title')}
							</Text>
							<Text className={styles.dynamicVariablesTriggerSummary}>
								{t('widget.dynamicVariables.listCount', {
									count: entries.length,
								})}
							</Text>
						</span>
						{overrideCount > 0 && (
							<Badge
								variant='light'
								color='green'
								size='sm'
								className={styles.dynamicVariablesTriggerBadge}
							>
								{t('widget.dynamicVariables.overridesActive', {
									count: overrideCount,
								})}
							</Badge>
						)}
						<span className={styles.dynamicVariablesConfigure}>
							{t('widget.dynamicVariables.configure')}
							<IconChevronRight size={15} />
						</span>
					</UnstyledButton>
				</Popover.Target>

				<Popover.Dropdown className={styles.dynamicVariablesPopover}>
					<Group
						justify='space-between'
						align='flex-start'
						wrap='nowrap'
						className={styles.dynamicVariablesPopoverHeader}
					>
						<div>
							<Text className={styles.dynamicVariablesPopoverTitle}>
								{t('widget.dynamicVariables.popoverTitle')}
							</Text>
							<Text className={styles.dynamicVariablesPopoverDescription}>
								{t('widget.dynamicVariables.scopeHint')}
							</Text>
						</div>
						<ActionIcon
							variant='subtle'
							color='gray'
							size='sm'
							onClick={() => setOpened(false)}
							aria-label={t('widget.dynamicVariables.close')}
						>
							<IconX size={16} />
						</ActionIcon>
					</Group>

					<ScrollArea.Autosize
						mah='min(440px, 55vh)'
						type='auto'
						offsetScrollbars
					>
						<Stack gap={0} className={styles.dynamicVariablesList}>
							{entries.map(([key, defaultValue]) => {
								const currentValue = dynamicVariables[key] ?? defaultValue;
								const isModified = currentValue !== defaultValue;

								return (
									<div
										key={key}
										className={`${styles.dynamicVariableField}${isModified ? ` ${styles.dynamicVariableFieldModified}` : ''}`}
									>
										<Group
											justify='space-between'
											align='flex-start'
											wrap='nowrap'
											gap='xs'
										>
											<div className={styles.dynamicVariableFieldHeading}>
												<Text className={styles.dynamicVariableKey}>{key}</Text>
												<Text className={styles.dynamicVariableDefault}>
													{t('widget.dynamicVariables.defaultValue')}:{' '}
													{convertToInputValue(defaultValue)}
												</Text>
											</div>
											{isModified && (
												<ActionIcon
													variant='subtle'
													color='gray'
													size='sm'
													onClick={() => resetOne(key)}
													aria-label={t(
														'widget.dynamicVariables.resetOneAriaLabel',
														{ variable: key }
													)}
												>
													<IconRestore size={14} />
												</ActionIcon>
											)}
										</Group>

										{typeof defaultValue === 'boolean' ? (
											<Switch
												checked={Boolean(currentValue)}
												label={
													currentValue
														? t('widget.dynamicVariables.enabled')
														: t('widget.dynamicVariables.disabled')
												}
												onChange={(event) =>
													setDynamicVariables({
														...dynamicVariables,
														[key]: event.currentTarget.checked,
													})
												}
												size='sm'
											/>
										) : (
											<TextInput
												type={
													typeof defaultValue === 'number' ? 'number' : 'text'
												}
												value={convertToInputValue(currentValue)}
												onChange={(event) =>
													setDynamicVariables({
														...dynamicVariables,
														[key]: parseInputValue(event.currentTarget.value),
													})
												}
												placeholder={t(
													'widget.dynamicVariables.valuePlaceholder'
												)}
												aria-label={key}
												size='sm'
											/>
										)}
									</div>
								);
							})}
						</Stack>
					</ScrollArea.Autosize>

					<Group
						justify='space-between'
						align='center'
						wrap='nowrap'
						className={styles.dynamicVariablesPopoverFooter}
					>
						<Text className={styles.dynamicVariablesFooterText}>
							{overrideCount > 0
								? t('widget.dynamicVariables.overridesActive', {
										count: overrideCount,
									})
								: t('widget.dynamicVariables.noOverrides')}
						</Text>
						<Button
							size='xs'
							variant='subtle'
							color='gray'
							leftSection={<IconRestore size={14} />}
							onClick={resetDynamicVariables}
							disabled={overrideCount === 0}
						>
							{t('widget.dynamicVariables.resetAll')}
						</Button>
					</Group>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
};

export default ConvaiDynamicVariablesPanel;
