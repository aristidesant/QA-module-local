import type { ConfiguredFtp } from './callSource.types';

/**
 * Stand-in for the FTP servers an administrator has configured for the client.
 * A campaign only picks one of these; the connection details live in the admin
 * configuration and are never shown here.
 */
export const CONFIGURED_FTPS: ConfiguredFtp[] = [
	{ id: 'ftp-001', name: 'Main call center FTP' },
	{ id: 'ftp-002', name: 'Collections recordings' },
	{ id: 'ftp-003', name: 'Backup SFTP' },
];
