import {
	ActionIcon,
	Button,
	Group,
	Stack,
	Tabs,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAgentTestsPage } from '../../../../context/AgentTestsPageContext';
import styles from '../../../../AgentTestsPage.module.css';

const StudioConfigPane = () => {
	const { t } = useTranslation('agent-tests');
	const {
		form,
		showSuccessExamples,
		setShowSuccessExamples,
		showFailureExamples,
		setShowFailureExamples,
		addSuccessExample,
		addFailureExample,
		addDynamicVariable,
	} = useAgentTestsPage();

	return (
		<div className={styles.studioConfigPane}>
			<Tabs
				value={form.values.testType}
				onChange={(value) =>
					form.setFieldValue(
						'testType',
						(value as 'nextReply' | 'toolInvocation') ?? 'nextReply'
					)
				}
			>
				<Tabs.List>
					<Tabs.Tab value='nextReply'>{t('form.tabs.nextReply')}</Tabs.Tab>
					<Tabs.Tab value='toolInvocation'>
						{t('form.tabs.toolInvocation')}
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='nextReply' pt='xs'>
					<Stack gap='xs'>
						<TextInput
							label={t('form.fields.name')}
							placeholder={t('form.placeholders.name')}
							size='sm'
							withAsterisk
							{...form.getInputProps('name')}
						/>
						<Textarea
							label={t('form.fields.successCondition')}
							placeholder={t('form.placeholders.successCondition')}
							minRows={3}
							withAsterisk
							size='sm'
							{...form.getInputProps('successCondition')}
						/>

						<Group justify='space-between' align='center'>
							<Text size='sm' fw={600}>
								{t('form.fields.successExamples')}
							</Text>
							{showSuccessExamples ? (
								<ActionIcon
									size='sm'
									variant='subtle'
									color='red'
									onClick={() => {
										setShowSuccessExamples(false);
										form.setFieldValue('successExamples', []);
									}}
								>
									<IconTrash size={14} />
								</ActionIcon>
							) : (
								<Button
									size='xs'
									variant='default'
									leftSection={<IconPlus size={12} />}
									onClick={addSuccessExample}
								>
									{t('form.actions.addExample')}
								</Button>
							)}
						</Group>

						{showSuccessExamples && (
							<Textarea
								placeholder={t('form.placeholders.examples')}
								minRows={3}
								size='sm'
								value={form.values.successExamples.join('\n')}
								onChange={(event) =>
									form.setFieldValue(
										'successExamples',
										event.currentTarget.value.split('\n')
									)
								}
							/>
						)}

						<Group justify='space-between' align='center'>
							<Text size='sm' fw={600}>
								{t('form.fields.failureExamples')}
							</Text>
							{showFailureExamples ? (
								<ActionIcon
									size='sm'
									variant='subtle'
									color='red'
									onClick={() => {
										setShowFailureExamples(false);
										form.setFieldValue('failureExamples', []);
									}}
								>
									<IconTrash size={14} />
								</ActionIcon>
							) : (
								<Button
									size='xs'
									variant='default'
									leftSection={<IconPlus size={12} />}
									onClick={addFailureExample}
								>
									{t('form.actions.addExample')}
								</Button>
							)}
						</Group>

						{showFailureExamples && (
							<Textarea
								placeholder={t('form.placeholders.examples')}
								minRows={3}
								size='sm'
								value={form.values.failureExamples.join('\n')}
								onChange={(event) =>
									form.setFieldValue(
										'failureExamples',
										event.currentTarget.value.split('\n')
									)
								}
							/>
						)}

						<div className={styles.dynamicVarsContainer}>
							<div className={styles.dynamicVarsHeader}>
								<div>
									<Text size='sm' fw={600}>
										{t('form.fields.dynamicVariables')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('form.fields.dynamicVariablesHelp')}
									</Text>
								</div>
							</div>

							<Button
								size='xs'
								leftSection={<IconPlus size={12} />}
								fullWidth
								variant='default'
								onClick={addDynamicVariable}
								className={styles.dynamicVarsAddButton}
							>
								{t('form.actions.addVariable')}
							</Button>

							{form.values.dynamicVariables.length === 0 ? (
								<div className={styles.dynamicVarsEmpty}>
									<Text size='xs' c='dimmed'>
										{t('form.empty.dynamicVariables')}
									</Text>
								</div>
							) : (
								<div className={styles.dynamicVarsTable}>
									<div className={styles.dynamicVarsTableHeader}>
										<div className={styles.dynamicVarsCell}>
											{t('form.fields.variableKey')}
										</div>
										<div className={styles.dynamicVarsCell}>
											{t('form.fields.variableValue')}
										</div>
										<div className={styles.dynamicVarsActionCell}></div>
									</div>

									{form.values.dynamicVariables.map(
										(_: unknown, index: number) => (
											<div
												key={`dynamic-${index}`}
												className={styles.dynamicVarsRow}
											>
												<TextInput
													placeholder={t('form.placeholders.variableKey')}
													size='sm'
													variant='unstyled'
													className={styles.dynamicVarsInputCell}
													{...form.getInputProps(
														`dynamicVariables.${index}.key`
													)}
												/>
												<TextInput
													placeholder={t('form.placeholders.variableValue')}
													size='sm'
													variant='unstyled'
													className={styles.dynamicVarsInputCell}
													{...form.getInputProps(
														`dynamicVariables.${index}.value`
													)}
												/>
												<div className={styles.dynamicVarsActionCell}>
													<ActionIcon
														size='sm'
														variant='subtle'
														color='red'
														onClick={() => {
															form.setFieldValue(
																'dynamicVariables',
																form.values.dynamicVariables.filter(
																	(_: unknown, rowIndex: number) =>
																		rowIndex !== index
																)
															);
														}}
													>
														<IconTrash size={14} />
													</ActionIcon>
												</div>
											</div>
										)
									)}
								</div>
							)}
						</div>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value='toolInvocation' pt='xs'>
					<Text size='sm' c='dimmed'>
						{t('form.toolInvocationHint')}
					</Text>
				</Tabs.Panel>
			</Tabs>
		</div>
	);
};

export default StudioConfigPane;
