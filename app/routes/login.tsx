import { LoginForm } from "~/modules/auth/LoginForm";
import { authenticate } from "../api/authApi";
import { commitSession, getSession } from "~/server-session";
import { redirect } from "react-router";
import { jwtDecode, type JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
  userId: number;
  clientId: number;
  email: string;
}

export function loader() {
  return {};
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const session = await getSession(request.headers.get("Cookie"));
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
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  try {
    const result = await authenticate({ username, password });

    if (result?.accessToken) {
      const userData = jwtDecode<CustomJwtPayload>(result.accessToken);

      session.set("userId", userData.userId.toString());
      session.set("clientId", userData.clientId.toString());
      session.set("email", userData.email);
      session.set("accessToken", result.accessToken);
      // Set session expiration based on remember me
      const sessionOptions = rememberMe
        ? { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
        : {};

      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session, sessionOptions),
        },
      });
    } else {
      return new Response(
        JSON.stringify({
          formError: "Invalid username or password",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await commitSession(session),
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
          "Set-Cookie": await commitSession(session),
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
