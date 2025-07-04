import axios from "axios";
import type { AxiosInstance } from "axios";
import type { UserModel } from "~/models/UserModels";

const getDefaultApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return (window as any).ENV?.API_URL || process.env.API_URL || "";
  }
  return process.env.API_URL || "";
};

const DEFAULT_API_URL = getDefaultApiUrl();

interface UserApiClient {
  getUserById: (id: number) => Promise<UserModel>;
  getCurrentUser: () => Promise<UserModel>;
  updateUser: (id: number, userData: Partial<UserModel>) => Promise<UserModel>;
  deleteUser: (id: number) => Promise<void>;
  createUser: (userData: UserModel) => Promise<UserModel>;
  getAllUsers: () => Promise<UserModel[]>;
}

// User API client
// @param authHeader - Authorization header object, e.g. { Authorization: 'Bearer ...' }
const userApi = (authHeader: Record<string, string>): UserApiClient => {
  const client: AxiosInstance = axios.create({
    baseURL: `${DEFAULT_API_URL}`,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
    },
  });

  return {
    // Get user by ID
    getUserById: async (id: number): Promise<UserModel> => {
      const response = await client.get<UserModel>(`/users/${id}`);
      return response.data;
    },

    // Get current authenticated user
    getCurrentUser: async (): Promise<UserModel> => {
      const response = await client.get<UserModel>("/users/me");
      return response.data;
    },

    // Update user
    updateUser: async (
      id: number,
      userData: Partial<UserModel>
    ): Promise<UserModel> => {
      const response = await client.patch<UserModel>(`/users/${id}`, userData);
      return response.data;
    },

    // Delete user
    deleteUser: async (id: number): Promise<void> => {
      await client.delete(`/users/${id}`);
    },

    // Create user
    createUser: async (userData: UserModel): Promise<UserModel> => {
      const response = await client.post<UserModel>("/users", userData);
      return response.data;
    },

    // Get all users
    getAllUsers: async (): Promise<UserModel[]> => {
      const { data } = await client.get<UserModel[]>("/users");
      return data;
    },
  };
};

export default userApi;
