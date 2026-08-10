import { Badge } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import styles from '../ExternalCampaignWizard.module.css';

interface FileItem {
	name: string;
	size: string;
	modified: string;
	matches: boolean;
}

interface FilePreviewTableProps {
	files: FileItem[];
}

export default function FilePreviewTable({ files }: FilePreviewTableProps) {
	return (
		<table className={styles.filePreviewTable}>
			<thead>
				<tr>
					<th>File Name</th>
					<th>Size</th>
					<th>Last Modified</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{files.map((file, idx) => (
					<tr key={idx}>
						<td>{file.name}</td>
						<td>{file.size}</td>
						<td>{file.modified}</td>
						<td>
							<Badge
								className={
									file.matches
										? styles.matchBadgeSuccess
										: styles.matchBadgeFail
								}
								leftSection={
									file.matches ? <IconCheck size={12} /> : <IconX size={12} />
								}
							>
								{file.matches ? 'Matches' : 'No Match'}
							</Badge>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
