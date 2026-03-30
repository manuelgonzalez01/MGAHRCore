import "../../shared/hrSuite.css";
import VacationImpactPreview from "../components/VacationImpactPreview";
import VacationRequestForm from "../components/VacationRequestForm";
import VacationRequestsTable from "../components/VacationRequestsTable";
import VacationRulesPanel from "../components/VacationRulesPanel";
import VacationsHeader from "../components/VacationsHeader";
import useVacationRequests from "../hooks/useVacationRequests";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationRequestsPage() {
  const { copy } = useVacationLocale();
  const { loading, requests, employees, rules, preview, simulate, saveRequest } = useVacationRequests();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingRequests}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.requestsEyebrow} title={copy.requestsTitle} description={copy.requestsDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationRequestsTable requests={requests} />
        </div>
        <div className="suite-rail">
          <VacationRequestForm
            employees={employees}
            onSave={async (payload) => {
              await simulate(payload);
              return saveRequest(payload);
            }}
          />
          <VacationImpactPreview preview={preview} />
          <VacationRulesPanel rules={rules} />
        </div>
      </section>
    </main>
  );
}
