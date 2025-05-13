export function getTokenFromClient() {
  const token = window.localStorage.getItem("accessToken");
  return token;
}

export function getClientAuthorizationHeader(): Record<string, string> {
  const token = getTokenFromClient();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    : {};
}
