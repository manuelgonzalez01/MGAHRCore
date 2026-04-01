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
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
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

  function handleCompanyChange(companyId) {
    setActiveCompany(companyId);
    setIsCompanyMenuOpen(false);
    closeMobileMenu();
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
        {availableCompanies.length > 1 ? (
          <div
            className={`sidebar-company-menu${isCompanyMenuOpen ? " is-open" : ""}`}
            onMouseEnter={() => {
              if (isDesktop) {
                setIsCompanyMenuOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (isDesktop) {
                setIsCompanyMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              className="sidebar-company-menu__trigger"
              aria-expanded={isCompanyMenuOpen ? "true" : "false"}
              aria-label={language === "en" ? "Change company" : "Cambiar compania"}
              onClick={() => {
                if (!isDesktop) {
                  setIsCompanyMenuOpen((current) => !current);
                }
              }}
            >
              <span className="sidebar-brand__company">{activeCompanyName}</span>
            </button>

            {isCompanyMenuOpen ? (
              <div className="sidebar-company-menu__content">
                {availableCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    className={`sidebar-company-menu__item${
                      company.id === activeCompanyId ? " is-active" : ""
                    }`}
                    onClick={() => handleCompanyChange(company.id)}
                  >
                    {company.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
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

      <div className={`sidebar-main${isMobileMenuOpen ? " is-open" : ""}`}>
        <nav
          className={`sidebar-nav${isMobileMenuOpen ? " is-open" : ""}`}
          aria-label={language === "en" ? "Primary navigation" : "Navegacion principal"}
        >
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
        </nav>

        <div className="sidebar-actions">
          <button
            type="button"
            className="sidebar-link sidebar-link--action"
            onClick={handleLogout}
          >
            {language === "es" ? "Cerrar sesion" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
