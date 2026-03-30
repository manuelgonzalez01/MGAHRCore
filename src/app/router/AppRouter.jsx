import { createElement, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import useI18n from "../providers/useI18n";
import LoginPage from "../../modules/auth/pages/LoginPage";
import ForgotPasswordPage from "../../modules/auth/pages/ForgotPasswordPage";
import RegisterPage from "../../modules/auth/pages/RegisterPage";
import LandingPage from "../../modules/public/pages/LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import { appRoutes } from "./routes.config";

function RouteLoader() {
  const { language } = useI18n();

  return (
    <div className="route-loader">
      {language === "en" ? "Loading module..." : "Cargando modulo..."}
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {appRoutes.map(({ path, component }) => (
              <Route
                key={path}
                path={path}
                element={(
                  <Suspense fallback={<RouteLoader />}>
                    {createElement(component)}
                  </Suspense>
                )}
              />
            ))}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
