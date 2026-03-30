import { useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import useOrganizations from "../../administration/hooks/useOrganizations";
import CandidatePipelineCard from "../components/CandidatePipelineCard";
import CandidateProfilePreview from "../components/CandidateProfilePreview";
import CandidatesTable from "../components/CandidatesTable";
import RecruitmentEmptyState from "../components/RecruitmentEmptyState";
import RecruitmentFilters from "../components/RecruitmentFilters";
import RecruitmentFormPanel from "../components/RecruitmentFormPanel";
import RecruitmentHeader from "../components/RecruitmentHeader";
import RecruitmentSectionCard from "../components/RecruitmentSectionCard";
import useRecruitmentData from "../hooks/useRecruitmentData";
import {
  initialCandidateForm,
  RECRUITMENT_STAGE_OPTIONS,
  RECRUITMENT_STATUS_OPTIONS,
} from "../schemas/recruitment.schema";
import { recruitmentCopy } from "../services/recruitment.service";
import "../recruitment.css";

export default function CandidatesPage() {
  const { language } = useI18n();
  const copy = recruitmentCopy[language] ?? recruitmentCopy.es;
  const organizations = useOrganizations();
  const {
    query,
    setQuery,
    status,
    setStatus,
    stage,
    setStage,
    filteredCandidates,
    createCandidate,
  } = useRecruitmentData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialCandidateForm);
  const [errors, setErrors] = useState({});
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const isSpanish = language === "es";
  const positionOptions = useMemo(
    () => organizations.positions.filter((item) => item.useInRecruitment !== false),
    [organizations.positions],
  );

  const statusOptions = useMemo(
    () =>
      RECRUITMENT_STATUS_OPTIONS.candidates.map((value) => ({
        value,
        label: copy.labels.status[value],
      })),
    [copy],
  );

  const stageOptions = useMemo(
    () =>
      RECRUITMENT_STAGE_OPTIONS.map((value) => ({
        value,
        label: copy.labels.stage[value],
      })),
    [copy],
  );

  const selectedCandidate = useMemo(
    () =>
      filteredCandidates.find((candidate) => candidate.id === selectedCandidateId) ||
      filteredCandidates[0] ||
      null,
    [filteredCandidates, selectedCandidateId],
  );

  const candidateInsights = useMemo(() => {
    const averageScore = filteredCandidates.length
      ? Math.round(
          filteredCandidates.reduce((sum, item) => sum + (Number(item.score) || 0), 0) /
            filteredCandidates.length,
        )
      : 0;

    return [
      {
        label: isSpanish ? "En screening" : "In screening",
        value: filteredCandidates.filter((item) => item.stage === "screening").length,
      },
      {
        label: isSpanish ? "Entrevista final" : "Final interviews",
        value: filteredCandidates.filter((item) => item.stage === "interview").length,
      },
      {
        label: isSpanish ? "Shortlist activa" : "Active shortlist",
        value: filteredCandidates.filter((item) => item.status === "finalist").length,
      },
      {
        label: isSpanish ? "Fit promedio" : "Average fit",
        value: averageScore,
      },
    ];
  }, [filteredCandidates, isSpanish]);

  const spotlightMetrics = useMemo(() => {
    if (!selectedCandidate) {
      return [];
    }

    return [
      {
        label: isSpanish ? "Posicion" : "Position",
        value: selectedCandidate.position,
      },
      {
        label: isSpanish ? "Fuente" : "Source",
        value: selectedCandidate.source,
      },
      {
        label: isSpanish ? "Disponibilidad" : "Availability",
        value: selectedCandidate.availability,
      },
      {
        label: isSpanish ? "Contacto" : "Contact",
        value: selectedCandidate.contact,
      },
    ];
  }, [isSpanish, selectedCandidate]);

  const formFields = useMemo(
    () => [
      { name: "name", label: copy.forms.candidate },
      {
        name: "positionId",
        label: isSpanish ? "Posicion estructural" : "Structured position",
        type: positionOptions.length ? "select" : undefined,
        options: positionOptions.length
          ? [
              { value: "", label: isSpanish ? "Selecciona posicion" : "Select position" },
              ...positionOptions.map((item) => ({
                value: item.id,
                label: `${item.name} | ${item.departmentName} | ${item.levelName}`,
              })),
            ]
          : undefined,
      },
      { name: "position", label: copy.forms.position },
      { name: "location", label: copy.forms.location },
      { name: "contact", label: copy.forms.contact },
      {
        name: "stage",
        label: copy.forms.stage,
        type: "select",
        options: stageOptions,
      },
      {
        name: "status",
        label: copy.forms.status,
        type: "select",
        options: statusOptions,
      },
      { name: "score", label: copy.forms.score, type: "number" },
      { name: "availability", label: copy.forms.availability },
      { name: "experience", label: copy.forms.experience },
      { name: "source", label: copy.forms.source },
      { name: "summary", label: copy.forms.summary, type: "textarea" },
    ],
    [copy, isSpanish, positionOptions, stageOptions, statusOptions],
  );

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
            positionId: selectedPosition.id,
            position: selectedPosition.name,
            departmentId: selectedPosition.departmentId || "",
            department: selectedPosition.departmentName || "",
            levelId: selectedPosition.levelId || "",
            levelName: selectedPosition.levelName || "",
            locationId: selectedPosition.locationId || "",
            location: selectedPosition.locationName || current.location,
            companyId: selectedPosition.companyId || "",
            companyName: selectedPosition.companyName || "",
          };
        }
      }

      return { ...current, [field]: value };
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = isSpanish ? "Ingresa el nombre del candidato." : "Enter the candidate name.";
    }

    if (!formValues.position.trim()) {
      nextErrors.position = isSpanish ? "Define la vacante aplicada." : "Specify the applied position.";
    }

    if (!formValues.contact.trim()) {
      nextErrors.contact = isSpanish ? "Agrega un dato de contacto." : "Add a contact detail.";
    }

    if (!formValues.summary.trim()) {
      nextErrors.summary =
        isSpanish ? "Resume el perfil profesional." : "Add a short professional summary.";
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

    createCandidate(formValues);
    setFormValues(initialCandidateForm);
    setErrors({});
    setIsFormOpen(false);
  }

  return (
    <div className="recruitment-page">
      <RecruitmentHeader
        eyebrow={copy.moduleTitle}
        title={copy.pages.candidatesTitle}
        description={copy.moduleDescription}
        highlights={[
          {
            label: copy.stats.activeCandidates,
            value: filteredCandidates.length,
          },
          {
            label: isSpanish ? "Shortlist activa" : "Active shortlist",
            value: candidateInsights[2].value,
          },
          {
            label: isSpanish ? "Fit promedio" : "Average fit",
            value: candidateInsights[3].value,
          },
          {
            label: isSpanish ? "Final interviews" : "Final interviews",
            value: candidateInsights[1].value,
          },
        ]}
        primaryAction={
          <button
            type="button"
            className="recruitment-primary-button"
            onClick={() => setIsFormOpen(true)}
          >
            {copy.buttons.newCandidate}
          </button>
        }
      />

      {isFormOpen ? (
        <div className="recruitment-drawer-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="recruitment-drawer-shell" onClick={(event) => event.stopPropagation()}>
            <RecruitmentFormPanel
              title={copy.forms.candidateTitle}
              description={
                isSpanish
                  ? "Captura el perfil desde un panel lateral y conecta el candidato con la estructura maestra del negocio."
                  : "Capture the profile from a side panel and connect the candidate with the business master structure."
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
        stage={stage}
        onStageChange={setStage}
        statusOptions={statusOptions}
        stageOptions={stageOptions}
      />

      <div className="recruitment-page-grid recruitment-page-grid--workspace">
        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Vista de pipeline" : "Pipeline workspace"}
            description={
              isSpanish
                ? "Selecciona candidatos desde la tabla o las cards para actualizar el panel ejecutivo."
                : "Select candidates from the table or cards to update the executive panel."
            }
          >
            <div className="recruitment-summary-grid">
              {candidateInsights.map((item) => (
                <article key={item.label} className="recruitment-kpi-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </RecruitmentSectionCard>

          <RecruitmentSectionCard title={copy.pages.candidatesTitle} description={copy.moduleDescription}>
            {filteredCandidates.length ? (
              <>
                <CandidatesTable
                  items={filteredCandidates}
                  copy={copy}
                  selectedId={selectedCandidate?.id}
                  onSelect={setSelectedCandidateId}
                />
                <div className="recruitment-candidates-grid">
                  {filteredCandidates.slice(0, 4).map((candidate) => (
                    <CandidatePipelineCard
                      key={candidate.id}
                      item={candidate}
                      copy={copy}
                      selected={candidate.id === selectedCandidate?.id}
                      onSelect={setSelectedCandidateId}
                    />
                  ))}
                </div>
              </>
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>
        </div>

        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Candidate spotlight" : "Candidate spotlight"}
            description={
              isSpanish
                ? "Panel premium con contexto, readiness y siguiente accion sugerida."
                : "Premium panel with context, readiness, and suggested next action."
            }
            actions={
              selectedCandidate ? (
                <button type="button" className="recruitment-inline-button">
                  {copy.buttons.openProfile}
                </button>
              ) : null
            }
          >
            {selectedCandidate ? (
              <CandidateProfilePreview
                candidate={selectedCandidate}
                copy={copy}
                language={language}
              />
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>

          <RecruitmentSectionCard
            title={isSpanish ? "Decision support" : "Decision support"}
            description={
              isSpanish
                ? "Contexto ejecutivo para acelerar shortlist, entrevistas y oferta."
                : "Executive context to accelerate shortlist, interviews, and offer."
            }
          >
            {selectedCandidate ? (
              <div className="recruitment-summary-list">
                {spotlightMetrics.map((item) => (
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
        </div>
      </div>
    </div>
  );
}
