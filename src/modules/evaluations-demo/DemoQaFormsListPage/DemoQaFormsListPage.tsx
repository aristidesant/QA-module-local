import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, Select, TextInput } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import BaseTable from '~/components/BaseTable';
import PaginationControls from '~/components/PaginationControls';
import DemoStatRow from '../components/DemoStatRow';
import { DEMO_QA_FORMS } from './mockQaForms';
import { useDemoQaFormsColumns } from './useDemoQaFormsColumns';

const PAGE_SIZE = 10;

const DemoQaFormsListPage: React.FC = () => {
	const navigate = useNavigate();
	const columns = useDemoQaFormsColumns();
	const [search, setSearch] = useState('');
	const [qaTypeFilter, setQaTypeFilter] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(PAGE_SIZE);

	const qaTypeOptions = useMemo(
		() => Array.from(new Set(DEMO_QA_FORMS.map((f) => f.qaType))),
		[]
	);

	const filtered = useMemo(() => {
		return DEMO_QA_FORMS.filter((form) => {
			const matchesSearch =
				form.testName.toLowerCase().includes(search.toLowerCase()) ||
				form.createdBy.toLowerCase().includes(search.toLowerCase());
			const matchesType = !qaTypeFilter || form.qaType === qaTypeFilter;
			return matchesSearch && matchesType;
		});
	}, [search, qaTypeFilter]);

	useEffect(() => {
		setPage(1);
	}, [search, qaTypeFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const paginated = useMemo(
		() => filtered.slice((page - 1) * pageSize, page * pageSize),
		[filtered, page, pageSize]
	);

	const stats = useMemo(() => {
		const qaTypesCount = new Set(DEMO_QA_FORMS.map((f) => f.qaType)).size;
		const draftsCount = DEMO_QA_FORMS.filter((f) => f.status === 'Draft').length;
		return [
			{ key: 'total', title: 'Total Tests', value: DEMO_QA_FORMS.length },
			{ key: 'types', title: 'QA Types', value: qaTypesCount },
			{ key: 'drafts', title: 'Drafts', value: draftsCount },
		];
	}, []);

	return (
		<ContentContainer
			contentWidth='full'
			title='QA Forms'
			description='Manage and organize your quality assurance forms'
			titleRight={
				<Button
					color='green'
					leftSection={<IconPlus size={16} />}
					onClick={() => navigate('/role-preview/new-qa-form')}
				>
					New QA Form
				</Button>
			}
		>
			<Flex direction='column' gap='md'>
				<DemoStatRow stats={stats} />

				<Flex gap='sm' wrap='wrap'>
					<TextInput
						placeholder='Search by test name or creator...'
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						style={{ flex: 1, minWidth: 220 }}
					/>
					<Select
						placeholder='Filter by QA Type'
						data={qaTypeOptions}
						value={qaTypeFilter}
						onChange={setQaTypeFilter}
						clearable
						w={220}
					/>
				</Flex>

				<BaseTable
					data={paginated}
					columns={columns}
					getRowId={(form) => form.id}
					density='compact'
					filterMode='client'
					emptyMessage='No tests found'
				/>

				<PaginationControls
					currentPage={page}
					totalPages={totalPages}
					itemsPerPage={pageSize}
					totalItems={filtered.length}
					onPageChange={setPage}
					onItemsPerPageChange={(value) => {
						setPageSize(Number(value ?? PAGE_SIZE));
						setPage(1);
					}}
					itemLabel='tests'
				/>
			</Flex>
		</ContentContainer>
	);
};

export default DemoQaFormsListPage;
