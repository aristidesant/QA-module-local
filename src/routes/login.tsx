import { LoginForm } from "~/modules/auth/LoginForm";

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <LoginForm />
    </div>
  );
}
