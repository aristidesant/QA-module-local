import axios from 'axios';
import type {
	ClientConfig,
	CreateClientConfig,
	UpdateClientConfig,
	ContactColumnMapping,
} from '~/models/ClientConfig';
import { DEFAULT_API_URL } from './config';

/**
 * Client Config API client (relies on global axios interceptor for auth)
 */
const clientConfigApi = () => {
	return {
		// Get client config by name
		getClientConfig: async (name: string) => {
			const response = await axios.get(
				`${DEFAULT_API_URL}/client-configs/${name}`,
				{
					timeout: 5000,
				}
			);
			return response.data;
		},
	};
};

export default clientConfigApi;

// Get all client configurations
export const getClientConfigs = async (): Promise<ClientConfig[]> => {
	const response = await axios.get<ClientConfig[]>(
		`${DEFAULT_API_URL}/client-configs`
	);
	return response.data;
};

// Get a specific client configuration by name
export const getClientConfigByName = async (
	name: string
): Promise<ClientConfig> => {
	const response = await axios.get<ClientConfig>(
		`${DEFAULT_API_URL}/client-configs/${name}`
	);
	return response.data;
};

// Create a new client configuration
export const createClientConfig = async (
	data: CreateClientConfig
): Promise<ClientConfig> => {
	const response = await axios.post<ClientConfig>(
		`${DEFAULT_API_URL}/client-configs`,
		data
	);
	return response.data;
};

// Update an existing client configuration by name
export const updateClientConfig = async (
	name: string,
	data: UpdateClientConfig
): Promise<ClientConfig> => {
	const response = await axios.patch<ClientConfig>(
		`${DEFAULT_API_URL}/client-configs/${name}`,
		data
	);
	return response.data;
};

// Delete a client configuration by name
export const deleteClientConfig = async (name: string): Promise<void> => {
	await axios.delete(`${DEFAULT_API_URL}/client-configs/${name}`);
};

// Get contact columns mapping configuration
export const getContactColumnsMapping = async (): Promise<
	ContactColumnMapping[]
> => {
	const response = await axios.get<ContactColumnMapping[]>(
		`${DEFAULT_API_URL}/client-configs/contact-columns/mapping`
	);
	return response.data;
};

// Update contact columns mapping configuration
export const updateContactColumnsMapping = async (
	columns: string[]
): Promise<ContactColumnMapping[]> => {
	const response = await axios.post<ContactColumnMapping[]>(
		`${DEFAULT_API_URL}/client-configs/contact-columns/mapping`,
		columns
	);
	return response.data;
};
