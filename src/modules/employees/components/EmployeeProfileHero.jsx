import EmployeeStatusBadge from "./EmployeeStatusBadge";
import EmployeeTypeBadge from "./EmployeeTypeBadge";
import { formatDate, formatPercent } from "../utils/employee.helpers";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

export default function EmployeeProfileHero({ employee, title, description }) {
  const copy = useEmployeesCopy();

  return (
    <section className="employees-hero employees-hero--profile">
      <span className="employees-eyebrow">{title}</span>
      <div className="employees-profile-head">
        <div className="employees-person">
          <span className="employees-avatar">{employee.initials}</span>
          <div>
            <h1>{employee.name}</h1>
            <p className="employees-muted">{description}</p>
            <div className="employees-badge-row">
              <EmployeeStatusBadge status={employee.status} />
              <EmployeeTypeBadge type={employee.employeeType} />
              <span className="employees-badge neutral">{employee.company}</span>
              <span className="employees-badge info">{employee.levelName || copy.common.levelPending}</span>
            </div>
          </div>
        </div>
        <div className="employees-hero-aside">
          <div className="employees-hero-metric">
            <span>{copy.profileHero.source}</span>
            <strong>{employee.recruitmentSource?.origin || copy.common.manual}</strong>
            <p className="employees-muted">{employee.recruitmentSource?.sourceChannel || employee.recruitmentSource?.candidateName || copy.common.noPipeline}</p>
          </div>
          <div className="employees-hero-metric">
            <span>{copy.profileHero.entry}</span>
            <strong>{formatDate(employee.startDate)}</strong>
            <p className="employees-muted">{employee.contractType} | {employee.workMode}</p>
          </div>
        </div>
      </div>
      <div className="employees-highlight-grid">
        <article className="employees-highlight-card"><span>{copy.profileHero.position}</span><strong>{employee.position}</strong><p className="employees-muted">{employee.department}</p></article>
        <article className="employees-highlight-card"><span>{copy.profileHero.manager}</span><strong>{employee.manager || copy.common.managerPending}</strong><p className="employees-muted">{employee.businessUnit}</p></article>
        <article className="employees-highlight-card"><span>{copy.profileHero.dossier}</span><strong>{formatPercent(employee.dossierReadiness)}</strong><p className="employees-muted">{copy.profileHero.completion} {formatPercent(employee.profileCompletion)}</p></article>
        <article className="employees-highlight-card"><span>{copy.profileHero.engagement}</span><strong>{employee.engagementScore || 0}</strong><p className="employees-muted">{employee.performanceLabel}</p></article>
        <article className="employees-highlight-card"><span>{copy.language === "es" ? "Onboarding" : "Onboarding"}</span><strong>{employee.onboarding?.completion || 0}%</strong><p className="employees-muted">{employee.onboarding?.nextCheckpoint || copy.common.noData}</p></article>
        <article className="employees-highlight-card"><span>{copy.language === "es" ? "Relacion laboral" : "Employment relationship"}</span><strong>{employee.contract?.contractType || employee.contractType}</strong><p className="employees-muted">{employee.contract?.legalEntity || employee.company}</p></article>
      </div>
    </section>
  );
}
