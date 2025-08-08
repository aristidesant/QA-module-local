import { LoginForm } from "~/modules/auth/LoginForm";
import { authenticate } from "../api/authApi";
import { redirect } from "react-router";

// We only persist the token; user info will be derived from the token elsewhere

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "on";

  // Basic validation
  const fieldErrors: Record<string, string> = {};
  if (!username?.trim()) fieldErrors.username = "Username is required";
  if (!password) fieldErrors.password = "Password is required";

  // If there are validation errors, return them
  if (Object.keys(fieldErrors).length > 0) {
    return new Response(
      JSON.stringify({
        fieldErrors,
        formError: "Please fix the errors below",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const result = await authenticate({ username, password });

    if (result?.accessToken) {
      if (typeof window !== "undefined") {
        // Persist only the access token for SPA auth
        window.localStorage.setItem("accessToken", result.accessToken);
      }
      return redirect("/");
    } else {
      return new Response(
        JSON.stringify({
          formError: "Invalid username or password",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "An unexpected error occurred";

    return new Response(
      JSON.stringify({
        formError: errorMessage,
      }),
      {
        status: error?.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <LoginForm />
    </div>
  );
}
