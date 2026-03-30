import { useState } from "react";
import { Link } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../selfService.css";
import SelfServiceApprovalTimeline from "../components/SelfServiceApprovalTimeline";
import SelfServiceEmployeePanel from "../components/SelfServiceEmployeePanel";
import SelfServiceEmptyState from "../components/SelfServiceEmptyState";
import SelfServiceHeader from "../components/SelfServiceHeader";
import SelfServiceRequestTable from "../components/SelfServiceRequestTable";
import useSelfServiceLocale from "../hooks/useSelfServiceLocale";
import useSelfServicePermissionRequests from "../hooks/useSelfServicePermissionRequests";
import {
  createPermissionRequest,
  createProfileChangeRequest,
  setSelfServiceEmployeeContext,
} from "../services/selfService.service";

function createPermissionForm() {
  return {
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  };
}

function createProfileForm() {
  return {
    employeeId: "",
    title: "",
    field: "phone",
    beforeValue: "",
    afterValue: "",
    notes: "",
  };
}

export default function PermissionsRequestsPage() {
  const { t, language } = useSelfServiceLocale();
  const { data, loading, error, reload } = useSelfServicePermissionRequests();
  const [permissionForm, setPermissionForm] = useState(createPermissionForm());
  const [profileForm, setProfileForm] = useState(createProfileForm());
  const [feedback, setFeedback] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  async function handleEmployeeChange(employeeId) {
    await setSelfServiceEmployeeContext(employeeId);
    setPermissionForm((current) => ({ ...current, employeeId }));
    setProfileForm((current) => ({ ...current, employeeId }));
    reload();
  }

  async function handlePermissionSubmit(event) {
    event.preventDefault();
    try {
      await createPermissionRequest({
        ...permissionForm,
        employeeId: permissionForm.employeeId || data.employee?.id,
      });
      setPermissionForm((current) => ({
        ...createPermissionForm(),
        employeeId: current.employeeId || data.employee?.id || "",
      }));
      setFeedback(t("Solicitud de permiso creada.", "Permission request created."));
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    try {
      await createProfileChangeRequest({
        ...profileForm,
        employeeId: profileForm.employeeId || data.employee?.id,
      });
      setProfileForm((current) => ({
        ...createProfileForm(),
        employeeId: current.employeeId || data.employee?.id || "",
      }));
      setFeedback(
        t(
          "Solicitud de cambio personal creada.",
          "Personal data change request created.",
        ),
      );
      reload();
    } catch (submissionError) {
      setFeedback(submissionError.message);
    }
  }

  if (loading) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("Cargando permisos", "Loading permissions")}
          description={t(
            "Preparando permisos y cambios personales.",
            "Preparing permissions and profile changes.",
          )}
        />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceEmptyState
          title={t("No pudimos cargar permisos", "Could not load permissions")}
          description={error?.message || ""}
        />
      </main>
    );
  }

  if (!data.employee) {
    return (
      <main className="suite-page self-service-page">
        <SelfServiceHeader
          eyebrow={t("Permissions & Profile", "Permissions & Profile")}
          title={t(
            "Permisos y cambios personales",
            "Permissions and personal changes",
          )}
          description={t(
            "Gestiona solicitudes cortas y cambios de datos con workflow visible.",
            "Manage short requests and data changes with visible workflow.",
          )}
        />
        <SelfServiceEmptyState
          title={t("Sin colaborador activo", "No active employee")}
          description={t(
            "Autoservicio necesita un colaborador activo para crear permisos o cambios personales.",
            "Self-Service needs one active employee to create permissions or personal changes.",
          )}
          action={(
            <Link className="suite-button" to="/employees">
              {t("Ir a Employees", "Go to Employees")}
            </Link>
          )}
        />
      </main>
    );
  }

  const employeeId = permissionForm.employeeId || data.employee.id;

  return (
    <main className="suite-page self-service-page">
      <SelfServiceHeader
        eyebrow={t("Permissions & Profile", "Permissions & Profile")}
        title={t("Permisos y cambios personales", "Permissions and personal changes")}
        description={t(
          "Gestiona solicitudes cortas y cambios de datos con workflow visible.",
          "Manage short requests and data changes with visible workflow.",
        )}
      />
      <SelfServiceEmployeePanel
        employee={data.employee}
        options={data.options?.employees || []}
        onChangeEmployee={handleEmployeeChange}
        t={t}
      />

      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <h2>{t("Nuevo permiso", "New permission")}</h2>
            <form className="self-service-form-grid" onSubmit={handlePermissionSubmit}>
              <label>
                <span>{t("Colaborador", "Employee")}</span>
                <select
                  value={employeeId}
                  onChange={(event) =>
                    setPermissionForm((current) => ({
                      ...current,
                      employeeId: event.target.value,
                    }))
                  }
                >
                  <option value="">{t("Selecciona", "Select")}</option>
                  {data.options.employees
                    .filter((item) => item.value)
                    .map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>{t("Tipo", "Type")}</span>
                <input
                  value={permissionForm.type}
                  onChange={(event) =>
                    setPermissionForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>{t("Inicio", "Start date")}</span>
                <input
                  type="date"
                  value={permissionForm.startDate}
                  onChange={(event) =>
                    setPermissionForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>{t("Fin", "End date")}</span>
                <input
                  type="date"
                  value={permissionForm.endDate}
                  onChange={(event) =>
                    setPermissionForm((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="self-service-form-span-2">
                <span>{t("Motivo", "Reason")}</span>
                <textarea
                  rows="3"
                  value={permissionForm.reason}
                  onChange={(event) =>
                    setPermissionForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="self-service-form-actions">
                <button type="submit" className="suite-button">
                  {t("Enviar permiso", "Submit permission")}
                </button>
              </div>
            </form>
          </section>

          <section className="suite-card">
            <h2>{t("Cambio personal", "Profile change")}</h2>
            <form className="self-service-form-grid" onSubmit={handleProfileSubmit}>
              <label>
                <span>{t("Campo", "Field")}</span>
                <select
                  value={profileForm.field}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      field: event.target.value,
                    }))
                  }
                >
                  <option value="phone">{t("Telefono", "Phone")}</option>
                  <option value="email">{t("Correo", "Email")}</option>
                  <option value="location">{t("Ubicacion", "Location")}</option>
                </select>
              </label>
              <label>
                <span>{t("Titulo", "Title")}</span>
                <input
                  value={profileForm.title}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>{t("Antes", "Before")}</span>
                <input
                  value={profileForm.beforeValue}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      beforeValue: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>{t("Despues", "After")}</span>
                <input
                  value={profileForm.afterValue}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      afterValue: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="self-service-form-span-2">
                <span>{t("Notas", "Notes")}</span>
                <textarea
                  rows="3"
                  value={profileForm.notes}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="self-service-form-actions">
                <button type="submit" className="suite-button">
                  {t("Enviar cambio", "Submit change")}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>

      {feedback ? (
        <section className="suite-card">
          <p className="self-service-feedback">{feedback}</p>
        </section>
      ) : null}

      <section className="suite-layout">
        <div className="suite-grid">
          <section className="suite-card">
            <SelfServiceRequestTable
              items={[...data.requests, ...data.profileChanges]}
              language={language}
            />
          </section>
          <SelfServiceApprovalTimeline
            request={selectedRequest || data.requests[0] || data.profileChanges[0]}
            language={language}
            t={t}
          />
        </div>
      </section>

      <section className="suite-card">
        <div className="suite-head">
          <div>
            <h2>
              {t(
                "Selecciona una solicitud para ver trazabilidad",
                "Select a request to inspect workflow",
              )}
            </h2>
          </div>
        </div>
        <div className="suite-list">
          {[...data.requests, ...data.profileChanges].map((item) => (
            <article
              key={item.id}
              className="suite-list-item"
              onClick={() => setSelectedRequest(item)}
            >
              <span>{item.requestType}</span>
              <strong>{item.title}</strong>
              <p className="suite-muted">{item.currentApprover || "-"}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
