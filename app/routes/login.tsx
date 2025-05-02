import { LoginForm } from "~/modules/auth/LoginForm";
import { authenticate } from "../api/authApi";
import { commitSession, getSession } from "~/session.server";
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

  try {
    const result = await authenticate({ username, password });

    if (result?.accessToken) {
      const userData = jwtDecode<CustomJwtPayload>(result.accessToken);

      session.set("userId", userData.userId.toString());
      session.set("clientId", userData.clientId.toString());
      session.set("email", userData.email);
      session.set("accessToken", result.accessToken);
      session.flash("success", "Login successful");

      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } else {
      session.flash("error", "Invalid credentials");
      return redirect("/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    session.flash("error", error?.response?.data?.message || "Login failed");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
