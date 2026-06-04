import {
	Accordion,
	Code,
	Group,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import classes from './PlaceholderGuideModal.module.css';

interface PlaceholderItem {
	name: string;
	descKey: string;
}

interface SectionConfig {
	value: string;
	labelKey: string;
	descKey: string;
	blockLabel?: string;
	blockDescKey?: string;
	items: PlaceholderItem[];
}

const SECTIONS: SectionConfig[] = [
	{
		value: 'invoice',
		labelKey: 'templates.variablesGuide.sections.invoice.label',
		descKey: 'templates.variablesGuide.sections.invoice.desc',
		items: [
			{
				name: '{{invoice.number}}',
				descKey: 'templates.variablesGuide.sections.invoice.number',
			},
			{
				name: '{{invoice.periodStart}}',
				descKey: 'templates.variablesGuide.sections.invoice.periodStart',
			},
			{
				name: '{{invoice.periodEnd}}',
				descKey: 'templates.variablesGuide.sections.invoice.periodEnd',
			},
			{
				name: '{{invoice.currency}}',
				descKey: 'templates.variablesGuide.sections.invoice.currency',
			},
			{
				name: '{{invoice.taxRate}}',
				descKey: 'templates.variablesGuide.sections.invoice.taxRate',
			},
			{
				name: '{{invoice.hourlyRateFormatted}}',
				descKey:
					'templates.variablesGuide.sections.invoice.hourlyRateFormatted',
			},
		],
	},
	{
		value: 'issuer',
		labelKey: 'templates.variablesGuide.sections.issuer.label',
		descKey: 'templates.variablesGuide.sections.issuer.desc',
		items: [
			{
				name: '{{issuer.name}}',
				descKey: 'templates.variablesGuide.sections.issuer.name',
			},
			{
				name: '{{issuer.rnc}}',
				descKey: 'templates.variablesGuide.sections.issuer.rnc',
			},
			{
				name: '{{issuer.email}}',
				descKey: 'templates.variablesGuide.sections.issuer.email',
			},
			{
				name: '{{issuer.phone}}',
				descKey: 'templates.variablesGuide.sections.issuer.phone',
			},
			{
				name: '{{issuer.address}}',
				descKey: 'templates.variablesGuide.sections.issuer.address',
			},
			{
				name: '{{issuer.website}}',
				descKey: 'templates.variablesGuide.sections.issuer.website',
			},
		],
	},
	{
		value: 'receiver',
		labelKey: 'templates.variablesGuide.sections.receiver.label',
		descKey: 'templates.variablesGuide.sections.receiver.desc',
		items: [
			{
				name: '{{receiver.name}}',
				descKey: 'templates.variablesGuide.sections.receiver.name',
			},
			{
				name: '{{receiver.rnc}}',
				descKey: 'templates.variablesGuide.sections.receiver.rnc',
			},
			{
				name: '{{receiver.email}}',
				descKey: 'templates.variablesGuide.sections.receiver.email',
			},
			{
				name: '{{receiver.phone}}',
				descKey: 'templates.variablesGuide.sections.receiver.phone',
			},
			{
				name: '{{receiver.address}}',
				descKey: 'templates.variablesGuide.sections.receiver.address',
			},
			{
				name: '{{receiver.website}}',
				descKey: 'templates.variablesGuide.sections.receiver.website',
			},
		],
	},
	{
		value: 'poc',
		labelKey: 'templates.variablesGuide.sections.poc.label',
		descKey: 'templates.variablesGuide.sections.poc.desc',
		items: [
			{
				name: '{{poc.issuer.name}}',
				descKey: 'templates.variablesGuide.sections.poc.issuerName',
			},
			{
				name: '{{poc.issuer.email}}',
				descKey: 'templates.variablesGuide.sections.poc.issuerEmail',
			},
			{
				name: '{{poc.receiver.name}}',
				descKey: 'templates.variablesGuide.sections.poc.receiverName',
			},
			{
				name: '{{poc.receiver.email}}',
				descKey: 'templates.variablesGuide.sections.poc.receiverEmail',
			},
		],
	},
	{
		value: 'totals',
		labelKey: 'templates.variablesGuide.sections.totals.label',
		descKey: 'templates.variablesGuide.sections.totals.desc',
		items: [
			{
				name: '{{totals.subtotalFormatted}}',
				descKey: 'templates.variablesGuide.sections.totals.subtotal',
			},
			{
				name: '{{totals.taxRate}}',
				descKey: 'templates.variablesGuide.sections.totals.taxRate',
			},
			{
				name: '{{totals.taxTotalFormatted}}',
				descKey: 'templates.variablesGuide.sections.totals.taxTotal',
			},
			{
				name: '{{totals.totalFormatted}}',
				descKey: 'templates.variablesGuide.sections.totals.total',
			},
		],
	},
	{
		value: 'summaryLines',
		labelKey: 'templates.variablesGuide.sections.summaryLines.label',
		descKey: 'templates.variablesGuide.sections.summaryLines.desc',
		blockLabel: '{{#summaryLines}} ... {{/summaryLines}}',
		blockDescKey: 'templates.variablesGuide.sections.summaryLines.blockDesc',
		items: [
			{
				name: '{{campaignName}}',
				descKey: 'templates.variablesGuide.sections.summaryLines.campaignName',
			},
			{
				name: '{{activeAiAgents}}',
				descKey:
					'templates.variablesGuide.sections.summaryLines.activeAiAgents',
			},
			{
				name: '{{uptimeFormatted}}',
				descKey: 'templates.variablesGuide.sections.summaryLines.uptime',
			},
			{
				name: '{{hourlyRateFormatted}}',
				descKey: 'templates.variablesGuide.sections.summaryLines.hourlyRate',
			},
			{
				name: '{{totalFormatted}}',
				descKey: 'templates.variablesGuide.sections.summaryLines.total',
			},
		],
	},
	{
		value: 'executionDetails',
		labelKey: 'templates.variablesGuide.sections.executionDetails.label',
		descKey: 'templates.variablesGuide.sections.executionDetails.desc',
		blockLabel: '{{#executionDetails}} ... {{/executionDetails}}',
		blockDescKey:
			'templates.variablesGuide.sections.executionDetails.blockDesc',
		items: [
			{
				name: '{{campaignName}}',
				descKey:
					'templates.variablesGuide.sections.executionDetails.campaignName',
			},
			{
				name: '{{executionDate}}',
				descKey:
					'templates.variablesGuide.sections.executionDetails.executionDate',
			},
			{
				name: '{{activeAiAgents}}',
				descKey:
					'templates.variablesGuide.sections.executionDetails.activeAiAgents',
			},
			{
				name: '{{uptimeFormatted}}',
				descKey: 'templates.variablesGuide.sections.executionDetails.uptime',
			},
			{
				name: '{{callsCount}}',
				descKey:
					'templates.variablesGuide.sections.executionDetails.callsCount',
			},
			{
				name: '{{startTimestamp}}',
				descKey:
					'templates.variablesGuide.sections.executionDetails.startTimestamp',
			},
			{
				name: '{{endTimestamp}}',
				descKey:
					'templates.variablesGuide.sections.executionDetails.endTimestamp',
			},
		],
	},
];

interface PlaceholderGuideModalProps {
	opened: boolean;
	onClose: () => void;
}

function PlaceholderGuideModal({
	opened,
	onClose,
}: PlaceholderGuideModalProps) {
	const { t } = useTranslation('billing');

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>{t('templates.variablesGuide.title')}</Title>}
			size='xl'
		>
			<Text size='sm' mb='md' c='dimmed'>
				{t('templates.variablesGuide.description')}
			</Text>

			<Accordion variant='contained'>
				{SECTIONS.map((section) => (
					<Accordion.Item key={section.value} value={section.value}>
						<Accordion.Control>
							<Text fw={500}>{t(section.labelKey)}</Text>
						</Accordion.Control>
						<Accordion.Panel>
							<Text size='sm' mb='sm' c='dimmed'>
								{t(section.descKey)}
							</Text>

							{section.blockLabel && section.blockDescKey && (
								<div className={classes.blockSyntax}>
									<Code block fz='xs' mb={4}>
										{section.blockLabel}
									</Code>
									<Text size='sm' c='dimmed'>
										{t(section.blockDescKey)}
									</Text>
								</div>
							)}

							<Stack gap='xs'>
								{section.items.map((item) => (
									<Group
										key={item.name}
										gap='xs'
										wrap='nowrap'
										align='flex-start'
									>
										<Code fz='xs' className={classes.variableCode}>
											{item.name}
										</Code>
										<Text size='sm'>{t(item.descKey)}</Text>
									</Group>
								))}
							</Stack>
						</Accordion.Panel>
					</Accordion.Item>
				))}
			</Accordion>
		</Modal>
	);
}

export default PlaceholderGuideModal;
