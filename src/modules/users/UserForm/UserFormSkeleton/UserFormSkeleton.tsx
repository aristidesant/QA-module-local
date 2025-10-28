import { Skeleton, Stack } from '@mantine/core';

import classes from './UserFormSkeleton.module.css';

const UserFormSkeleton: React.FC = () => {
	return (
		<div className={classes.form}>
			<Stack gap='md'>
				<div className={classes.meta}>
					<Skeleton height={8} width='20%' radius='sm' />
					<Skeleton height={8} width='60%' radius='sm' />
				</div>
				<section className={classes.section}>
					<div className={classes.sectionHeader}>
						<Skeleton height={12} width='15%' radius='sm' />
						<Skeleton height={8} width='40%' radius='sm' />
					</div>
					<div className={classes.row}>
						<div>
							<Skeleton height={8} width='20%' mb={8} radius='sm' />
							<Skeleton height={36} radius='sm' />
						</div>
						<div>
							<Skeleton height={8} width='25%' mb={8} radius='sm' />
							<Skeleton height={36} radius='sm' />
						</div>
					</div>
					<div className={`${classes.row} ${classes.rowSingle}`}>
						<div>
							<Skeleton height={8} width='15%' mb={8} radius='sm' />
							<Skeleton height={36} radius='sm' />
						</div>
					</div>
				</section>

				<section className={classes.section}>
					<div className={classes.sectionHeader}>
						<Skeleton height={12} width='15%' radius='sm' />
						<Skeleton height={8} width='35%' radius='sm' />
					</div>
					<div className={classes.row}>
						<div>
							<Skeleton height={8} width='30%' mb={8} radius='sm' />
							<Skeleton height={36} radius='sm' />
						</div>
						<div>
							<Skeleton height={8} width='30%' mb={8} radius='sm' />
							<Skeleton height={36} radius='sm' />
						</div>
					</div>
				</section>

				<div className={classes.actions}>
					<Skeleton height={36} width={120} radius='sm' />
				</div>
			</Stack>
		</div>
	);
};

export default UserFormSkeleton;
