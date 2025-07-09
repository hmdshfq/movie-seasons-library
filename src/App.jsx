import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profiles from "./pages/Profiles";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Recommendations from "./pages/Recommendations";
import ManageProfiles from "./pages/ManageProfiles";

import "./index.css";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/manage-profiles" element={<ManageProfiles />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Route>
          </Route>

          {/* Redirect root to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
