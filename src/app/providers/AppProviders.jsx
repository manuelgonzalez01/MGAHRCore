import { useEffect, useState } from "react";
import I18nProvider from "./I18nProvider";
import useAuthStore from "../store/authStore";
import authService from "../../services/auth/auth.service";
import platformService from "../../services/platform/platform.service";

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
  const logoutAuth = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(false);
  const [language, setLanguage] = useState(getBootstrapLanguage);
  const [bootstrapError, setBootstrapError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
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
          setReady(true);
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
  }, [hydrateAuth, language, logoutAuth]);

  useEffect(() => {
    setLanguage(getBootstrapLanguage());
  }, []);

  return (
    <I18nProvider>
      {ready ? (
        children
      ) : (
        <div className="platform-loader">
          <div className="platform-loader__panel">
            <span className="platform-loader__eyebrow">MGAHRCore</span>
            <h1>
              {language === "en"
                ? "Preparing the corporate workspace"
                : "Preparando el workspace corporativo"}
            </h1>
            <p>
              {bootstrapError
                || (language === "en"
                  ? "We are loading configuration, organizational structure, and operating data for a complete experience."
                  : "Estamos cargando configuracion, estructura organizacional y datos operativos para una experiencia completa.")}
            </p>
          </div>
        </div>
      )}
    </I18nProvider>
  );
}
