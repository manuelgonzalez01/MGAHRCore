export default function EmptyRecruitmentState({ copy }) {
  return (
    <div className="recruitment-empty-state">
      <h3>{copy.empty.title}</h3>
      <p>{copy.empty.description}</p>
    </div>
  );
}
