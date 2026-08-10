import { Card, Text } from '@mantine/core';
import styles from '../ExternalCampaignWizard.module.css';

interface PatternPreviewProps {
	contactNameEnabled: boolean;
	delimiter: '_' | '-' | '.' | 'none';
}

export default function PatternPreviewDisplay({
	delimiter,
}: PatternPreviewProps) {
	const getDelimiterChar = () => {
		if (delimiter === 'none') return '';
		return delimiter;
	};

	const delim = getDelimiterChar();
	const example1 = `ACME${delim}20260810${delim}143022${delim}ContactName.wav`;
	const example2 = `ACME${delim}20260810${delim}143022.wav`;

	return (
		<div>
			<Text size='sm' fw={500} mb='xs'>
				Pattern Preview
			</Text>
			<Card p='md' withBorder className={styles.patternPreview}>
				<div>
					<Text size='xs' c='dimmed'>
						With Contact Name:
					</Text>
					{/* inline-style-allow: */}
					<Text
						fw={500}
						size='sm'
						style={{ fontFamily: 'Courier New, monospace' }}
					>
						{example1}
					</Text>
				</div>
				{/* inline-style-allow: */}
				<div style={{ marginTop: 'var(--mantine-spacing-sm)' }}>
					<Text size='xs' c='dimmed'>
						Without Contact Name:
					</Text>
					{/* inline-style-allow: */}
					<Text
						fw={500}
						size='sm'
						style={{ fontFamily: 'Courier New, monospace' }}
					>
						{example2}
					</Text>
				</div>
			</Card>
		</div>
	);
}
