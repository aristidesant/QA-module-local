import axios from "axios";
import { DEFAULT_API_URL } from "./config";

export type AuthRequest = {
  username: string;
  password: string;
};

export type AuthSuccessResponse = {
  accessToken: string;
};

export type AuthErrorResponse = {
  message: string;
  statusCode: number;
};

export async function authenticate(
  credentials: AuthRequest,
  apiUrl: string = DEFAULT_API_URL
): Promise<AuthSuccessResponse> {
  const response = await axios.post<AuthSuccessResponse>(
    `${apiUrl}/auth/login`,
    credentials
  );
  return response.data;
}
