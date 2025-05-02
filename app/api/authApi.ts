import axios from "axios";

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

const DEFAULT_API_URL = process.env.API_URL as string;

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
