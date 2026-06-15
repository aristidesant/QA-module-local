import axios from 'axios';
import type {
	ClientModel,
	CreateClientRequest,
	UpdateClientRequest,
} from '~/models/ClientModel';
import type {
	ClientThemeModel,
	UpdateClientThemeRequest,
} from '~/models/ClientTheme';
import { DEFAULT_API_URL } from './config';

interface ClientApiClient {
	getClientById: (id: number) => Promise<ClientModel>;
	getAllClients: () => Promise<ClientModel[]>;
	createClient: (clientData: CreateClientRequest) => Promise<ClientModel>;
	updateClient: (
		id: number,
		clientData: UpdateClientRequest
	) => Promise<ClientModel>;
	deleteClient: (id: number) => Promise<void>;
	getClientTheme: (id: number) => Promise<ClientThemeModel>;
	patchClientTheme: (
		id: number,
		data: UpdateClientThemeRequest
	) => Promise<ClientThemeModel>;
}

// Client API client (uses global axios interceptors for auth)
const clientApi = (
	_authHeader: Record<string, string> = {}
): ClientApiClient => {
	return {
		// Get client by ID
		getClientById: async (id: number): Promise<ClientModel> => {
			const response = await axios.get<ClientModel>(
				`${DEFAULT_API_URL}/clients/${id}`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Get all clients
		getAllClients: async (): Promise<ClientModel[]> => {
			const response = await axios.get<ClientModel[]>(
				`${DEFAULT_API_URL}/clients`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Create client
		createClient: async (
			clientData: CreateClientRequest
		): Promise<ClientModel> => {
			const response = await axios.post<ClientModel>(
				`${DEFAULT_API_URL}/clients`,
				clientData,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Update client
		updateClient: async (
			id: number,
			clientData: UpdateClientRequest
		): Promise<ClientModel> => {
			const response = await axios.patch<ClientModel>(
				`${DEFAULT_API_URL}/clients/${id}`,
				clientData,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Delete client
		deleteClient: async (id: number): Promise<void> => {
			await axios.delete(`${DEFAULT_API_URL}/clients/${id}`, {
				headers: { ..._authHeader },
			});
		},

		// Get client theme
		getClientTheme: async (id: number): Promise<ClientThemeModel> => {
			const response = await axios.get<ClientThemeModel>(
				`${DEFAULT_API_URL}/clients/${id}/theme`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},

		// Patch client theme (merge semantics)
		patchClientTheme: async (
			id: number,
			data: UpdateClientThemeRequest
		): Promise<ClientThemeModel> => {
			const response = await axios.patch<ClientThemeModel>(
				`${DEFAULT_API_URL}/clients/${id}/theme`,
				data,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},
	};
};

export default clientApi;
