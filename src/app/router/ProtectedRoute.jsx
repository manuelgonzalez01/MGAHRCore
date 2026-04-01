import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute() {
  const { pathname, search } = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);

  if (!bootstrapped) {
    return (
      <div className="route-loader">
        Preparando acceso...
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${pathname}${search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
