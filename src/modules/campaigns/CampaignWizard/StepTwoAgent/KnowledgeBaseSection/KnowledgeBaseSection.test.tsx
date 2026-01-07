import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeBaseSection from './KnowledgeBaseSection';
import { useCampaignWizardStore } from '~/stores/campaignWizardStore';
import {
	useKnowledgeBases,
	useKnowledgeBasesPaginated,
	useKnowledgeBasesByIds,
} from '~/queries/knowledgeBaseQueries';
import { MantineProvider } from '@mantine/core';

type TranslationOptions = {
	ns?: string;
	[key: string]: string | number | undefined;
};

const translations: Record<string, Record<string, string>> = {
	campaigns: {
		'form.agent.knowledgeBase.title': 'Knowledge Base',
		'form.agent.knowledgeBase.description':
			'Manage knowledge bases for this agent.',
		'form.agent.knowledgeBase.loading': 'Loading knowledge bases...',
		'form.agent.knowledgeBase.error': 'Error loading knowledge bases',
		'form.agent.knowledgeBase.remove': 'Remove',
		'form.agent.knowledgeBase.removeAria': 'Remove {{name}}',
		'form.agent.knowledgeBase.created': 'Created: {{date}}',
		'form.agent.knowledgeBase.noSelection': 'No knowledge bases selected',
		'form.agent.knowledgeBase.add': 'Add Knowledge Base',
		'form.agent.knowledgeBase.modal.title.select': 'Select Knowledge Bases',
		'form.agent.knowledgeBase.modal.title.create': 'Create Knowledge Base',
		'wizard.knowledgeBase.actions.create': 'Create Knowledge Base',
	},
	knowledgeBaseSelection: {
		noKnowledgeBases: 'No knowledge bases found',
		'actions.saveSelections': 'Save Selections',
		'selection.count': '{{count}} selected',
		'aria.selectAll': 'Select all',
		'aria.selectItem': 'Select {{name}}',
		'filters.search.placeholder': 'Search knowledge bases',
		'filters.types.all': 'All',
		'filters.types.url': 'URL',
		'filters.types.text': 'Text',
		'filters.types.file': 'File',
		'filters.tooltips.url': 'URL sources',
		'filters.tooltips.text': 'Text snippets',
		'filters.tooltips.file': 'Uploaded files',
		'columns.name': 'Name',
		'columns.description': 'Description',
		'columns.type': 'Type',
		'badges.file': 'FILE',
		'badges.url': 'URL',
		'badges.text': 'TEXT',
		'fallbacks.textSnippet': 'Text snippet',
		'fallbacks.file': 'Uploaded file',
		'actions.createNew': 'Create new',
	},
	common: {
		'actions.cancel': 'Cancel',
	},
};

const interpolate = (
	value: string,
	replacements?: Record<string, string | number | undefined>
) => {
	if (!replacements) {
		return value;
	}

	return value.replace(/\{\{(.*?)\}\}/g, (_, token) => {
		const key = token.trim();
		const replacement = replacements[key];
		return replacement !== undefined ? String(replacement) : '';
	});
};

vi.mock('react-i18next', () => ({
	useTranslation: (namespace = 'campaigns') => ({
		t: (key: string, options?: TranslationOptions) => {
			const { ns, ...params } = options ?? {};
			const targetNamespace = ns ?? namespace;
			const translated = translations[targetNamespace]?.[key] ?? key;
			return interpolate(translated, params);
		},
		i18n: {
			changeLanguage: vi.fn(),
		},
	}),
}));

// Mock stores and queries
vi.mock('~/stores/campaignWizardStore', () => ({
	useCampaignWizardStore: vi.fn(),
}));

vi.mock('~/queries/knowledgeBaseQueries', () => ({
	useKnowledgeBases: vi.fn(),
	useKnowledgeBasesPaginated: vi.fn(),
	useKnowledgeBasesByIds: vi.fn(),
}));

// Mock child components
vi.mock('./KnowledgeBaseWizardForm', () => ({
	default: ({ onSuccess, onCancel }: any) => (
		<div data-testid='kb-wizard-form'>
			KB Wizard Form
			<button onClick={() => onSuccess({ id: 99, name: 'New KB' })}>
				Create
			</button>
			<button onClick={onCancel}>Cancel</button>
		</div>
	),
}));

