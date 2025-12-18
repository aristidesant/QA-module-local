import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { FlowSummary } from './FlowSummary';

describe('FlowSummary', () => {
	it('renders imported state with source campaign name', () => {
		renderWithProviders(
			<FlowSummary
				origin='imported'
				nodeCount={0}
				importSourceCampaignName='Source Campaign'
				canPreviewImported
				onPreviewImported={vi.fn()}
				onStartOver={vi.fn()}
				isDeleting={false}
			/>
		);

		expect(
			screen.getByText('Outcome flow imported successfully')
		).toBeInTheDocument();
		expect(screen.getByText('Imported')).toBeInTheDocument();
		expect(screen.getByText('From: Source Campaign')).toBeInTheDocument();
		expect(screen.getByText('Preview Flow')).toBeInTheDocument();
	});

	it('renders created state with node count', () => {
		renderWithProviders(
			<FlowSummary
				origin='created'
				nodeCount={3}
				canPreviewImported={false}
				onEditCreated={vi.fn()}
				onStartOver={vi.fn()}
				isDeleting={false}
			/>
		);

		expect(
			screen.getByText('Outcome flow created successfully')
		).toBeInTheDocument();
		expect(screen.getByText('3 outcomes')).toBeInTheDocument();
	});
});
