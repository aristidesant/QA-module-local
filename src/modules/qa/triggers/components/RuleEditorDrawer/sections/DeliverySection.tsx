import { Checkbox, Grid, Group, NumberInput, Stack, Switch } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { UseFormReturnType } from '@mantine/form';
import { CHANNELS, RECIPIENTS } from '~/modules/qa/triggers/constants';
import { type RuleFormValues } from '~/modules/qa/triggers/helpers';
import { SectionCard } from '~/components/SectionCard';

interface DeliverySectionProps {
	form: UseFormReturnType<RuleFormValues>;
	kind: 'ALERT' | 'RECOGNITION';
}

export function DeliverySection({ form, kind }: DeliverySectionProps) {
	const { t } = useTranslation('qa.triggers');

	return (
		<SectionCard title={t('editor.sections.delivery')}>
			<Grid>
				<Grid.Col span={{ base: 12, md: 6 }}>
					<Stack gap='xs'>
						<div>
							<label
								style={{
									fontSize: 'var(--mantine-font-size-sm)',
									fontWeight: 500,
								}}
							>
								{t('editor.fields.recipients')}
							</label>
							<Group mt={8}>
								{RECIPIENTS.map((recipient) => (
									<Checkbox
										key={recipient}
										label={t(
											`recipients.${recipient}`
										)}
										checked={form.values.recipients.includes(
											recipient
										)}
										onChange={(e) => {
											const current =
												form.values.recipients;
											const next = e.currentTarget
												.checked
												? [
													...current,
													recipient,
												]
												: current.filter(
													(r) =>
														r !==
														recipient
												);
											form.setFieldValue(
												'recipients',
												next
											);
										}}
									/>
								))}
							</Group>
						</div>
					</Stack>
				</Grid.Col>

				<Grid.Col span={{ base: 12, md: 6 }}>
					<Stack gap='xs'>
						<div>
							<label
								style={{
									fontSize: 'var(--mantine-font-size-sm)',
									fontWeight: 500,
								}}
							>
								{t('editor.fields.channels')}
							</label>
							<Group mt={8}>
								{CHANNELS.map((channel) => (
									<Checkbox
										key={channel}
										label={t(
											`channels.${channel}`
										)}
										checked={form.values.channels.includes(
											channel
										)}
										onChange={(e) => {
											const current =
												form.values.channels;
											const next = e.currentTarget
												.checked
												? [...current, channel]
												: current.filter(
													(c) => c !== channel
												);
											form.setFieldValue(
												'channels',
												next
											);
										}}
									/>
								))}
							</Group>
						</div>
					</Stack>
				</Grid.Col>
			</Grid>

			{kind === 'ALERT' && (
				<Stack gap='md' mt='md'>
					<Switch
						label={t('editor.fields.escalation')}
						checked={form.values.escalationEnabled}
						onChange={(e) =>
							form.setFieldValue(
								'escalationEnabled',
								e.currentTarget.checked
							)
						}
					/>

					{form.values.escalationEnabled && (
						<NumberInput
							label={t('editor.fields.escalationHours')}
							min={1}
							max={168}
							step={1}
							value={form.values.escalationAfterHours}
							onChange={(v) =>
								form.setFieldValue(
									'escalationAfterHours',
									typeof v === 'number' ? v : (Number(v) || 24)
								)
							}
						/>
					)}
				</Stack>
			)}
		</SectionCard>
	);
}
