import { Link, useNavigate } from "react-router-dom";
import useI18n from "../../../app/providers/useI18n";
import CandidatePipelineCard from "../components/CandidatePipelineCard";
import CandidateProfilePreview from "../components/CandidateProfilePreview";
import JobRequestsTable from "../components/JobRequestsTable";
import RecruitmentActivityFeed from "../components/RecruitmentActivityFeed";
import RecruitmentEmptyState from "../components/RecruitmentEmptyState";
import RecruitmentHeader from "../components/RecruitmentHeader";
import RecruitmentQuickActions from "../components/RecruitmentQuickActions";
import RecruitmentSectionCard from "../components/RecruitmentSectionCard";
import RecruitmentStatsCards from "../components/RecruitmentStatsCards";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useRecruitmentData from "../hooks/useRecruitmentData";
import { recruitmentCopy } from "../services/recruitment.service";
import useOrganizations from "../../administration/hooks/useOrganizations";
import useApprovalFlows from "../../administration/hooks/useApprovalFlows";
import useLanguageSettings from "../../administration/hooks/useLanguageSettings";
import "../recruitment.css";

function getStrongestCandidate(candidates) {
  return [...candidates].sort((left, right) => (Number(right.score) || 0) - (Number(left.score) || 0))[0];
}

export default function RecruitmentHomePage() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const copy = recruitmentCopy[language] ?? recruitmentCopy.es;
  const { dashboard } = useRecruitmentData();
  const organizations = useOrganizations();
  const { flows } = useApprovalFlows();
  const { settings } = useLanguageSettings();

  const featuredCandidate = getStrongestCandidate(dashboard.candidates);
  const quickActions = [
    {
      title: copy.buttons.newRequest,
      description: copy.quickActions[0].description,
      actionLabel: copy.buttons.newRequest,
      action: () => navigate("/recruitment/job-requests"),
    },
    {
      title: copy.buttons.newCandidate,
      description: copy.quickActions[1].description,
      actionLabel: copy.buttons.newCandidate,
      action: () => navigate("/recruitment/candidates"),
    },
    {
      title: copy.buttons.scheduleInterview,
      description: copy.quickActions[2].description,
      actionLabel: copy.buttons.scheduleInterview,
      action: () => navigate("/recruitment/interviews"),
    },
  ];

  return (
    <div className="recruitment-page">
      <RecruitmentHeader
        eyebrow={copy.moduleTitle}
        title={copy.pages.homeTitle}
        description={copy.moduleDescription}
        highlights={[
          {
            label: copy.stats.openVacancies,
            value: dashboard.stats[0]?.value ?? 0,
          },
          {
            label: copy.stats.activeCandidates,
            value: dashboard.stats[1]?.value ?? 0,
          },
          {
            label: copy.pages.recentActivityTitle,
            value: dashboard.recentActivity.length,
          },
        ]}
        primaryAction={
          <Link to="/recruitment/job-requests" className="recruitment-primary-button">
            {copy.buttons.newRequest}
          </Link>
        }
        secondaryAction={
          <Link to="/recruitment/candidates" className="recruitment-secondary-button">
            {copy.pages.candidatesTitle}
          </Link>
        }
      />

      <RecruitmentStatsCards items={dashboard.stats} copy={copy} />

      <div className="recruitment-home-grid">
        <RecruitmentSectionCard
          title={copy.pages.homeSummaryTitle}
          description={copy.pages.homeSummaryDescription}
          actions={
            <Link to="/recruitment/job-requests" className="recruitment-inline-button">
              {copy.pages.jobRequestsTitle}
            </Link>
          }
        >
          {dashboard.jobRequests.length ? (
            <JobRequestsTable items={dashboard.jobRequests.slice(0, 4)} copy={copy} />
          ) : (
            <RecruitmentEmptyState
              copy={copy}
              action={
                <Link to="/recruitment/job-requests" className="recruitment-primary-button">
                  {copy.buttons.newRequest}
                </Link>
              }
            />
          )}
        </RecruitmentSectionCard>

        <RecruitmentQuickActions copy={copy} items={quickActions} />
      </div>

      <div className="recruitment-home-grid recruitment-home-grid--balanced">
        <RecruitmentSectionCard
          title={copy.pages.pipelineTitle}
          description={copy.pages.pipelineDescription}
        >
          <div className="recruitment-stage-overview">
            {dashboard.pipelineSummary.map((item) => (
              <article key={item.key} className="recruitment-stage-card">
                <span>{copy.labels.stage[item.key]}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          {dashboard.candidates.length ? (
            <div className="recruitment-candidates-grid">
              {dashboard.candidates.slice(0, 3).map((candidate) => (
                <CandidatePipelineCard key={candidate.id} item={candidate} copy={copy} />
              ))}
            </div>
          ) : (
            <RecruitmentEmptyState copy={copy} />
          )}
        </RecruitmentSectionCard>

        <RecruitmentSectionCard
          title={copy.pages.profilePreviewTitle}
          description={copy.pages.activeCandidatesTitle}
        >
          {featuredCandidate ? (
            <CandidateProfilePreview candidate={featuredCandidate} copy={copy} language={language} />
          ) : (
            <RecruitmentEmptyState copy={copy} />
          )}
        </RecruitmentSectionCard>
      </div>

      <RecruitmentSectionCard
        title={copy.pages.recentActivityTitle}
        description={copy.pages.recentActivityDescription}
      >
        {dashboard.recentActivity.length ? (
          <RecruitmentActivityFeed items={dashboard.recentActivity} copy={copy} />
        ) : (
          <RecruitmentEmptyState copy={copy} />
        )}
      </RecruitmentSectionCard>

      <RecruitmentSectionCard
        title={language === "es" ? "Gobierno desde Administration" : "Governance from Administration"}
        description={
          language === "es"
            ? "Recruitment ahora se apoya en catalogos, idioma y flujos definidos por Administration."
            : "Recruitment now relies on master catalogs, language, and approval flows governed by Administration."
        }
      >
        <div className="recruitment-summary-grid">
          <article className="recruitment-kpi-card">
            <span>{language === "es" ? "Departamentos" : "Departments"}</span>
            <strong>{organizations.departments.length}</strong>
          </article>
          <article className="recruitment-kpi-card">
            <span>{language === "es" ? "Localizaciones" : "Locations"}</span>
            <strong>{organizations.locations.length}</strong>
          </article>
          <article className="recruitment-kpi-card">
            <span>{language === "es" ? "Flujos Recruitment" : "Recruitment flows"}</span>
            <strong>{flows.filter((item) => item.module === "Recruitment").length}</strong>
          </article>
          <article className="recruitment-kpi-card">
            <span>{language === "es" ? "Idioma global" : "Global language"}</span>
            <strong>{settings?.language?.toUpperCase() || language.toUpperCase()}</strong>
          </article>
        </div>
      </RecruitmentSectionCard>

      <ModuleConnectionsPanel moduleKey="recruitment" language={language} />
    </div>
  );
}
