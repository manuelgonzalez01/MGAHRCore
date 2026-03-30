import { useMemo, useState } from "react";
import useI18n from "../../../app/providers/useI18n";
import RecruitmentEmptyState from "../components/RecruitmentEmptyState";
import RecruitmentFilters from "../components/RecruitmentFilters";
import RecruitmentFormPanel from "../components/RecruitmentFormPanel";
import RecruitmentHeader from "../components/RecruitmentHeader";
import RecruitmentSectionCard from "../components/RecruitmentSectionCard";
import EvaluationsTable from "../components/EvaluationsTable";
import useRecruitmentData from "../hooks/useRecruitmentData";
import {
  initialEvaluationForm,
  RECRUITMENT_RECOMMENDATION_OPTIONS,
  RECRUITMENT_STATUS_OPTIONS,
} from "../schemas/recruitment.schema";
import { recruitmentCopy } from "../services/recruitment.service";
import "../recruitment.css";

export default function EvaluationsPage() {
  const { language } = useI18n();
  const copy = recruitmentCopy[language] ?? recruitmentCopy.es;
  const { dashboard, query, setQuery, status, setStatus, filteredEvaluations, createEvaluation } =
    useRecruitmentData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialEvaluationForm);
  const [errors, setErrors] = useState({});
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const isSpanish = language === "es";

  const statusOptions = useMemo(
    () =>
      RECRUITMENT_STATUS_OPTIONS.evaluations.map((value) => ({
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
      { name: "score", label: copy.forms.score, type: "number" },
      {
        name: "technicalScore",
        label: copy.forms.technicalScore || copy.table.technicalScore,
        type: "number",
      },
      {
        name: "competencyScore",
        label: copy.forms.competencyScore || copy.table.competencyScore,
        type: "number",
      },
      {
        name: "recommendation",
        label: copy.forms.recommendation,
        type: "select",
        options: RECRUITMENT_RECOMMENDATION_OPTIONS.map((value) => ({
          value,
          label: copy.labels.recommendation[value],
        })),
      },
      { name: "summary", label: copy.forms.summary, type: "textarea" },
      {
        name: "status",
        label: copy.forms.status,
        type: "select",
        options: statusOptions,
      },
    ],
    [candidateOptions, copy, isSpanish, statusOptions],
  );

  const selectedEvaluation = useMemo(
    () =>
      filteredEvaluations.find((item) => item.id === selectedEvaluationId) ||
      filteredEvaluations[0] ||
      null,
    [filteredEvaluations, selectedEvaluationId],
  );

  const evaluationInsights = useMemo(() => {
    const averageScore = filteredEvaluations.length
      ? Math.round(
          filteredEvaluations.reduce((sum, item) => sum + (Number(item.score) || 0), 0) /
            filteredEvaluations.length,
        )
      : 0;

    return [
      {
        label: isSpanish ? "Evaluaciones visibles" : "Visible evaluations",
        value: filteredEvaluations.length,
      },
      {
        label: isSpanish ? "Promedio general" : "Overall average",
        value: averageScore,
      },
      {
        label: isSpanish ? "Recomendadas" : "Recommended",
        value: filteredEvaluations.filter((item) => item.recommendation === "recommended").length,
      },
      {
        label: isSpanish ? "En revision" : "In review",
        value: filteredEvaluations.filter((item) => item.status === "in_review").length,
      },
    ];
  }, [filteredEvaluations, isSpanish]);

  const evaluationSpotlight = useMemo(() => {
    if (!selectedEvaluation) {
      return [];
    }

    return [
      {
        label: copy.forms.score,
        value: `${selectedEvaluation.score}/100`,
      },
      {
        label: copy.forms.technicalScore,
        value: `${selectedEvaluation.technicalScore || 0}/100`,
      },
      {
        label: copy.forms.competencyScore,
        value: `${selectedEvaluation.competencyScore || 0}/100`,
      },
      {
        label: copy.forms.recommendation,
        value: copy.labels.recommendation[selectedEvaluation.recommendation],
      },
    ];
  }, [copy, selectedEvaluation]);

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
    const scoreFields = ["score", "technicalScore", "competencyScore"];

    if (!formValues.candidateName.trim()) {
      nextErrors.candidateName = isSpanish ? "Selecciona un candidato." : "Select a candidate.";
    }

    if (!formValues.vacancy.trim()) {
      nextErrors.vacancy = isSpanish
        ? "Indica la vacante evaluada."
        : "Specify the evaluated vacancy.";
    }

    if (!formValues.summary.trim()) {
      nextErrors.summary = isSpanish
        ? "Resume el criterio de evaluacion."
        : "Add a concise evaluation summary.";
    }

    scoreFields.forEach((field) => {
      const numericValue = Number(formValues[field]);

      if (numericValue < 0 || numericValue > 100) {
        nextErrors[field] =
          isSpanish ? "Usa un rango entre 0 y 100." : "Use a range between 0 and 100.";
      }
    });

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    createEvaluation(formValues);
    setFormValues(initialEvaluationForm);
    setErrors({});
    setIsFormOpen(false);
  }

  return (
    <div className="recruitment-page">
      <RecruitmentHeader
        eyebrow={copy.moduleTitle}
        title={copy.pages.evaluationsTitle}
        description={copy.moduleDescription}
        highlights={[
          {
            label: copy.stats.evaluations,
            value: dashboard.stats[3]?.value ?? 0,
          },
          {
            label: isSpanish ? "Promedio actual" : "Current average",
            value: evaluationInsights[1].value,
          },
          {
            label: isSpanish ? "Recomendadas" : "Recommended",
            value: evaluationInsights[2].value,
          },
          {
            label: isSpanish ? "En revision" : "In review",
            value: evaluationInsights[3].value,
          },
        ]}
        primaryAction={
          <button
            type="button"
            className="recruitment-primary-button"
            onClick={() => setIsFormOpen(true)}
          >
            {copy.buttons.reviewEvaluation}
          </button>
        }
      />

      {isFormOpen ? (
        <div className="recruitment-drawer-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="recruitment-drawer-shell" onClick={(event) => event.stopPropagation()}>
            <RecruitmentFormPanel
              title={copy.forms.evaluationTitle}
              description={
                isSpanish
                  ? "Registra la evaluacion en un panel lateral con foco en score, recomendacion y criterio ejecutivo."
                  : "Capture the evaluation in a side panel focused on score, recommendation, and executive criteria."
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
            title={isSpanish ? "Lectura de calidad" : "Quality readout"}
            description={
              isSpanish
                ? "Indicadores para entender performance tecnica, consistencia y recomendacion final."
                : "Indicators to understand technical performance, consistency, and final recommendation."
            }
          >
            <div className="recruitment-summary-grid">
              {evaluationInsights.map((item) => (
                <article key={item.label} className="recruitment-kpi-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </RecruitmentSectionCard>

          <RecruitmentSectionCard title={copy.pages.evaluationsTitle} description={copy.moduleDescription}>
            {filteredEvaluations.length ? (
              <EvaluationsTable
                items={filteredEvaluations}
                copy={copy}
                selectedId={selectedEvaluation?.id}
                onSelect={setSelectedEvaluationId}
              />
            ) : (
              <RecruitmentEmptyState copy={copy} />
            )}
          </RecruitmentSectionCard>
        </div>

        <div className="recruitment-side-stack">
          <RecruitmentSectionCard
            title={isSpanish ? "Evaluation spotlight" : "Evaluation spotlight"}
            description={
              isSpanish
                ? "Ficha ejecutiva de la evaluacion seleccionada para toma de decision."
                : "Executive brief of the selected evaluation for decision-making."
            }
          >
            {selectedEvaluation ? (
              <div className="recruitment-summary-list">
                {evaluationSpotlight.map((item) => (
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
            title={isSpanish ? "Decision destacada" : "Top decision"}
            description={
              isSpanish
                ? "La evaluacion activa con mayor contexto para acelerar el cierre."
                : "The active evaluation with the strongest context to accelerate closure."
            }
          >
            {selectedEvaluation ? (
              <article className="recruitment-insight-card recruitment-insight-card--feature">
                <div>
                  <h3>{selectedEvaluation.candidateName}</h3>
                  <p>{selectedEvaluation.vacancy}</p>
                </div>
                <strong>{selectedEvaluation.score}</strong>
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
