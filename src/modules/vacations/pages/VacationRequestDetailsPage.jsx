import "../../shared/hrSuite.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VacationApprovalTrail from "../components/VacationApprovalTrail";
import VacationAuditLogPanel from "../components/VacationAuditLogPanel";
import VacationHistoryTimeline from "../components/VacationHistoryTimeline";
import VacationImpactPreview from "../components/VacationImpactPreview";
import VacationRequestDetailsCard from "../components/VacationRequestDetailsCard";
import VacationsHeader from "../components/VacationsHeader";
import vacationRequestsService from "../services/vacationRequests.service";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationRequestDetailsPage() {
  const { copy } = useVacationLocale();
  const { id } = useParams();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    vacationRequestsService.getVacationRequestDetails(id).then(setRequest);
  }, [id]);

  if (!request) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingDetails}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.requestDossierEyebrow} title={`${copy.request} ${request.id}`} description={copy.requestDossierDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationRequestDetailsCard request={request} />
          <VacationImpactPreview preview={request.impactPreview} />
          <VacationApprovalTrail steps={request.approvalSteps} />
        </div>
        <div className="suite-rail">
          <VacationHistoryTimeline events={request.reconstructedHistory || request.auditTrail} />
          <VacationAuditLogPanel events={request.auditTrail} />
        </div>
      </section>
    </main>
  );
}
