import { Outlet } from "react-router-dom";

export default function BypassRoute() {
  // Temporary bypass for testing - REMOVE IN PRODUCTION
  console.warn("WARNING: Using auth bypass - REMOVE IN PRODUCTION");

  return <Outlet />;
}
