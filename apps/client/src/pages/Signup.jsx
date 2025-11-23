import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import AuthLayout from "../components/Auth/AuthLayout";
import SignupForm from "../components/Auth/SignupForm";

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profiles", { replace: true });
    }
  }, [user, navigate]);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Movie Library to get personalized recommendations">
      <SignupForm />
    </AuthLayout>
  );
}
