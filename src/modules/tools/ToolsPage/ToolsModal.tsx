import { Modal } from '@mantine/core';
import ToolForm from '../ToolForm';

interface ToolsModalProps {
	opened: boolean;
	onClose: () => void;
	toolId?: string | number;
	categoryId?: string | number;
}

const ToolsModal = ({
	opened,
	onClose,
	toolId,
	categoryId,
}: ToolsModalProps) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			fullScreen
			padding={0}
			withCloseButton={false}
			styles={{
				body: {
					height: '100%',
					padding: 0,
					background: 'var(--mantine-color-gray-0)',
				},
				content: {
					height: '100vh',
				},
			}}
		>
			<ToolForm
				toolId={toolId}
				categoryId={categoryId}
				onSuccess={onClose}
				onCancel={onClose}
			/>
		</Modal>
	);
};

export default ToolsModal;
