import { commitSession, getSession } from "~/server-session";
import { redirect } from "react-router";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));

  session.unset("userId");
  session.unset("clientId");
  session.unset("email");
  session.unset("accessToken");
  session.flash("success", "Logged out successfully");

  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function LogoutPage() {
  // Optionally, could show a message, but redirect is preferred UX.
  return redirect("/login");
}
