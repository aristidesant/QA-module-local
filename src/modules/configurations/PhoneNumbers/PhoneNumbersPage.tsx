import { useState } from 'react';
import { Stack, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPhone, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { PhoneNumberList } from './PhoneNumberList';
import { PhoneNumberForm } from './PhoneNumberForm';
import { PhoneNumber } from '~/models/PhoneNumber';

export default function PhoneNumbersPage() {
	const { t } = useTranslation('phone-numbers');
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);

	const handleEdit = (phone: PhoneNumber) => {
		setSelectedPhone(phone);
		open();
	};

	const handleCreate = () => {
		setSelectedPhone(null);
		open();
	};

	const handleClose = () => {
		close();
		setSelectedPhone(null);
	};

	return (
		<SectionCard
			title={t('list.title')}
			icon={IconPhone}
			actions={{
				primary: {
					kind: 'add',
					icon: IconPlus,
					label: t('list.addPhoneNumber'),
					onClick: handleCreate,
				},
			}}
		>
			<Stack gap='xs'>
				<PhoneNumberList onEdit={handleEdit} />
			</Stack>
			<Modal
				opened={opened}
				onClose={handleClose}
				title={selectedPhone ? t('form.editTitle') : t('form.createTitle')}
				size='xl'
			>
				<PhoneNumberForm
					initialData={selectedPhone}
					onClose={handleClose}
					onSuccess={handleClose}
				/>
			</Modal>
		</SectionCard>
	);
}
