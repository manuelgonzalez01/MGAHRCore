import "../../shared/hrSuite.css";
import VacationQuickActions from "../components/VacationQuickActions";
import VacationsHeader from "../components/VacationsHeader";
import VacationsKpiCards from "../components/VacationsKpiCards";
import VacationApprovalQueue from "../components/VacationApprovalQueue";
import VacationConflictsTable from "../components/VacationConflictsTable";
import VacationPlanningGrid from "../components/VacationPlanningGrid";
import ModuleConnectionsPanel from "../../shared/ModuleConnectionsPanel";
import useVacationDashboard from "../hooks/useVacationDashboard";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationsDashboardPage() {
  const { copy, language } = useVacationLocale();
  const { loading, dashboard, approvalQueue, plans, conflicts } = useVacationDashboard();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingVacations}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader
        eyebrow={copy.dashboardEyebrow}
        title={copy.dashboardTitle}
        description={copy.dashboardDescription}
        badges={[
          { label: copy.conflicts, value: dashboard.activeConflicts, tone: "critical" },
          { label: copy.pendingRequests, value: dashboard.pendingRequests, tone: "warning" },
        ]}
        actions={<VacationQuickActions />}
      />
      <VacationsKpiCards
        items={[
          { label: copy.trackedHeadcount, value: dashboard.headcountTracked, helper: copy.policyDescription },
          { label: copy.approvedDays, value: dashboard.approvedDays, helper: copy.approvalsDescription },
          { label: copy.avgBalance, value: dashboard.averageAvailableBalance, helper: copy.balancesDescription },
          { label: copy.expiringBalances, value: dashboard.expiringBalances, helper: copy.reportsDescription },
        ]}
      />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationApprovalQueue requests={approvalQueue.slice(0, 5)} onApprove={() => {}} onReturn={() => {}} onReject={() => {}} />
          <VacationPlanningGrid plans={plans.slice(0, 8)} />
        </div>
        <div className="suite-rail">
          <VacationConflictsTable conflicts={conflicts.slice(0, 6)} />
        </div>
      </section>
      <ModuleConnectionsPanel moduleKey="vacations" language={language} />
    </main>
  );
}
