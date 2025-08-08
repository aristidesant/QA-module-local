import { Navigate } from "react-router";

export async function clientLoader() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("clientId");
    window.localStorage.removeItem("email");
    window.localStorage.removeItem("accessToken");
  }
  return null;
}

export default function LogoutPage() {
  return <Navigate to="/login" replace />;
}
