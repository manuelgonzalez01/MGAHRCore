import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import useI18n from "../../app/providers/useI18n";
import useAuthStore from "../../app/store/authStore";
import authService from "../../services/auth/auth.service";
import { menuConfig } from "../../config/menu.config";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const user = useAuthStore((state) => state.user);
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const setActiveCompany = useAuthStore((state) => state.setActiveCompany);
  const logout = useAuthStore((state) => state.logout);
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > 900 : true,
  );

  const activeGroupKey = useMemo(() => {
    const activeGroup = menuConfig.find(
      (item) =>
        item.children &&
        (pathname === item.path || pathname.startsWith(`${item.path}/`)),
    );

    return activeGroup?.key || null;
  }, [pathname]);

  const expandedMenu = isDesktop ? openMenu : openMenu || activeGroupKey;

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth > 900);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function toggleMenu(key) {
    setOpenMenu((current) => (current === key ? null : key));
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  async function handleLogout() {
    try {
      await authService.logoutUser();
    } finally {
      logout();
      closeMobileMenu();
      navigate("/login");
    }
  }

  const activeCompanyName =
    user?.companies?.find((company) => company.id === activeCompanyId)?.name
    || user?.company
    || (language === "en" ? "Corporate workspace" : "Workspace corporativo");

  const availableCompanies = user?.companies || [];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        {user?.canAccessAllCompanies && availableCompanies.length > 1 ? (
          <label className="sidebar-company-switcher">
            <select
              value={activeCompanyId || availableCompanies[0]?.id || ""}
              onChange={(event) => setActiveCompany(event.target.value)}
              aria-label={language === "en" ? "Active company" : "Compania activa"}
            >
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="sidebar-brand__company">{activeCompanyName}</span>
        )}
      </div>

      <button
        type="button"
        className="sidebar-mobile-toggle"
        aria-expanded={isMobileMenuOpen ? "true" : "false"}
        onClick={() => setIsMobileMenuOpen((current) => !current)}
      >
        {t("common.menu")}
      </button>

      <nav className={`sidebar-nav${isMobileMenuOpen ? " is-open" : ""}`}>
        {menuConfig.map((item) => {
          const isGroupActive =
            !!item.children &&
            (pathname === item.path || pathname.startsWith(`${item.path}/`));

          return (
            <div
              key={item.key}
              className="sidebar-group"
              onMouseEnter={() => {
                if (isDesktop && item.children) {
                  setOpenMenu(item.key);
                }
              }}
              onMouseLeave={() => {
                if (isDesktop && item.children) {
                  setOpenMenu(null);
                }
              }}
            >
              {item.children ? (
                <div
                  className={`sidebar-link sidebar-trigger${
                    expandedMenu === item.key || isGroupActive ? " is-active" : ""
                  }`}
                >
                  {isDesktop ? (
                    <NavLink
                      to={item.path}
                      className="sidebar-trigger__label"
                      onClick={closeMobileMenu}
                    >
                      {t(item.labelKey)}
                    </NavLink>
                  ) : (
                    <button
                      type="button"
                      className="sidebar-trigger__label sidebar-trigger__label--button"
                      aria-expanded={expandedMenu === item.key ? "true" : "false"}
                      aria-label={
                        expandedMenu === item.key
                          ? t("Ocultar vistas del modulo", "Collapse module views")
                          : t("Mostrar vistas del modulo", "Expand module views")
                      }
                      onClick={() => toggleMenu(item.key)}
                    >
                      {t(item.labelKey)}
                    </button>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={() =>
                    `sidebar-link${
                      pathname === item.path || pathname.startsWith(`${item.path}/`)
                        ? " is-active"
                        : ""
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  {t(item.labelKey)}
                </NavLink>
              )}

              {item.children && expandedMenu === item.key ? (
                <div className="sidebar-submenu">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.key}
                      to={child.path}
                      className={({ isActive }) =>
                        `sidebar-sublink${isActive ? " is-active" : ""}`
                      }
                      onClick={() => {
                        closeMobileMenu();
                        if (isDesktop) {
                          setOpenMenu(null);
                        }
                      }}
                    >
                      {t(child.labelKey)}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          className="sidebar-link sidebar-link--action"
          onClick={handleLogout}
        >
          {language === "es" ? "Cerrar sesion" : "Sign out"}
        </button>
      </nav>
    </div>
  );
}
