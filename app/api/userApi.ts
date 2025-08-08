import axios from "axios";
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

// User API client (uses global axios interceptors for auth)
const userApi = (_authHeader: Record<string, string> = {}): UserApiClient => {
  return {
    // Get user by ID
    getUserById: async (id: number): Promise<UserModel> => {
      const response = await axios.get<UserModel>(
        `${DEFAULT_API_URL}/users/${id}`
      );
      return response.data;
    },

    // Get current authenticated user
    getCurrentUser: async (): Promise<UserModel> => {
      const response = await axios.get<UserModel>(
        `${DEFAULT_API_URL}/users/me`
      );
      return response.data;
    },

    // Update user
    updateUser: async (
      id: number,
      userData: Partial<UserModel>
    ): Promise<UserModel> => {
      const response = await axios.patch<UserModel>(
        `${DEFAULT_API_URL}/users/${id}`,
        userData
      );
      return response.data;
    },

    // Delete user
    deleteUser: async (id: number): Promise<void> => {
      await axios.delete(`${DEFAULT_API_URL}/users/${id}`);
    },

    // Create user
    createUser: async (userData: UserModel): Promise<UserModel> => {
      const response = await axios.post<UserModel>(
        `${DEFAULT_API_URL}/users`,
        userData
      );
      return response.data;
    },

    // Get all users
    getAllUsers: async (): Promise<UserModel[]> => {
      const { data } = await axios.get<UserModel[]>(`${DEFAULT_API_URL}/users`);
      return data;
    },
  };
};

export default userApi;
