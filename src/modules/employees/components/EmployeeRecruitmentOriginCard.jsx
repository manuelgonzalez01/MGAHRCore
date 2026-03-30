import EmployeeSectionCard from "./EmployeeSectionCard";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeRecruitmentOriginCard({ employee }) {
  const copy = useEmployeesCopy();
  const isSpanish = copy.language === "es";
  const source = employee.recruitmentSource || {};

  return (
    <EmployeeSectionCard
      variant="experience"
      title={isSpanish ? "Origen de talento" : "Talent origin"}
      description={isSpanish ? "Continuidad del colaborador desde Recruitment y su narrativa de incorporacion." : "Employee continuity from Recruitment and onboarding narrative."}
    >
      <div className="employees-list">
        <article className="employees-list-item">
          <span>{isSpanish ? "Origen" : "Origin"}</span>
          <strong>{source.origin || copy.common.manual}</strong>
          <p className="employees-muted">{source.candidateName || source.sourceChannel || copy.common.noPipeline}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Vacante / posicion" : "Vacancy / position"}</span>
          <strong>{source.vacancyTitle || employee.position}</strong>
          <p className="employees-muted">{source.vacancyCode || (isSpanish ? "Sin codigo de vacante" : "No vacancy code")}</p>
        </article>
        <article className="employees-list-item">
          <span>Pipeline</span>
          <strong>{source.pipelineStage || (isSpanish ? "Sin etapa" : "No stage")}</strong>
          <p className="employees-muted">{isSpanish ? "Fit" : "Fit"} {source.fitScore || "N/A"} | {isSpanish ? "Canal" : "Channel"} {source.sourceChannel || copy.common.manual}</p>
        </article>
        <article className="employees-list-item">
          <span>{isSpanish ? "Narrativa de incorporacion" : "Hiring narrative"}</span>
          <strong>{source.narrative || (isSpanish ? "Ingreso coordinado desde flujo administrativo." : "Hire coordinated from the administrative workflow.")}</strong>
        </article>
      </div>
    </EmployeeSectionCard>
  );
}
