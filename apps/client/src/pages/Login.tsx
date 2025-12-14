import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import AuthLayout from "../components/Auth/AuthLayout";
import LoginForm from "../components/Auth/LoginForm";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/profiles";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue">
      <LoginForm />
    </AuthLayout>
  );
}
