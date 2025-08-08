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

const getDefaultApiUrl = () => {
  if (typeof window !== "undefined") {
    return (window as any).ENV?.API_URL || process.env.API_URL;
  }
  if (typeof process !== "undefined") {
    return process.env.API_URL;
  }
  return undefined;
};

const DEFAULT_API_URL = getDefaultApiUrl() as string;

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
