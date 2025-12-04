import { Skeleton, Stack } from '@mantine/core';

import classes from './UserFormSkeleton.module.css';

const UserFormSkeleton: React.FC = () => {
	return (
		<div className={classes.form}>
			<div className={classes.body}>
				<div className={classes.contentGrid}>
					<Stack gap='sm' className={classes.formColumn}>
						<div className={classes.meta}>
							<div className={classes.metaHeader}>
								<Skeleton height={16} width='28%' radius='sm' />
							</div>
							<Skeleton height={10} width='70%' radius='sm' />
						</div>
						<section className={classes.section}>
							<div className={classes.sectionHeader}>
								<Skeleton height={12} width='20%' radius='sm' />
								<Skeleton height={8} width='45%' radius='sm' />
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
							<div className={classes.helperRow}>
								<div>
									<Skeleton height={8} width='25%' mb={8} radius='sm' />
									<Skeleton height={36} radius='sm' />
								</div>
								<div>
									<Skeleton height={8} width='40%' mb={6} radius='sm' />
									<Skeleton height={8} width='60%' radius='sm' />
								</div>
							</div>
							<div className={classes.passwordCard}>
								<div>
									<Skeleton height={8} width='30%' mb={8} radius='sm' />
									<Skeleton height={36} radius='sm' />
									<Skeleton height={8} width='70%' mt={10} radius='sm' />
								</div>
								<Stack gap={8}>
									<Skeleton height={8} width='100%' radius='sm' />
									<Skeleton height={8} width='90%' radius='sm' />
									<Skeleton height={8} width='85%' radius='sm' />
								</Stack>
							</div>
							<div className={classes.securityCard}>
								<div className={classes.securityHeader}>
									<Stack gap={4}>
										<Skeleton height={10} width='55%' radius='sm' />
										<Skeleton height={8} width='70%' radius='sm' />
									</Stack>
									<Skeleton height={20} width={80} radius='sm' />
								</div>
								<div className={classes.securityControls}>
									<Skeleton height={10} width='60%' radius='sm' />
									<Skeleton height={24} width={44} radius='sm' />
								</div>
							</div>
						</section>

						<section className={classes.section}>
							<div className={classes.sectionHeader}>
								<Skeleton height={12} width='18%' radius='sm' />
								<Skeleton height={8} width='30%' radius='sm' />
							</div>
							<div className={classes.row}>
								<div>
									<Skeleton height={8} width='35%' mb={8} radius='sm' />
									<Skeleton height={36} radius='sm' />
								</div>
								<div>
									<Skeleton height={8} width='35%' mb={8} radius='sm' />
									<Skeleton height={36} radius='sm' />
								</div>
							</div>
						</section>
					</Stack>

					<section className={`${classes.section} ${classes.rolesSection}`}>
						<div className={classes.sectionHeader}>
							<Skeleton height={12} width='30%' radius='sm' />
							<Skeleton height={8} width='60%' radius='sm' />
						</div>
						<Stack gap='xs'>
							<Skeleton height={38} radius='sm' />
							<Skeleton height={38} radius='sm' />
							<Skeleton height={38} radius='sm' />
						</Stack>
					</section>
				</div>
			</div>

			<div className={classes.actions}>
				<Skeleton height={36} width={130} radius='sm' />
			</div>
		</div>
	);
};

export default UserFormSkeleton;
