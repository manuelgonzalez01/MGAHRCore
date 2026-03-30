import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useI18n from "../../app/providers/useI18n";
import useAuthStore from "../../app/store/authStore";
import authService from "../../services/auth/auth.service";
import { menuConfig } from "../../config/menu.config";
import administrationService from "../../modules/administration/services/administration.service";

function resolveCurrentSection(pathname, t, language) {
  const match = menuConfig.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );

  if (!match) {
    return {
      title: pathname === "/dashboard" ? t("menu.dashboard") : "MGAHRCore",
      subtitle:
        language === "en"
          ? "Operational workspace"
          : "Workspace operativo",
    };
  }

  return {
    title: t(match.labelKey),
    subtitle: match.children?.length
      ? language === "en"
        ? `${match.children.length} connected operating views`
        : `${match.children.length} vistas operativas conectadas`
      : language === "en"
        ? "Operational workspace ready for execution"
        : "Workspace operativo listo para ejecucion",
  };
}

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const setActiveCompany = useAuthStore((state) => state.setActiveCompany);
  const logout = useAuthStore((state) => state.logout);
  const currentSection = resolveCurrentSection(pathname, t, language);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let ignore = false;

    if (user?.companies?.length) {
      setCompanies(user.companies);
      return () => {
        ignore = true;
      };
    }

    administrationService.getOrganizations().then((organizations) => {
      if (!ignore) {
        setCompanies(organizations.companies || []);
      }
    });

    return () => {
      ignore = true;
    };
  }, [user?.companies]);

  const activeCompanyName =
    companies.find((company) => company.id === activeCompanyId)?.name
    || user?.company;

  async function handleLogout() {
    try {
      await authService.logoutUser();
    } finally {
      logout();
      navigate("/login");
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-copy">
        <span className="topbar-eyebrow">
          {user?.canAccessAllCompanies
            ? activeCompanyName || (language === "en" ? "Global Scope" : "Alcance global")
            : user?.company || "MGAHRCore"}
        </span>
        <h3>{currentSection.title}</h3>
        <p>{currentSection.subtitle}</p>
      </div>

      <div className="topbar-actions">
        <Link to="/dashboard" className="topbar-chip">
          {t("menu.dashboard")}
        </Link>
        {user?.canAccessAllCompanies ? (
          <label className="topbar-company-switcher">
            <span>{language === "es" ? "Compania" : "Company"}</span>
            <select
              value={activeCompanyId || ""}
              onChange={(event) => setActiveCompany(event.target.value)}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          className="topbar-chip"
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
        >
          {language === "es" ? "ES" : "EN"}
        </button>
        <span className="topbar-chip topbar-chip--highlight">
          {user?.name || t("topbar.profile")}
        </span>
        <button type="button" className="topbar-chip" onClick={handleLogout}>
          {language === "es" ? "Cerrar sesion" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
