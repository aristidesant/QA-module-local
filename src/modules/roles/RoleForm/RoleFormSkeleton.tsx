import { Skeleton, Stack } from '@mantine/core';
import classes from './RoleForm.module.css';

const RoleFormSkeleton: React.FC = () => {
	return (
		<div className={classes.form} data-testid='form-skeleton'>
			<Stack gap='xs'>
				<div className={classes.meta}>
					<Skeleton height={20} width={60} data-testid='skeleton' />
					<Skeleton height={16} width='80%' data-testid='skeleton' />
				</div>

				<section className={classes.section}>
					<div className={classes.sectionHeader}>
						<Skeleton height={18} width={100} data-testid='skeleton' />
						<Skeleton height={14} width='60%' data-testid='skeleton' />
					</div>
					<div className={classes.row}>
						<Skeleton height={36} data-testid='skeleton' />
						<Skeleton height={36} data-testid='skeleton' />
					</div>
					<div className={`${classes.row} ${classes.rowSingle}`}>
						<Skeleton height={80} data-testid='skeleton' />
					</div>
				</section>

				<section className={classes.section}>
					<div className={classes.sectionHeader}>
						<Skeleton height={18} width={100} data-testid='skeleton' />
						<Skeleton height={14} width='60%' data-testid='skeleton' />
					</div>
					<div className={classes.row}>
						<Skeleton height={36} data-testid='skeleton' />
						<Skeleton height={36} data-testid='skeleton' />
					</div>
				</section>

				<div className={classes.actions}>
					<Skeleton height={36} width={120} data-testid='skeleton' />
				</div>
			</Stack>
		</div>
	);
};

export default RoleFormSkeleton;
