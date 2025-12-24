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
		const input = screen.getByLabelText(
			/contactListPage.contactsTable.appendModal.selectFile/i
		);
		await user.upload(input, file);

		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.saveFile',
			})
		);
		expect(onUpload).toHaveBeenCalledWith(file);
		expect(
			screen.getByText(/contactListPage.contactsTable.appendModal.fileSaved/)
		).toBeInTheDocument();
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
		await user.upload(
			screen.getByLabelText(
				/contactListPage.contactsTable.appendModal.selectFile/i
			),
			file
		);
		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.saveFile',
			})
		);

		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.appendToList',
			})
		);
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
		await user.upload(
			screen.getByLabelText(
				/contactListPage.contactsTable.appendModal.selectFile/i
			),
			file
		);
		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.saveFile',
			})
		);

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
		await user.upload(
			screen.getByLabelText(
				/contactListPage.contactsTable.appendModal.selectFile/i
			),
			file
		);
		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.saveFile',
			})
		);
		await user.click(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.appendToList',
			})
		);

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
		const dropArea = screen.getByText(
			/contactListPage.contactsTable.appendModal.dragAndDrop/i
		).parentElement as HTMLElement;

		fireEvent.dragOver(dropArea, {
			dataTransfer: { files: [file] },
		});
		fireEvent.drop(dropArea, {
			dataTransfer: { files: [file] },
		});

		expect(
			screen.getByText(/contactListPage.contactsTable.appendModal.selected/)
		).toBeInTheDocument();
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

		expect(
			screen.getByRole('button', {
				name: 'contactListPage.contactsTable.appendModal.saveFile',
			})
		).toBeDisabled();
	});
});
