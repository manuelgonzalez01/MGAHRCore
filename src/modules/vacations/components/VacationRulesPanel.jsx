import { useMemo, useState } from "react";
import useVacationLocale from "../hooks/useVacationLocale";

function stringifyValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value ?? "");
}

function parseValue(raw) {
  const value = raw.trim();
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value.includes(",")) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) || value === "" ? value : numeric;
}

export default function VacationRulesPanel({ rules = [], organizations, onSaveRule, onDeleteRule }) {
  const { copy, getSeverityLabel } = useVacationLocale();
  const companies = organizations?.companies || [];
  const [selectedRule, setSelectedRule] = useState(null);
  const [draft, setDraft] = useState({
    code: "",
    label: "",
    value: "",
    severity: "warning",
    companyId: companies[0]?.id || "",
    employeeCategory: "all",
    active: true,
  });

  const categoryOptions = useMemo(() => ([
    { value: "all", label: copy.all },
    { value: "onsite", label: copy.onsite },
    { value: "hybrid", label: copy.hybrid },
    { value: "remote", label: copy.remote },
  ]), [copy]);

  function loadRule(rule) {
    setSelectedRule(rule);
    setDraft({
      ...rule,
      value: stringifyValue(rule.value),
      companyId: rule.companyId || companies[0]?.id || "",
    });
  }

  function resetDraft() {
    setSelectedRule(null);
    setDraft({
      code: "",
      label: "",
      value: "",
      severity: "warning",
      companyId: companies[0]?.id || "",
      employeeCategory: "all",
      active: true,
    });
  }

  return (
    <section className="suite-card">
      <div className="suite-card-head">
        <div>
          <h2>{copy.rulesTitle}</h2>
          <p className="suite-muted">{selectedRule?.id ? copy.editRule : copy.newRule}</p>
        </div>
      </div>
      <div className="suite-list">
        {rules.map((rule) => (
          <article className="suite-list-item" key={rule.id}>
            <span>{rule.code}</span>
            <strong>{rule.label}</strong>
            <p className="suite-muted">{copy.ruleValue}: {stringifyValue(rule.value)} | {copy.ruleSeverity}: {getSeverityLabel(rule.severity)}</p>
            <div className="suite-inline-actions">
              <button className="suite-button-secondary" onClick={() => loadRule(rule)} type="button">{copy.edit}</button>
              <button className="suite-button-secondary" onClick={() => onDeleteRule?.(rule)} type="button">{copy.delete}</button>
            </div>
          </article>
        ))}
      </div>
      <div className="suite-mini-grid">
        <label>{copy.ruleCode}<input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} /></label>
        <label>{copy.ruleLabel}<input value={draft.label} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} /></label>
        <label>{copy.ruleValue}<input value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} /></label>
        <label>{copy.ruleSeverity}
          <select value={draft.severity} onChange={(event) => setDraft((current) => ({ ...current, severity: event.target.value }))}>
            <option value="info">{getSeverityLabel("info")}</option>
            <option value="warning">{getSeverityLabel("warning")}</option>
            <option value="critical">{getSeverityLabel("critical")}</option>
          </select>
        </label>
        <label>{copy.company}
          <select value={draft.companyId} onChange={(event) => setDraft((current) => ({ ...current, companyId: event.target.value }))}>
            {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        </label>
        <label>{copy.category}
          <select value={draft.employeeCategory} onChange={(event) => setDraft((current) => ({ ...current, employeeCategory: event.target.value }))}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>{copy.active}
          <select value={String(draft.active)} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.value === "true" }))}>
            <option value="true">{copy.yes}</option>
            <option value="false">{copy.no}</option>
          </select>
        </label>
      </div>
      <div className="suite-inline-actions">
        <button
          className="suite-button"
          onClick={() => onSaveRule({
            ...draft,
            id: selectedRule?.id,
            value: parseValue(draft.value),
            policyFamily: "annual-leave",
          })}
          type="button"
        >
          {copy.saveRule}
        </button>
        {selectedRule?.id ? <button className="suite-button-secondary" onClick={() => onDeleteRule?.(selectedRule)} type="button">{copy.delete}</button> : null}
        {selectedRule?.id ? <button className="suite-button-secondary" onClick={resetDraft} type="button">{copy.cancelEdit}</button> : null}
      </div>
    </section>
  );
}
