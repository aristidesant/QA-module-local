import { getSession } from "../session.server";

/**
 * Utility function to determine the token from a request or a provided token.
 *
 * @param request - Optional request object to extract the token from.
 * @param token - Optional token string that takes priority over the request.
 * @returns The token string if available, otherwise null.
 */
export async function getToken(request?: Request, token?: string): Promise<string | null> {
  if (token) {
    // If token is provided, prioritize it.
    return token;
  }

  if (request) {
    // If request is provided, extract the token from the session.
    const session = await getSession(request.headers.get("Cookie"));
    return session.get("accessToken") || null;
  }

  // If neither token nor request is provided, return null.
  return null;
}
