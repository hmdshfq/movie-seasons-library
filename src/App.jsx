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
import ManageProfiles from "./pages/ManageProfiles";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import Watchlist from "./pages/Watchlist";

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
        <WatchlistProvider>
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
                <Route path="/library" element={<Home />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/recommendations" element={<Home />} />
              </Route>
            </Route>

            {/* Redirect root to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WatchlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
