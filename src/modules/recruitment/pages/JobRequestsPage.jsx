import { useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import RecruitmentEmptyState from "../components/RecruitmentEmptyState";
import RecruitmentFilters from "../components/RecruitmentFilters";
import RecruitmentFormPanel from "../components/RecruitmentFormPanel";
import RecruitmentHeader from "../components/RecruitmentHeader";
import RecruitmentSectionCard from "../components/RecruitmentSectionCard";
import JobRequestsTable from "../components/JobRequestsTable";
import useRecruitmentData from "../hooks/useRecruitmentData";
import {
  initialJobRequestForm,
  RECRUITMENT_MODALITY_OPTIONS,
  RECRUITMENT_PRIORITY_OPTIONS,
  RECRUITMENT_STATUS_OPTIONS,
} from "../schemas/recruitment.schema";
import { recruitmentCopy } from "../services/recruitment.service";
import useOrganizations from "../../administration/hooks/useOrganizations";
import "../recruitment.css";

export default function JobRequestsPage() {
  const { language } = useI18n();
  const copy = recruitmentCopy[language] ?? recruitmentCopy.es;
  const organizations = useOrganizations();
  const { dashboard, query, setQuery, status, setStatus, filteredJobRequests, createJobRequest } =
    useRecruitmentData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialJobRequestForm);
  const [errors, setErrors] = useState({});
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const isSpanish = language === "es";

  const statusOptions = useMemo(
    () =>
      RECRUITMENT_STATUS_OPTIONS.jobRequests.map((value) => ({
        value,
        label: copy.labels.status[value],
      })),
    [copy],
  );

  const selectedRequest = useMemo(
    () =>
      filteredJobRequests.find((item) => item.id === selectedRequestId) ||
      filteredJobRequests[0] ||
      null,
    [filteredJobRequests, selectedRequestId],
  );

  const positionOptions = useMemo(
    () => organizations.positions.filter((item) => item.useInRecruitment !== false),
    [organizations.positions],
  );

  const formFields = useMemo(
    () => [
      { name: "title", label: copy.forms.title },
      {
        name: "positionId",
        label: isSpanish ? "Posicion estructural" : "Structured position",
        type: positionOptions.length ? "select" : undefined,
        options: positionOptions.length
          ? [
              { value: "", label: isSpanish ? "Selecciona posicion" : "Select position" },
              ...positionOptions.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.departmentName} · ${item.levelName}`,
              })),
            ]
          : undefined,
      },
      {
        name: "department",
        label: copy.forms.department,
        type: organizations.departments.length ? "select" : undefined,
        options: organizations.departments.length
          ? [
              { value: "", label: language === "es" ? "Selecciona departamento" : "Select department" },
              ...organizations.departments.map((item) => ({ value: item.name, label: item.name })),
            ]
          : undefined,
      },
      { name: "hiringManager", label: copy.forms.manager },
      { name: "openings", label: copy.forms.openings, type: "number" },
      {
        name: "location",
        label: copy.forms.location,
        type: organizations.locations.length ? "select" : undefined,
        options: organizations.locations.length
          ? [
              { value: "", label: language === "es" ? "Selecciona ubicacion" : "Select location" },
              ...organizations.locations.map((item) => ({ value: item.name, label: item.name })),
            ]
          : undefined,
      },
      {
        name: "modality",
        label: copy.forms.modality,
        type: "select",
        options: RECRUITMENT_MODALITY_OPTIONS.map((value) => ({
          value,
          label: copy.labels.modality[value],
        })),
      },
      {
        name: "priority",
        label: copy.forms.priority,
        type: "select",
        options: RECRUITMENT_PRIORITY_OPTIONS.map((value) => ({
          value,
          label: copy.labels.priority[value],
        })),
      },
      {
        name: "status",
        label: copy.forms.status,
        type: "select",
        options: statusOptions,
      },
    ],
    [copy, isSpanish, language, organizations.departments, organizations.locations, positionOptions, statusOptions],
  );

  const requestSummary = useMemo(() => {
    const totalOpenings = filteredJobRequests.reduce(
      (sum, item) => sum + (Number(item.openings) || 0),
      0,
    );

    return [
      {
        label: isSpanish ? "Solicitudes visibles" : "Visible requests",
        value: filteredJobRequests.length,
      },
      {
        label: isSpanish ? "Vacantes acumuladas" : "Openings in scope",
        value: totalOpenings,
      },
      {
        label: isSpanish ? "En aprobacion" : "Awaiting approval",
        value: filteredJobRequests.filter((item) => item.status === "open").length,
      },
      {
        label: isSpanish ? "En ejecucion" : "In execution",
        value: filteredJobRequests.filter((item) => item.status === "in_progress").length,
      },
    ];
  }, [filteredJobRequests, isSpanish]);

  const requestSpotlight = useMemo(() => {
    if (!selectedRequest) {
      return [];
    }

    return [
      {
        label: isSpanish ? "Posicion" : "Position",
        value: selectedRequest.position || selectedRequest.title,
      },
      {
        label: copy.forms.manager,
        value: selectedRequest.hiringManager,
      },
      {
        label: copy.forms.department,
        value: selectedRequest.department,
      },
      {
        label: isSpanish ? "Nivel" : "Level",
        value: selectedRequest.levelName || selectedRequest.levelId || "-",
      },
      {
        label: copy.forms.location,
        value: selectedRequest.location,
      },
    ];
  }, [copy, isSpanish, selectedRequest]);

  function handleChange(field, value) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });

    setFormValues((current) => {
      if (field === "positionId") {
        const selectedPosition = positionOptions.find((item) => item.id === value);

        if (selectedPosition) {
          return {
            ...current,
            companyId: selectedPosition.companyId || "",
            companyName: selectedPosition.companyName || "",
            positionId: selectedPosition.id,
            position: selectedPosition.name,
            title: current.title || selectedPosition.name,
            departmentId: selectedPosition.departmentId || "",
            department: selectedPosition.departmentName || current.department,
            levelId: selectedPosition.levelId || current.levelId,
            levelName: selectedPosition.levelName || current.levelName,
            locationId: selectedPosition.locationId || "",
            location: selectedPosition.locationName || current.location,
            hiringManager: current.hiringManager || selectedPosition.departmentHead || "",
          };
        }
      }

      if (field === "department") {
        const selectedDepartment = organizations.departments.find((item) => item.name === value);

        if (selectedDepartment) {
          return {
            ...current,
            departmentId: selectedDepartment.id,
            department: selectedDepartment.name,
            hiringManager: current.hiringManager || selectedDepartment.departmentHead || "",
            locationId: selectedDepartment.locationId || current.locationId,
            location: selectedDepartment.locationName || current.location,
            levelId: selectedDepartment.levelId || current.levelId,
            levelName: selectedDepartment.levelName || current.levelName,
            companyId: selectedDepartment.companyId || current.companyId,
          };
        }
      }

      if (field === "location") {
        const selectedLocation = organizations.locations.find((item) => item.name === value);

        if (selectedLocation) {
          return {
            ...current,
            locationId: selectedLocation.id,
            location: selectedLocation.name,
          };
        }
      }

      return { ...current, [field]: value };
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.title.trim()) {
      nextErrors.title = isSpanish
        ? "Ingresa el nombre de la solicitud."
        : "Enter the request title.";
    }

    if (!formValues.department.trim()) {
      nextErrors.department = isSpanish
        ? "Selecciona o escribe un departamento."
        : "Provide a department.";
    }

    if (!formValues.hiringManager.trim()) {
      nextErrors.hiringManager = isSpanish
        ? "Define un responsable del proceso."
        : "Add an owner for the process.";
    }

    if (!formValues.location.trim()) {
      nextErrors.location = isSpanish
        ? "Especifica la ubicacion de la vacante."
        : "Specify the role location.";
    }

    if (Number(formValues.openings) <= 0) {
      nextErrors.openings = isSpanish
        ? "Las vacantes deben ser mayores a cero."
        : "Openings must be greater than zero.";
    }

    if (!formValues.positionId?.trim() && !formValues.position?.trim()) {
      nextErrors.positionId = isSpanish
        ? "Selecciona una posicion estructural."
        : "Select a structured position.";
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    createJobRequest(formValues);
    setFormValues(initialJobRequestForm);
    setErrors({});
    setIsFormOpen(false);
  }

  return (
    <div className="recruitment-page">
      <RecruitmentHeader
        eyebrow={copy.moduleTitle}
        title={copy.pages.jobRequestsTitle}
        description={copy.moduleDescription}
        highlights={[
          {
            label: copy.stats.openVacancies,
            value: dashboard.stats[0]?.value ?? 0,
          },
          {
            label: isSpanish ? "Vacantes activas" : "Active openings",
            value: dashboard.jobRequests.reduce((sum, item) => sum + (Number(item.openings) || 0), 0),
          },
          {
            label: isSpanish ? "Cobertura filtrada" : "Filtered coverage",
            value: filteredJobRequests.length,
          },
          {
            label: isSpanish ? "En ejecucion" : "In execution",
            value: requestSummary[3].value,
          },
        ]}
        primaryAction={
          <button
            type="button"
            className="recruitment-primary-button"
            onClick={() => setIsFormOpen(true)}
          >
            {copy.buttons.newRequest}
          </button>
        }
      />

      {isFormOpen ? (
        <div className="recruitment-drawer-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="recruitment-drawer-shell" onClick={(event) => event.stopPropagation()}>
            <RecruitmentFormPanel
              title={copy.forms.requestTitle}
              description={
                isSpanish
                  ? "Completa la solicitud desde un panel lateral con contexto organizacional, prioridad y validaciones claras."
                  : "Complete the request from a side panel with organizational context, priority, and clear validation."
              }
              fields={formFields}
              values={formValues}
              errors={errors}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              submitLabel={copy.forms.save}
              cancelLabel={copy.forms.cancel}
              variant="drawer"
            />
          </div>
        </div>
      ) : null}

      <RecruitmentFilters
        copy={copy}
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        statusOptions={statusOptions}
      />

      <div className="recruitment-page-grid recruitment-page-grid--workspace">
        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Pulso operativo" : "Operational pulse"}
            description={
              isSpanish
                ? "Resumen ejecutivo para priorizar capacidad, aprobaciones y avance del staffing."
                : "Executive summary to prioritize capacity, approvals, and staffing momentum."
            }
          >
            <div className="recruitment-summary-grid">
              {requestSummary.map((item) => (
                <article key={item.label} className="recruitment-kpi-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </RecruitmentSectionCard>

          <RecruitmentSectionCard
            title={copy.pages.jobRequestsTitle}
            description={copy.pages.homeSummaryDescription}
          >
            {filteredJobRequests.length ? (
              <JobRequestsTable
                items={filteredJobRequests}
                copy={copy}
                selectedId={selectedRequest?.id}
                onSelect={setSelectedRequestId}
              />
            ) : (
              <RecruitmentEmptyState
                copy={copy}
                action={
                  <button
                    type="button"
                    className="recruitment-primary-button"
                    onClick={() => setIsFormOpen(true)}
                  >
                    {copy.buttons.newRequest}
                  </button>
                }
              />
            )}
          </RecruitmentSectionCard>
        </div>

        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Request spotlight" : "Request spotlight"}
            description={
              isSpanish
                ? "Ficha ejecutiva de la solicitud seleccionada para seguimiento inmediato."
                : "Executive brief for the selected request and immediate follow-up."
            }
          >
            {selectedRequest ? (
              <div className="recruitment-summary-list">
                {requestSpotlight.map((item) => (
                  <div key={item.label} className="recruitment-summary-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>

          <RecruitmentSectionCard
            title={isSpanish ? "Prioridades del equipo" : "Team priorities"}
            description={
              isSpanish
                ? "Asegura visibilidad sobre la carga actual y las solicitudes de mayor impacto."
                : "Keep visibility on the current load and the highest-impact requisitions."
            }
          >
            <div className="recruitment-insight-list">
              {filteredJobRequests.slice(0, 3).map((item) => (
                <article key={item.id} className="recruitment-insight-card">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.hiringManager}</p>
                  </div>
                  <strong>{item.department}</strong>
                </article>
              ))}
              {!filteredJobRequests.length ? <RecruitmentEmptyState copy={copy} /> : null}
            </div>
          </RecruitmentSectionCard>
        </div>
      </div>
    </div>
  );
}
