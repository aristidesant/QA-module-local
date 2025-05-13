/**
 * Utility function to determine the token from a request or a provided token.
 *
 * @param request - Optional request object to extract the token from.
 * @param token - Optional token string that takes priority over the request.
 * @returns The token string if available, otherwise null.
 */
export async function getToken(request?: Request): Promise<string | null> {
  const isBrowser = typeof window !== "undefined";
  if (!isBrowser && request) {
    const { getTokenFromServer } = await import("~/server-session");
    return getTokenFromServer(request);
  }
  if (isBrowser) {
    const { getTokenFromClient } = await import("~/client-session");
    return getTokenFromClient();
  }
  return null;
}

export async function getAuthorizationHeader(
  request?: Request
): Promise<Record<string, string>> {
  const token = await getToken(request);
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    : {};
}
