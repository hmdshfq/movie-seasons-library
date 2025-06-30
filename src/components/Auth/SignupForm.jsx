import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import { validateEmail, validatePassword } from "../../utils/validators";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profileName: "Main Profile",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.profileName.trim()) {
      newErrors.profileName = "Profile name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.profileName);
      navigate("/profiles");
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && <ErrorMessage message={errors.general} />}

      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={Mail}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        icon={Lock}
        placeholder="••••••••"
        helperText="At least 8 characters with uppercase, lowercase, and numbers"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        icon={Lock}
        placeholder="••••••••"
        required
      />

      <Input
        label="Profile Name"
        type="text"
        name="profileName"
        value={formData.profileName}
        onChange={handleChange}
        error={errors.profileName}
        icon={User}
        placeholder="Main Profile"
        helperText="This will be your default profile name"
        required
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading}>
        Create Account
      </Button>

      <p className="text-center text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
