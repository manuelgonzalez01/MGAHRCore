import "../../shared/hrSuite.css";
import { useState } from "react";
import VacationPoliciesTable from "../components/VacationPoliciesTable";
import VacationPolicyForm from "../components/VacationPolicyForm";
import VacationRulesPanel from "../components/VacationRulesPanel";
import VacationsHeader from "../components/VacationsHeader";
import useVacationPolicies from "../hooks/useVacationPolicies";
import useVacationLocale from "../hooks/useVacationLocale";

export default function VacationPoliciesPage() {
  const { copy } = useVacationLocale();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const { loading, policies, rules, organizations, savePolicy, saveRule, deletePolicy, deleteRule } = useVacationPolicies();

  if (loading) {
    return <main className="suite-page"><section className="suite-empty"><h1>{copy.loadingPolicies}</h1></section></main>;
  }

  return (
    <main className="suite-page">
      <VacationsHeader eyebrow={copy.policyEyebrow} title={copy.policyTitle} description={copy.policyDescription} />
      <section className="suite-layout">
        <div className="suite-grid">
          <VacationPoliciesTable
            policies={policies}
            onEdit={setSelectedPolicy}
            onDelete={async (policy) => {
              await deletePolicy(policy.id);
              if (selectedPolicy?.id === policy.id) {
                setSelectedPolicy(null);
              }
            }}
          />
        </div>
        <div className="suite-rail">
          <VacationPolicyForm
            key={selectedPolicy?.id || "new-policy"}
            organizations={organizations}
            policy={selectedPolicy}
            onCancelEdit={() => setSelectedPolicy(null)}
            onSave={async (payload) => {
              const response = await savePolicy(payload);
              setSelectedPolicy(null);
              return response;
            }}
          />
          <VacationRulesPanel
            organizations={organizations}
            rules={rules}
            onSaveRule={saveRule}
            onDeleteRule={async (rule) => {
              await deleteRule(rule.id);
            }}
          />
        </div>
      </section>
    </main>
  );
}
