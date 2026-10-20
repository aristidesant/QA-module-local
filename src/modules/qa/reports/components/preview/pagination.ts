import type { ReactNode } from 'react';

export interface FlowRow {
	id: string;
	/** A `<Table.Tr>`. */
	node: ReactNode;
}

/**
 * The report as a flow of items. Blocks are atomic (cover, section title, tiles, chart);
 * tables can be split between pages by rows, with their header repeated.
 */
export type FlowItem =
	| {
			kind: 'block';
			id: string;
			node: ReactNode;
			/** Never end a page on this block: it stays with the start of the next item. */
			keepWithNext?: boolean;
	  }
	| {
			kind: 'table';
			id: string;
			/** Section label, shown as "<title> · continued" on carried-over pages. */
			title: string;
			/** The header `<Table.Tr>`. */
			head: ReactNode;
			rows: FlowRow[];
	  };

/** Heights in px, measured with the content laid out at the page's content width. */
export interface Measured {
	blocks: Record<string, number>;
	tables: Record<string, { head: number; rows: number[]; chrome: number }>;
}

export type PageEntry =
	| { kind: 'block'; id: string }
	| {
			kind: 'table';
			id: string;
			/** Rows [from, to) of the table sit on this page. */
			from: number;
			to: number;
			/** The table started on an earlier page. */
			continued: boolean;
	  };

const MIN_ROWS = 2;
const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

/**
 * Packs the flow into pages of `height` px, `gap` px between items.
 * - A block that does not fit moves to the next page; a block taller than a page sits alone.
 * - A `keepWithNext` block also needs the start of the next item (the next block, or a table's
 *   header and its first two rows) to fit, so a section title is never left at the bottom.
 * - A table fills the room it has; the rest continues on the next pages with the header
 *   repeated. A table never starts with fewer than two rows at the bottom of a page.
 * Items without a measurement count as 0 px, so the first render never throws.
 */
export function paginate(
	items: FlowItem[],
	measured: Measured,
	height: number,
	gap: number,
	continuedExtra = 0
): PageEntry[][] {
	const pages: PageEntry[][] = [[]];
	let used = 0;

	const current = () => pages[pages.length - 1];
	const room = () => height - used - (current().length ? gap : 0);
	const place = (entry: PageEntry, entryHeight: number) => {
		used += (current().length ? gap : 0) + entryHeight;
		current().push(entry);
	};
	const newPage = () => {
		if (current().length === 0) return;
		pages.push([]);
		used = 0;
	};

	const blockHeight = (id: string) => measured.blocks[id] ?? 0;
	const startOf = (item: FlowItem | undefined): number => {
		if (!item) return 0;
		if (item.kind === 'block') return blockHeight(item.id);
		const table = measured.tables[item.id];
		if (!table) return 0;
		return (
			table.head +
			table.chrome +
			sum(table.rows.slice(0, Math.min(MIN_ROWS, table.rows.length)))
		);
	};

	items.forEach((item, index) => {
		if (item.kind === 'block') {
			const own = blockHeight(item.id);
			const needed = item.keepWithNext
				? own + gap + startOf(items[index + 1])
				: own;
			if (needed > room()) newPage();
			place({ kind: 'block', id: item.id }, own);
			return;
		}

		const table = measured.tables[item.id];
		const total = item.rows.length;
		if (!table || total === 0) {
			place(
				{ kind: 'table', id: item.id, from: 0, to: total, continued: false },
				0
			);
			return;
		}

		let from = 0;
		let continued = false;
		while (from < total) {
			const overhead =
				table.head + table.chrome + (continued ? continuedExtra : 0);
			const minRows = Math.min(MIN_ROWS, total - from);
			if (overhead + sum(table.rows.slice(from, from + minRows)) > room())
				newPage();

			const available = room() - overhead;
			let count = 0;
			let rowsHeight = 0;
			while (
				from + count < total &&
				rowsHeight + table.rows[from + count] <= available
			) {
				rowsHeight += table.rows[from + count];
				count += 1;
			}
			if (count === 0) {
				// A row taller than a whole page: force it, never loop.
				count = 1;
				rowsHeight = table.rows[from];
			}

			place(
				{ kind: 'table', id: item.id, from, to: from + count, continued },
				overhead + rowsHeight
			);
			from += count;
			continued = true;
			if (from < total) newPage();
		}
	});

	return pages;
}
