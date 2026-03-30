import { useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import RecruitmentEmptyState from "../components/RecruitmentEmptyState";
import RecruitmentFilters from "../components/RecruitmentFilters";
import RecruitmentFormPanel from "../components/RecruitmentFormPanel";
import RecruitmentHeader from "../components/RecruitmentHeader";
import RecruitmentSectionCard from "../components/RecruitmentSectionCard";
import InterviewsTable from "../components/InterviewsTable";
import useRecruitmentData from "../hooks/useRecruitmentData";
import {
  initialInterviewForm,
  RECRUITMENT_INTERVIEW_FORMATS,
  RECRUITMENT_STATUS_OPTIONS,
} from "../schemas/recruitment.schema";
import { recruitmentCopy } from "../services/recruitment.service";
import "../recruitment.css";

export default function InterviewsPage() {
  const { language } = useI18n();
  const copy = recruitmentCopy[language] ?? recruitmentCopy.es;
  const { dashboard, query, setQuery, status, setStatus, filteredInterviews, createInterview } =
    useRecruitmentData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialInterviewForm);
  const [errors, setErrors] = useState({});
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const isSpanish = language === "es";

  const statusOptions = useMemo(
    () =>
      RECRUITMENT_STATUS_OPTIONS.interviews.map((value) => ({
        value,
        label: copy.labels.status[value],
      })),
    [copy],
  );
  const candidateOptions = useMemo(
    () =>
      dashboard.candidates.map((item) => ({
        value: item.name,
        label: `${item.name} | ${item.position}`,
      })),
    [dashboard.candidates],
  );

  const formFields = useMemo(
    () => [
      {
        name: "candidateName",
        label: copy.forms.candidate,
        type: candidateOptions.length ? "select" : undefined,
        options: candidateOptions.length
          ? [
              { value: "", label: isSpanish ? "Selecciona candidato" : "Select candidate" },
              ...candidateOptions,
            ]
          : undefined,
      },
      { name: "vacancy", label: copy.forms.vacancy },
      { name: "interviewer", label: copy.forms.interviewer },
      { name: "date", label: copy.forms.date, type: "date" },
      { name: "time", label: copy.forms.time, type: "time" },
      {
        name: "format",
        label: copy.forms.format,
        type: "select",
        options: RECRUITMENT_INTERVIEW_FORMATS.map((value) => ({
          value,
          label: copy.labels.format[value],
        })),
      },
      {
        name: "status",
        label: copy.forms.status,
        type: "select",
        options: statusOptions,
      },
    ],
    [candidateOptions, copy, isSpanish, statusOptions],
  );

  const selectedInterview = useMemo(
    () =>
      filteredInterviews.find((item) => item.id === selectedInterviewId) ||
      filteredInterviews[0] ||
      null,
    [filteredInterviews, selectedInterviewId],
  );

  const interviewInsights = useMemo(
    () => [
      {
        label: isSpanish ? "Agenda visible" : "Agenda in scope",
        value: filteredInterviews.length,
      },
      {
        label: isSpanish ? "Confirmadas" : "Confirmed",
        value: filteredInterviews.filter((item) => item.status === "confirmed").length,
      },
      {
        label: isSpanish ? "Pendientes" : "Pending",
        value: filteredInterviews.filter((item) => item.status === "pending").length,
      },
      {
        label: isSpanish ? "Virtuales" : "Virtual sessions",
        value: filteredInterviews.filter((item) => item.format === "virtual").length,
      },
    ],
    [filteredInterviews, isSpanish],
  );

  const interviewSpotlight = useMemo(() => {
    if (!selectedInterview) {
      return [];
    }

    return [
      {
        label: copy.forms.candidate,
        value: selectedInterview.candidateName,
      },
      {
        label: copy.forms.vacancy,
        value: selectedInterview.vacancy,
      },
      {
        label: copy.forms.interviewer,
        value: selectedInterview.interviewer,
      },
      {
        label: copy.forms.format,
        value: copy.labels.format[selectedInterview.format],
      },
    ];
  }, [copy, selectedInterview]);

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
      if (field === "candidateName") {
        const selectedCandidate = dashboard.candidates.find((item) => item.name === value);

        if (selectedCandidate) {
          return {
            ...current,
            candidateName: selectedCandidate.name,
            vacancy: selectedCandidate.position || current.vacancy,
          };
        }
      }

      return { ...current, [field]: value };
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.candidateName.trim()) {
      nextErrors.candidateName = isSpanish ? "Selecciona un candidato." : "Select a candidate.";
    }

    if (!formValues.vacancy.trim()) {
      nextErrors.vacancy = isSpanish ? "Indica la vacante asociada." : "Specify the related vacancy.";
    }

    if (!formValues.interviewer.trim()) {
      nextErrors.interviewer = isSpanish
        ? "Define el entrevistador responsable."
        : "Add the responsible interviewer.";
    }

    if (!formValues.date) {
      nextErrors.date = isSpanish ? "Selecciona una fecha." : "Choose a date.";
    }

    if (!formValues.time) {
      nextErrors.time = isSpanish ? "Selecciona una hora." : "Choose a time.";
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

    createInterview(formValues);
    setFormValues(initialInterviewForm);
    setErrors({});
    setIsFormOpen(false);
  }

  return (
    <div className="recruitment-page">
      <RecruitmentHeader
        eyebrow={copy.moduleTitle}
        title={copy.pages.interviewsTitle}
        description={copy.moduleDescription}
        highlights={[
          {
            label: copy.stats.pendingInterviews,
            value: dashboard.stats[2]?.value ?? 0,
          },
          {
            label: isSpanish ? "Agenda filtrada" : "Filtered agenda",
            value: filteredInterviews.length,
          },
          {
            label: isSpanish ? "Confirmacion activa" : "Confirmed schedule",
            value: interviewInsights[1].value,
          },
          {
            label: isSpanish ? "Virtuales" : "Virtual sessions",
            value: interviewInsights[3].value,
          },
        ]}
        primaryAction={
          <button
            type="button"
            className="recruitment-primary-button"
            onClick={() => setIsFormOpen(true)}
          >
            {copy.buttons.scheduleInterview}
          </button>
        }
      />

      {isFormOpen ? (
        <div className="recruitment-drawer-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="recruitment-drawer-shell" onClick={(event) => event.stopPropagation()}>
            <RecruitmentFormPanel
              title={copy.forms.interviewTitle}
              description={
                isSpanish
                  ? "Programa la entrevista desde un panel lateral rapido, manteniendo visible la agenda del equipo."
                  : "Schedule the interview from a fast side panel while keeping the team agenda visible."
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
            title={isSpanish ? "Lectura de agenda" : "Agenda insights"}
            description={
              isSpanish
                ? "Vista ejecutiva para validar capacidad, confirmaciones y pendientes."
                : "Executive overview to validate capacity, confirmations, and pending items."
            }
          >
            <div className="recruitment-summary-grid">
              {interviewInsights.map((item) => (
                <article key={item.label} className="recruitment-kpi-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </RecruitmentSectionCard>

          <RecruitmentSectionCard title={copy.pages.interviewsTitle} description={copy.moduleDescription}>
            {filteredInterviews.length ? (
              <InterviewsTable
                items={filteredInterviews}
                copy={copy}
                selectedId={selectedInterview?.id}
                onSelect={setSelectedInterviewId}
              />
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>
        </div>

        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Interview spotlight" : "Interview spotlight"}
            description={
              isSpanish
                ? "Panel de seguimiento para la entrevista seleccionada y su contexto."
                : "Follow-up panel for the selected interview and its context."
            }
          >
            {selectedInterview ? (
              <div className="recruitment-summary-list">
                {interviewSpotlight.map((item) => (
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
            title={isSpanish ? "Siguiente hito" : "Next milestone"}
            description={
              isSpanish
                ? "La entrevista seleccionada como foco de coordinacion del equipo."
                : "The selected interview as the team's coordination focus."
            }
          >
            {selectedInterview ? (
              <article className="recruitment-insight-card recruitment-insight-card--feature">
                <div>
                  <h3>{selectedInterview.candidateName}</h3>
                  <p>{selectedInterview.vacancy}</p>
                </div>
                <strong>{selectedInterview.date}</strong>
              </article>
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>
        </div>
      </div>
    </div>
  );
}
