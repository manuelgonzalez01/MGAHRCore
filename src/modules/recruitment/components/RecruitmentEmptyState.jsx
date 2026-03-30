export default function RecruitmentEmptyState({ copy, action }) {
  return (
    <div className="recruitment-empty-state">
      <div className="recruitment-empty-icon">+</div>
      <h3>{copy.empty.title}</h3>
      <p>{copy.empty.description}</p>
      {action ? <div className="recruitment-empty-action">{action}</div> : null}
    </div>
  );
}
