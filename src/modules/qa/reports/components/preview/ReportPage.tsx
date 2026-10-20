import React from 'react';
import { useTranslation } from 'react-i18next';
import FlowTable from './FlowTable';
import type { FlowItem, PageEntry } from './pagination';
import styles from '../../Reports.module.css';

interface ReportPageProps {
	entries: PageEntry[];
	items: Map<string, FlowItem>;
	reportName: string;
	index: number;
	total: number;
	current: boolean;
}

/** One Letter sheet: the entries the paginator assigned to it, and the footer. */
export const ReportPage: React.FC<ReportPageProps> = ({
	entries,
	items,
	reportName,
	index,
	total,
	current,
}) => {
	const { t } = useTranslation('qa.reports');

	return (
		<section
			className={styles.sheet}
			data-current={current || undefined}
			aria-hidden={!current}
			aria-label={t('preview.pagination.pageLabel', { page: index + 1 })}
		>
			<div className={styles.sheetContent}>
				{entries.map((entry) => {
					const item = items.get(entry.id);
					if (!item) return null;
					if (entry.kind === 'block' && item.kind === 'block') {
						return <div key={entry.id}>{item.node}</div>;
					}
					if (entry.kind === 'table' && item.kind === 'table') {
						return (
							<FlowTable
								key={`${entry.id}:${entry.from}`}
								item={item}
								rows={item.rows.slice(entry.from, entry.to)}
								continued={entry.continued}
							/>
						);
					}
					return null;
				})}
			</div>
			<div className={styles.sheetFooter}>
				<span>{reportName}</span>
				<span>
					{t('preview.pagination.pageOf', { page: index + 1, total })}
				</span>
			</div>
		</section>
	);
};

export default ReportPage;
