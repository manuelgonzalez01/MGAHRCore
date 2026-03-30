import { Link, useParams } from "react-router-dom";
import "../../shared/hrSuite.css";
import "../personnelActions.css";
import PersonnelActionApprovalTrail from "../components/PersonnelActionApprovalTrail";
import PersonnelActionAuditTimeline from "../components/PersonnelActionAuditTimeline";
import PersonnelActionDetailsCard from "../components/PersonnelActionDetailsCard";
import PersonnelActionEmployeeSummary from "../components/PersonnelActionEmployeeSummary";
import PersonnelActionImpactPanel from "../components/PersonnelActionImpactPanel";
import PersonnelActionQuickActions from "../components/PersonnelActionQuickActions";
import PersonnelActionsHeader from "../components/PersonnelActionsHeader";
import usePersonnelActionDetails from "../hooks/usePersonnelActionDetails";
import usePersonnelActionsLocale from "../hooks/usePersonnelActionsLocale";
import { transitionPersonnelAction } from "../services/personnelActions.service";
import { useState } from "react";

export default function PersonnelActionDetailsPage() {
  const { id } = useParams();
  const { t } = usePersonnelActionsLocale();
  const { data, loading, error } = usePersonnelActionDetails(id);
  const [transitionError, setTransitionError] = useState("");

  async function handleTransition(action) {
    setTransitionError("");
    try {
      await transitionPersonnelAction({
        actionId: id,
        transition: action,
        comment: t("Transicion ejecutada desde detalle.", "Transition executed from details."),
      });
      window.location.reload();
    } catch (failure) {
      setTransitionError(failure.message);
    }
  }

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("Cargando detalle", "Loading details")}</h1></section></main>;
  }

  if (error || !data) {
    return <main className="suite-page"><section className="suite-empty"><h1>{t("No encontramos la accion", "Action not found")}</h1><p>{error?.message}</p></section></main>;
  }

  return (
    <main className="suite-page personnel-actions-page">
      <PersonnelActionsHeader
        eyebrow={t("Action Detail", "Action Detail")}
        title={data.employeeName}
        description={`${data.typeLabel} | ${data.statusLabel}`}
        actions={<Link className="suite-button-secondary" to="/personnel-actions/list">{t("Volver al listado", "Back to list")}</Link>}
      />
      <section className="suite-layout">
        <div className="suite-grid">
          <PersonnelActionDetailsCard item={data} t={t} />
          <PersonnelActionEmployeeSummary employee={data.employeeSummary} t={t} />
          <PersonnelActionImpactPanel impact={data.impact} t={t} />
          <PersonnelActionApprovalTrail items={data.approvalTrail} t={t} />
        </div>
        <div className="suite-rail">
          {transitionError ? <section className="suite-card"><p className="personnel-feedback error">{transitionError}</p></section> : null}
          <PersonnelActionQuickActions item={data} onTransition={handleTransition} t={t} />
          <PersonnelActionAuditTimeline items={data.auditEntries} t={t} />
          {data.exitLetter ? (
            <section className="suite-card">
              <h2>{t("Carta de salida", "Exit letter")}</h2>
              <p className="suite-muted">{data.exitLetter.documentNumber}</p>
              <p className="suite-muted">{data.exitLetter.status}</p>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
