import { useEffect, useState } from "react";
import I18nProvider from "./I18nProvider";
import useAuthStore from "../store/authStore";

const LANGUAGE_KEY = "mgahrcore.language";
const ADMIN_SETTINGS_KEY = "mgahrcore.administration.settings";

function getBootstrapLanguage() {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return "es";
  }

  const directLanguage = window.localStorage.getItem(LANGUAGE_KEY);
  if (directLanguage === "en" || directLanguage === "es") {
    return directLanguage;
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.language === "en" ? "en" : "es";
  } catch {
    return "es";
  }
}

export default function AppProviders({ children }) {
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const markBootstrapped = useAuthStore((state) => state.markBootstrapped);
  const logoutAuth = useAuthStore((state) => state.logout);
  const [language, setLanguage] = useState(getBootstrapLanguage);
  const [bootstrapError, setBootstrapError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      const [{ default: authService }, { default: platformService }] = await Promise.all([
        import("../../services/auth/auth.service"),
        import("../../services/platform/platform.service"),
      ]);

      try {
        await platformService.initializePlatform();
      } catch (error) {
        if (!ignore) {
          setBootstrapError(
            error?.message
              || (language === "en"
                ? "The platform could not be initialized."
                : "No fue posible inicializar la plataforma."),
          );
        }
      }

      try {
        const session = await authService.getCurrentSession();
        if (!ignore && session) {
          hydrateAuth(session);
        }
      } catch (error) {
        if (!ignore) {
          setBootstrapError(
            error?.message
              || (language === "en"
                ? "The session could not be synchronized."
                : "No fue posible sincronizar la sesion."),
          );
        }
      } finally {
        if (!ignore) {
          markBootstrapped();
        }
      }
    }

    bootstrap();

    const unsubscribe = authService.subscribeToAuthChanges((session) => {
      if (ignore) {
        return;
      }

      if (!session) {
        logoutAuth();
        return;
      }

      if (session.error) {
        setBootstrapError(
          session.error.message
            || (language === "en"
              ? "The session could not be synchronized."
              : "No fue posible sincronizar la sesion."),
        );
        return;
      }

      hydrateAuth(session);
    });

    return () => {
      ignore = true;
      unsubscribe?.();
    };
  }, [hydrateAuth, language, logoutAuth, markBootstrapped]);

  useEffect(() => {
    setLanguage(getBootstrapLanguage());
  }, []);

  return (
    <I18nProvider>
      {children}
      {bootstrapError ? (
        <div
          className="platform-bootstrap-status"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: "1rem",
            bottom: "1rem",
            maxWidth: "24rem",
            padding: "0.875rem 1rem",
            borderRadius: "0.9rem",
            background: "rgba(28, 34, 52, 0.94)",
            color: "#f5f7fb",
            boxShadow: "0 18px 40px rgba(8, 12, 20, 0.25)",
            zIndex: 2000,
            fontSize: "0.92rem",
          }}
        >
          {bootstrapError}
        </div>
      ) : null}
    </I18nProvider>
  );
}
