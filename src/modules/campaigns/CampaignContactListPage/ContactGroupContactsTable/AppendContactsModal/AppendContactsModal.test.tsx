import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AppendContactsModal from './AppendContactsModal';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

describe('AppendContactsModal', () => {
	it('uploads file and shows saved state', async () => {
		const user = userEvent.setup();
		const onUpload = vi.fn().mockResolvedValue({ contactGroupFileId: 7 });

		renderWithProviders(
			<AppendContactsModal
				onClose={vi.fn()}
				onUpload={onUpload}
				onAppend={vi.fn()}
				isUploading={false}
				isAppending={false}
			/>
		);

		const file = new File(['csv'], 'contacts.csv', { type: 'text/csv' });
		const input = screen.getByLabelText(/select csv file/i);
		await user.upload(input, file);

		await user.click(screen.getByRole('button', { name: 'Save File' }));
		expect(onUpload).toHaveBeenCalledWith(file);
		expect(screen.getByText(/File saved. ID: 7/)).toBeInTheDocument();
	});

	it('handles append action after upload', async () => {
		const user = userEvent.setup();
		const onUpload = vi.fn().mockResolvedValue({ contactGroupFileId: 3 });
		const onAppend = vi.fn().mockResolvedValue(undefined);
		const onClose = vi.fn();

		renderWithProviders(
			<AppendContactsModal
				onClose={onClose}
				onUpload={onUpload}
				onAppend={onAppend}
				isUploading={false}
				isAppending={false}
			/>
		);

		const file = new File(['csv'], 'contacts.csv', { type: 'text/csv' });
		await user.upload(screen.getByLabelText(/select csv file/i), file);
		await user.click(screen.getByRole('button', { name: 'Save File' }));

		await user.click(screen.getByRole('button', { name: 'Append to List' }));
		expect(onAppend).toHaveBeenCalledWith(3);
		expect(onClose).toHaveBeenCalled();
	});

	it('surfaces upload errors', async () => {
		const user = userEvent.setup();
		const onUpload = vi
			.fn()
			.mockRejectedValue(new Error('Failed to upload file.'));

		renderWithProviders(
			<AppendContactsModal
				onClose={vi.fn()}
				onUpload={onUpload}
				onAppend={vi.fn()}
				isUploading={false}
				isAppending={false}
			/>
		);

		const file = new File(['csv'], 'contacts.csv', { type: 'text/csv' });
		await user.upload(screen.getByLabelText(/select csv file/i), file);
		await user.click(screen.getByRole('button', { name: 'Save File' }));

		expect(screen.getByText('Failed to upload file.')).toBeInTheDocument();
	});

	it('shows append errors', async () => {
		const user = userEvent.setup();
		const onUpload = vi.fn().mockResolvedValue({ contactGroupFileId: 11 });
		const onAppend = vi
			.fn()
			.mockRejectedValue(new Error('Failed to append contacts.'));

		renderWithProviders(
			<AppendContactsModal
				onClose={vi.fn()}
				onUpload={onUpload}
				onAppend={onAppend}
				isUploading={false}
				isAppending={false}
			/>
		);

		const file = new File(['csv'], 'contacts.csv', { type: 'text/csv' });
		await user.upload(screen.getByLabelText(/select csv file/i), file);
		await user.click(screen.getByRole('button', { name: 'Save File' }));
		await user.click(screen.getByRole('button', { name: 'Append to List' }));

		expect(screen.getByText('Failed to append contacts.')).toBeInTheDocument();
	});

	it('handles drag and drop selection', () => {
		renderWithProviders(
			<AppendContactsModal
				onClose={vi.fn()}
				onUpload={vi.fn()}
				onAppend={vi.fn()}
				isUploading={false}
				isAppending={false}
			/>
		);

		const file = new File(['data'], 'dropped.csv', { type: 'text/csv' });
		const dropArea = screen.getByText(/drag & drop or click to browse/i)
			.parentElement as HTMLElement;

		fireEvent.dragOver(dropArea, {
			dataTransfer: { files: [file] },
		});
		fireEvent.drop(dropArea, {
			dataTransfer: { files: [file] },
		});

		expect(screen.getByText('Selected: dropped.csv')).toBeInTheDocument();
	});

	it('disables save button when no file selected', () => {
		renderWithProviders(
			<AppendContactsModal
				onClose={vi.fn()}
				onUpload={vi.fn()}
				onAppend={vi.fn()}
				isUploading={false}
				isAppending={false}
			/>
		);

		expect(screen.getByRole('button', { name: 'Save File' })).toBeDisabled();
	});
});
