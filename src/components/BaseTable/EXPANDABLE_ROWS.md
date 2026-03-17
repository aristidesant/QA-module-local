# BaseTable Expandable Rows Feature

## Overview

The `BaseTable` component now supports expandable rows, allowing you to display nested content (like inner tables, detailed information, or any custom component) when a row is clicked.

## Key Features

- **Toggle Expansion**: Click on a row to expand/collapse it
- **Expand Icon**: Visual indicator (chevron) that rotates when expanded
- **Custom Content**: Render any React component in the expanded area
- **Controlled State**: Optional callback to track which rows are expanded
- **Initial State**: Set initially expanded rows via prop
- **Works with Existing Features**: Compatible with sorting, filtering, and pagination

## Basic Usage

```tsx
import BaseTable from '~/components/BaseTable';
import { ColumnDef } from '@tanstack/react-table';

type Contact = {
	id: string;
	name: string;
	email: string;
	details?: string;
};

const MyComponent = () => {
	const columns: ColumnDef<Contact>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
	];

	const data: Contact[] = [
		{
			id: '1',
			name: 'John Doe',
			email: 'john@example.com',
			details: 'Additional info...',
		},
	];

	return (
		<BaseTable
			data={data}
			columns={columns}
			enableExpanding={true}
			renderExpandedRow={(row) => (
				<div style={{ padding: '16px' }}>
					<p>{row.details}</p>
				</div>
			)}
		/>
	);
};
```

## Props

### Required Props (for expandable feature)

- `enableExpanding: boolean` - Set to `true` to enable row expansion
- `renderExpandedRow: (row: TData) => React.ReactNode` - Function that renders the expanded content

### Optional Props

- `onExpandedChange?: (expandedRowIds: string[]) => void` - Callback when expansion state changes
- `initialExpandedRows?: string[]` - Array of row IDs that should be initially expanded

## Advanced Example: Nested Table

```tsx
import BaseTable from '~/components/BaseTable';
import { ColumnDef } from '@tanstack/react-table';
import { Text } from '@mantine/core';

type Order = {
	id: string;
	orderNumber: string;
	customer: string;
	items: OrderItem[];
};

type OrderItem = {
	id: string;
	product: string;
	quantity: number;
	price: number;
};

const OrdersTable = () => {
	// Main table columns
	const orderColumns: ColumnDef<Order>[] = [
		{ accessorKey: 'orderNumber', header: 'Order #' },
		{ accessorKey: 'customer', header: 'Customer' },
	];

	// Inner table columns
	const itemColumns: ColumnDef<OrderItem>[] = [
		{ accessorKey: 'product', header: 'Product' },
		{ accessorKey: 'quantity', header: 'Qty' },
		{ accessorKey: 'price', header: 'Price' },
	];

	const orders: Order[] = [
		{
			id: '1',
			orderNumber: 'ORD-001',
			customer: 'John Doe',
			items: [
				{ id: '1', product: 'Widget A', quantity: 2, price: 10.0 },
				{ id: '2', product: 'Widget B', quantity: 1, price: 15.0 },
			],
		},
	];

	return (
		<BaseTable
			data={orders}
			columns={orderColumns}
			enableExpanding={true}
			renderExpandedRow={(order) => (
				<div>
					<Text size='sm' fw={600} mb='xs'>
						Order Items
					</Text>
					<BaseTable
						data={order.items}
						columns={itemColumns}
						density='compact'
					/>
				</div>
			)}
		/>
	);
};
```

## Combining with onRowClick

When `enableExpanding` is enabled, clicking a row will:

1. Toggle the expansion state
2. Also call `onRowClick` if provided

```tsx
<BaseTable
	data={data}
	columns={columns}
	enableExpanding={true}
	renderExpandedRow={(row) => <DetailView data={row} />}
	onRowClick={(row) => {
		// You can still perform other actions when a row is clicked
	}}
/>
```

## Controlling Expanded State

Track which rows are expanded:

```tsx
const [expandedRows, setExpandedRows] = useState<string[]>([]);

<BaseTable
	data={data}
	columns={columns}
	enableExpanding={true}
	renderExpandedRow={(row) => <DetailView data={row} />}
	onExpandedChange={setExpandedRows}
	initialExpandedRows={['1', '3']} // Rows with id '1' and '3' start expanded
/>;
```

## Styling

The expanded content area has a light gray background by default. You can customize it by:

1. Using inline styles in your `renderExpandedRow` function
2. Applying custom CSS classes to your expanded content
3. Modifying `BaseTable.module.css` if you need global changes

Example with custom styling:

```tsx
renderExpandedRow={(row) => (
  <div style={{
    background: 'white',
    padding: '20px',
    borderLeft: '3px solid var(--mantine-color-blue-6)'
  }}>
    <YourCustomComponent data={row} />
  </div>
)}
```

## Tips

1. **Performance**: For large datasets with complex expanded content, consider lazy loading or memoization
2. **Click Handling**: The expand icon column is separate from the row click - you can click just the icon to expand without triggering `onRowClick`
3. **Empty State**: Handle cases where there's no expanded content to show:
   ```tsx
   renderExpandedRow={(row) => (
     row.items?.length > 0 ? (
       <InnerTable items={row.items} />
     ) : (
       <Text c="dimmed">No items to display</Text>
     )
   )}
   ```

## Complete Example

See `/src/examples/ExpandableTableExample.tsx` for a full working example with nested phone numbers table.
