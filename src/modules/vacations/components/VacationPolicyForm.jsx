import { useMemo, useState } from "react";
import useVacationLocale from "../hooks/useVacationLocale";

const initialForm = {
  companyId: "",
  companyName: "",
  locationId: "",
  locationName: "",
  employeeCategory: "all",
  entitlementDays: 18,
  minServiceMonths: 3,
  carryOverLimit: 5,
  expiresAfterMonths: 12,
  hrApprovalThresholdDays: 5,
  minCoverageRatio: 0.65,
};

export default function VacationPolicyForm({ organizations, policy, onSave, onCancelEdit }) {
  const { copy } = useVacationLocale();
  const companies = organizations?.companies || [];
  const locations = organizations?.locations || [];
  const defaultCompany = companies[0] || null;
  const defaultLocation = locations[0] || null;
  const seedForm = policy?.id ? {
    ...initialForm,
    ...policy,
  } : {
    ...initialForm,
    companyId: defaultCompany?.id || "",
    companyName: defaultCompany?.name || "",
    locationId: defaultLocation?.id || "",
    locationName: defaultLocation?.name || "",
    countryCode: defaultLocation?.countryCode || defaultLocation?.country || "",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    version: 1,
    versionLabel: "v1.0",
  };
  const [form, setForm] = useState(() => ({
    ...seedForm,
  }));

  const categoryOptions = useMemo(() => ([
    { value: "all", label: copy.all },
    { value: "onsite", label: copy.onsite },
    { value: "hybrid", label: copy.hybrid },
    { value: "remote", label: copy.remote },
  ]), [copy]);

  function handleCompanyChange(companyId) {
    const company = companies.find((item) => item.id === companyId);
    setForm((current) => ({
      ...current,
      companyId,
      companyName: company?.name || "",
    }));
  }

  function handleLocationChange(locationId) {
    const location = locations.find((item) => item.id === locationId);
    setForm((current) => ({
      ...current,
      locationId,
      locationName: location?.name || "",
      countryCode: location?.countryCode || location?.country || current.countryCode || "",
    }));
  }

  return (
    <section className="suite-card">
      <div className="suite-card-head">
        <div>
          <h2>{policy?.id ? copy.editPolicy : copy.newPolicy}</h2>
          <p className="suite-muted">{copy.policyHelper}</p>
        </div>
      </div>
      <div className="suite-mini-grid">
        <label>{copy.company}
          <select value={form.companyId} onChange={(event) => handleCompanyChange(event.target.value)}>
            {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        </label>
        <label>{copy.location}
          <select value={form.locationId} onChange={(event) => handleLocationChange(event.target.value)}>
            {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </label>
        <label>{copy.category}
          <select value={form.employeeCategory} onChange={(event) => setForm((current) => ({ ...current, employeeCategory: event.target.value }))}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>{copy.version}
          <input value={form.versionLabel || ""} onChange={(event) => setForm((current) => ({ ...current, versionLabel: event.target.value, version: Number((event.target.value || "").replace(/[^\d]/g, "")) || 1 }))} placeholder="v2.0" />
        </label>
        <label>{copy.effectiveFrom}
          <input type="date" value={form.effectiveFrom || ""} onChange={(event) => setForm((current) => ({ ...current, effectiveFrom: event.target.value }))} />
        </label>
        <label>{copy.entitlement}
          <input type="number" value={form.entitlementDays} onChange={(event) => setForm((current) => ({ ...current, entitlementDays: Number(event.target.value) }))} />
        </label>
        <label>{copy.seniority}
          <input type="number" value={form.minServiceMonths} onChange={(event) => setForm((current) => ({ ...current, minServiceMonths: Number(event.target.value) }))} />
        </label>
        <label>{copy.carryOver}
          <input type="number" value={form.carryOverLimit} onChange={(event) => setForm((current) => ({ ...current, carryOverLimit: Number(event.target.value) }))} />
        </label>
      </div>
      <div className="suite-inline-actions">
        <button className="suite-button" onClick={() => onSave({
          ...form,
          leaveType: "annual",
          status: "active",
          policyCode: form.policyCode || `VAC-${form.companyId || "GEN"}-${form.employeeCategory.toUpperCase()}`,
          policyFamily: "annual-leave",
          multipleActiveAllowed: true,
        })} type="button">{copy.savePolicy}</button>
        {policy?.id ? <button className="suite-button-secondary" onClick={() => onCancelEdit?.()} type="button">{copy.cancelEdit}</button> : null}
      </div>
    </section>
  );
}
