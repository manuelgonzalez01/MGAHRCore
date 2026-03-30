import { useMemo, useState } from "react";
import useEmployeesCopy from "../hooks/useEmployeesCopy";

const buildInitialState = (copy) => ({
  sourceType: "manual",
  candidateId: "",
  name: "",
  positionId: "",
  position: "",
  department: "",
  levelId: "",
  levelName: "",
  manager: "",
  reportsToPositionId: "",
  location: "",
  contractType: copy.form.contractDefault,
  employeeType: "hybrid",
  email: "",
  startDate: "",
  requestedBy: copy.form.requestedByDefault,
});

export default function EmployeeForm({
  onSubmit,
  recruitmentOptions = [],
  positionOptions = [],
  departmentOptions = [],
  locationOptions = [],
}) {
  const copy = useEmployeesCopy();
  const [form, setForm] = useState(() => buildInitialState(copy));
  const recruitmentMap = useMemo(
    () => new Map(recruitmentOptions.map((item) => [item.id, item])),
    [recruitmentOptions],
  );
  const positionMap = useMemo(
    () => new Map(positionOptions.map((item) => [item.id, item])),
    [positionOptions],
  );

  function buildCandidatePatch(candidateId) {
    const selectedCandidate = recruitmentMap.get(candidateId);

    if (!selectedCandidate) {
      return {};
    }

    return {
      candidateId: selectedCandidate.id,
      name: selectedCandidate.name || "",
      positionId: selectedCandidate.positionId || "",
      position: selectedCandidate.position || "",
      department: selectedCandidate.department || "",
      levelId: selectedCandidate.levelId || "",
      levelName: selectedCandidate.levelName || "",
      location: selectedCandidate.location || "",
      email: selectedCandidate.email || "",
    };
  }

  function buildPositionPatch(positionId, currentForm) {
    const selectedPosition = positionMap.get(positionId);

    if (!selectedPosition) {
      return {};
    }

    return {
      positionId: selectedPosition.id,
      position: selectedPosition.name,
      department: selectedPosition.departmentName || currentForm.department,
      levelId: selectedPosition.levelId || currentForm.levelId,
      levelName: selectedPosition.levelName || currentForm.levelName,
      location: selectedPosition.locationName || currentForm.location,
      contractType:
        currentForm.contractType || selectedPosition.hiringType || copy.form.contractDefault,
      reportsToPositionId:
        selectedPosition.reportsToPositionId || currentForm.reportsToPositionId,
    };
  }

  function updateField(key, value) {
    setForm((current) => {
      if (key === "sourceType") {
        const nextForm = { ...current, sourceType: value };

        if (value !== "recruitment") {
          nextForm.candidateId = "";
        }

        return nextForm;
      }

      if (key === "candidateId") {
        const candidatePatch = buildCandidatePatch(value);
        const nextForm = {
          ...current,
          ...candidatePatch,
        };

        if (candidatePatch.positionId) {
          return {
            ...nextForm,
            ...buildPositionPatch(candidatePatch.positionId, nextForm),
          };
        }

        return nextForm;
      }

      if (key === "positionId") {
        const nextForm = { ...current, positionId: value };
        return {
          ...nextForm,
          ...buildPositionPatch(value, nextForm),
        };
      }

      return { ...current, [key]: value };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm(buildInitialState(copy));
  }

  return (
    <form className="employees-form-grid" onSubmit={handleSubmit}>
      <div className="employees-field">
        <label>{copy.form.source}</label>
        <select value={form.sourceType} onChange={(event) => updateField("sourceType", event.target.value)}>
          <option value="manual">{copy.form.manualEntry}</option>
          <option value="recruitment">{copy.form.fromRecruitment}</option>
        </select>
      </div>
      {form.sourceType === "recruitment" ? (
        <div className="employees-field">
          <label>{copy.form.candidate}</label>
          <select value={form.candidateId} onChange={(event) => updateField("candidateId", event.target.value)}>
            <option value="">{copy.form.selectCandidate}</option>
            {recruitmentOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name} | {item.position}</option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="employees-field"><label>{copy.form.fullName}</label><input value={form.name} onChange={(e) => updateField("name", e.target.value)} required /></div>
      <div className="employees-field">
        <label>{copy.form.structuralPosition}</label>
        {positionOptions.length ? (
          <select value={form.positionId} onChange={(event) => updateField("positionId", event.target.value)} required>
            <option value="">{copy.form.selectPosition}</option>
            {positionOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} | {item.departmentName} | {item.levelName}
              </option>
            ))}
          </select>
        ) : (
          <input value={form.position} onChange={(e) => updateField("position", e.target.value)} required />
        )}
      </div>
      <div className="employees-field"><label>{copy.form.position}</label><input value={form.position} onChange={(e) => updateField("position", e.target.value)} required /></div>
      <div className="employees-field">
        <label>{copy.form.area}</label>
        {departmentOptions.length ? (
          <select value={form.department} onChange={(event) => updateField("department", event.target.value)} required>
            <option value="">{copy.form.selectArea}</option>
            {departmentOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        ) : (
          <input value={form.department} onChange={(e) => updateField("department", e.target.value)} required />
        )}
      </div>
      <div className="employees-field"><label>{copy.form.organizationalLevel}</label><input value={form.levelName} onChange={(e) => updateField("levelName", e.target.value)} /></div>
      <div className="employees-field"><label>{copy.form.manager}</label><input value={form.manager} onChange={(e) => updateField("manager", e.target.value)} required /></div>
      <div className="employees-field">
        <label>{copy.form.location}</label>
        {locationOptions.length ? (
          <select value={form.location} onChange={(event) => updateField("location", event.target.value)} required>
            <option value="">{copy.form.selectLocation}</option>
            {locationOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
        ) : (
          <input value={form.location} onChange={(e) => updateField("location", e.target.value)} required />
        )}
      </div>
      <div className="employees-field"><label>{copy.form.contract}</label><input value={form.contractType} onChange={(e) => updateField("contractType", e.target.value)} /></div>
      <div className="employees-field">
        <label>{copy.form.employeeType}</label>
        <select value={form.employeeType} onChange={(event) => updateField("employeeType", event.target.value)}>
          <option value="hybrid">{copy.type.hybrid}</option>
          <option value="onsite">{copy.type.onsite}</option>
          <option value="remote">{copy.type.remote}</option>
        </select>
      </div>
      <div className="employees-field"><label>{copy.form.email}</label><input value={form.email} onChange={(e) => updateField("email", e.target.value)} /></div>
      <div className="employees-field"><label>{copy.form.entryDate}</label><input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} /></div>
      <div className="employees-field"><label>{copy.form.requestedBy}</label><input value={form.requestedBy} onChange={(e) => updateField("requestedBy", e.target.value)} /></div>
      <div className="employees-inline-actions"><button type="submit" className="employees-button">{copy.actions.submitAuthorization}</button></div>
    </form>
  );
}