describe('KnowledgeBaseSection', () => {
	const mockSetKnowledgeBaseIds = vi.fn();
	const mockStore = {
		knowledgeBaseIds: [1],
		setKnowledgeBaseIds: mockSetKnowledgeBaseIds,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(
			useCampaignWizardStore as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue(mockStore);
		(useKnowledgeBases as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			data: [
				{ id: 1, name: 'KB 1', status: 'active' },
				{ id: 2, name: 'KB 2', status: 'pending' },
			],
			isLoading: false,
			error: null,
		});
		(
			useKnowledgeBasesPaginated as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue({
			data: {
				data: [
					{ id: 1, name: 'KB 1', status: 'active' },
					{ id: 2, name: 'KB 2', status: 'pending' },
				],
				total: 2,
				totalPages: 1,
			},
			isLoading: false,
			error: null,
		});
		(
			useKnowledgeBasesByIds as unknown as ReturnType<typeof vi.fn>
		).mockReturnValue([]);
	});

	const renderComponent = () => {
		return render(
			<MantineProvider>
				<KnowledgeBaseSection />
			</MantineProvider>
		);
	};

	it('renders selected knowledge bases', () => {
		renderComponent();
		expect(screen.getByText('KB 1')).toBeInTheDocument();
		expect(screen.queryByText('KB 2')).not.toBeInTheDocument();
	});

	it('shows loading state', () => {
		(useKnowledgeBases as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			data: null,
			isLoading: true,
			error: null,
		});
		renderComponent();
		expect(
			screen.getByText(
				translations.campaigns['form.agent.knowledgeBase.loading']
			)
		).toBeInTheDocument();
	});

	it('shows error state', () => {
		(useKnowledgeBases as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			data: null,
			isLoading: false,
			error: new Error('Failed'),
		});
		renderComponent();
		expect(
			screen.getByText(translations.campaigns['form.agent.knowledgeBase.error'])
		).toBeInTheDocument();
	});

	it('opens selection modal', async () => {
		renderComponent();
		fireEvent.click(
			screen.getByText(translations.campaigns['form.agent.knowledgeBase.add'])
		);
		expect(
			await screen.findByText(
				translations.campaigns['form.agent.knowledgeBase.modal.title.select']
			)
		).toBeInTheDocument();
		// Use getAllByText since KB 1 appears both in the main view and in the modal
		expect(screen.getAllByText('KB 1').length).toBeGreaterThan(0);
		expect(screen.getAllByText('KB 2').length).toBeGreaterThan(0);
	});

	it('saves selections from modal', async () => {
		renderComponent();
		fireEvent.click(
			screen.getByText(translations.campaigns['form.agent.knowledgeBase.add'])
		);

		// Wait for modal and click the row containing KB 2
		const modal = await screen.findByRole('dialog');
		const rows = modal.querySelectorAll('tr');
		const kb2Row = Array.from(rows).find((r) =>
			r.textContent?.includes('KB 2')
		) as HTMLElement | undefined;
		expect(kb2Row).toBeTruthy();
		if (kb2Row) fireEvent.click(kb2Row);

		fireEvent.click(
			screen.getByText(
				translations.knowledgeBaseSelection['actions.saveSelections']
			)
		);

		expect(mockSetKnowledgeBaseIds).toHaveBeenCalledWith([1, 2]);
	});

	it('opens create modal', async () => {
		renderComponent();
		fireEvent.click(
			screen.getByRole('button', {
				name: translations.campaigns['wizard.knowledgeBase.actions.create'],
			})
		);
		expect(await screen.findByTestId('kb-wizard-form')).toBeInTheDocument();
	});

	it('handles create success', async () => {
		renderComponent();
		fireEvent.click(
			screen.getByRole('button', {
				name: translations.campaigns['wizard.knowledgeBase.actions.create'],
			})
		);

		const createButton = await screen.findByText('Create');
		fireEvent.click(createButton);

		expect(mockSetKnowledgeBaseIds).toHaveBeenCalledWith([1, 99]);
	});

	it('removes knowledge base', () => {
		renderComponent();
		const removeButton = screen.getByLabelText('Remove KB 1');
		fireEvent.click(removeButton);
		expect(mockSetKnowledgeBaseIds).toHaveBeenCalledWith([]);
	});
});
