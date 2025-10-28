import { Box, Text, Progress } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { validateStrongPassword } from '~/utils/passwordHelper';
import classes from './PasswordStrengthIndicator.module.css';

interface PasswordStrengthIndicatorProps {
	password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
	password,
}) => {
	if (!password || password.trim().length === 0) {
		return null;
	}

	const validation = validateStrongPassword(password);
	const requirements = [
		{
			check: password.length >= 8,
			label: 'At least 8 characters',
		},
		{
			check: /[a-z]/.test(password),
			label: 'Contains lowercase letter',
		},
		{
			check: /[A-Z]/.test(password),
			label: 'Contains uppercase letter',
		},
		{
			check: /[0-9]/.test(password),
			label: 'Contains number',
		},
		{
			check: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
			label: 'Contains special character',
		},
	];

	const metRequirements = requirements.filter((req) => req.check).length;
	const progressValue = (metRequirements / requirements.length) * 100;

	const getProgressColor = () => {
		if (validation.isValid) return 'green';
		if (metRequirements >= 3) return 'yellow';
		return 'red';
	};

	return (
		<Box className={classes.container}>
			<Progress
				value={progressValue}
				color={getProgressColor()}
				size='sm'
				className={classes.progress}
			/>

			<div className={classes.requirements}>
				{requirements.map((requirement, index) => (
					<div
						key={index}
						className={`${classes.requirement} ${
							requirement.check ? classes.met : classes.unmet
						}`}
					>
						{requirement.check ? (
							<IconCheck size={16} className={classes.iconMet} />
						) : (
							<IconX size={16} className={classes.iconUnmet} />
						)}
						<Text className={classes.label}>{requirement.label}</Text>
					</div>
				))}
			</div>

			{validation.isValid && (
				<Text className={classes.successMessage}>
					Password meets all requirements
				</Text>
			)}
		</Box>
	);
};

export default PasswordStrengthIndicator;
