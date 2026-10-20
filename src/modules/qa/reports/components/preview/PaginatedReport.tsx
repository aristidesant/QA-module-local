import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Group, Pagination, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { LETTER } from '../../constants';
import FlowTable from './FlowTable';
import ReportPage from './ReportPage';
import { paginate, type FlowItem, type Measured } from './pagination';
import styles from '../../Reports.module.css';

interface PaginatedReportProps {
	items: FlowItem[];
	reportName: string;
}

const EMPTY: Measured = { blocks: {}, tables: {} };
const sameMeasured = (a: Measured, b: Measured) =>
	JSON.stringify(a) === JSON.stringify(b);

/**
 * The report as Letter pages. Every item is first laid out, invisibly, at the page's content
 * width to read its height; the paginator then packs the items into pages. Pages are scaled to
 * the panel with one CSS variable, so line and page breaks never change with the screen.
 */
export const PaginatedReport: React.FC<PaginatedReportProps> = ({
	items,
	reportName,
}) => {
	const { t } = useTranslation('qa.reports');
	const measureRef = useRef<HTMLDivElement>(null);
	const [measured, setMeasured] = useState<Measured>(EMPTY);
	const [page, setPage] = useState(1);
	const { ref: viewportRef, width } = useElementSize();

	const measure = useCallback(() => {
		const root = measureRef.current;
		if (!root) return;
		const next: Measured = { blocks: {}, tables: {} };
		root.querySelectorAll<HTMLElement>('[data-flow]').forEach((element) => {
			const id = element.dataset.flow as string;
			const height = Math.ceil(element.getBoundingClientRect().height);
			if (element.dataset.kind === 'table') {
				const head = Math.ceil(
					element.querySelector('[data-flow-head]')?.getBoundingClientRect()
						.height ?? 0
				);
				const rows = Array.from(
					element.querySelectorAll('[data-flow-row]')
				).map((row) => Math.ceil(row.getBoundingClientRect().height));
				const rowsTotal = rows.reduce((total, h) => total + h, 0);
				next.tables[id] = {
					head,
					rows,
					chrome: Math.max(0, height - head - rowsTotal),
				};
			} else {
				next.blocks[id] = height;
			}
		});
		setMeasured((previous) => (sameMeasured(previous, next) ? previous : next));
	}, []);

	// Measure after every change of the content, when fonts arrive and when the layer resizes.
	useLayoutEffect(() => {
		measure();
	}, [items, measure]);
	useEffect(() => {
		const root = measureRef.current;
		if (!root) return undefined;
		const observer = new ResizeObserver(() => measure());
		observer.observe(root);
		let cancelled = false;
		document.fonts?.ready.then(() => {
			if (!cancelled) measure();
		});
		return () => {
			cancelled = true;
			observer.disconnect();
		};
	}, [measure]);

	const pages = useMemo(
		() =>
			paginate(
				items,
				measured,
				LETTER.contentHeight,
				LETTER.gap,
				LETTER.continuedExtra
			),
		[items, measured]
	);
	const byId = useMemo(
		() => new Map(items.map((item) => [item.id, item])),
		[items]
	);

	const total = pages.length;
	const current = Math.min(page, total);
	const goTo = (next: number) => setPage(Math.min(Math.max(1, next), total));

	const scale = width > 0 ? Math.min(1, width / LETTER.width) : 1;

	return (
		<div className={styles.document}>
			<Group justify='space-between' className={styles.toolbar} wrap='wrap'>
				<Text size='sm' c='dimmed'>
					{t('preview.pagination.pageOf', { page: current, total })}
				</Text>
				<Pagination
					size='sm'
					total={total}
					value={current}
					onChange={setPage}
					getControlProps={(control) =>
						control === 'previous'
							? { 'aria-label': t('preview.pagination.prev') }
							: control === 'next'
								? { 'aria-label': t('preview.pagination.next') }
								: {}
					}
				/>
			</Group>

			<div
				ref={viewportRef}
				className={styles.viewport}
				tabIndex={0}
				onKeyDown={(event) => {
					if (event.key === 'ArrowLeft') {
						event.preventDefault();
						goTo(current - 1);
					} else if (event.key === 'ArrowRight') {
						event.preventDefault();
						goTo(current + 1);
					}
				}}
			>
				<Box
					className={styles.stage}
					mx='auto'
					w={`${Math.round(LETTER.width * scale)}px`}
					h={`${Math.round(LETTER.height * scale)}px`}
					__vars={{ '--page-scale': String(scale) }}
				>
					{pages.map((entries, index) => (
						<ReportPage
							key={index}
							entries={entries}
							items={byId}
							reportName={reportName}
							index={index}
							total={total}
							current={index + 1 === current}
						/>
					))}
				</Box>
			</div>

			<div ref={measureRef} className={styles.measure} aria-hidden>
				{items.map((item) =>
					item.kind === 'block' ? (
						<div key={item.id} data-flow={item.id} data-kind='block'>
							{item.node}
						</div>
					) : (
						<div key={item.id} data-flow={item.id} data-kind='table'>
							<FlowTable item={item} rows={item.rows} />
						</div>
					)
				)}
			</div>
		</div>
	);
};

export default PaginatedReport;
