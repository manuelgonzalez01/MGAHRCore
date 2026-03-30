import StageBadge from "./StageBadge";
import StatusBadge from "./StatusBadge";

export default function CandidatePipelineCard({ item, copy, selected = false, onSelect }) {
  return (
    <article
      className={`recruitment-pipeline-card${selected ? " is-active" : ""}`}
      onClick={() => onSelect?.(item.id)}
    >
      <div className="recruitment-pipeline-card-top">
        <div>
          <h3>{item.name}</h3>
          <p>{item.position}</p>
        </div>
        <StageBadge label={copy.labels.stage[item.stage]} value={item.stage} />
      </div>
      <div className="recruitment-pipeline-meta">
        <div>
          <span>{copy.table.score}</span>
          <strong>{item.score}/100</strong>
        </div>
        <div>
          <span>{copy.table.availability}</span>
          <strong>{item.availability}</strong>
        </div>
        <div>
          <span>{copy.table.source}</span>
          <strong>{item.source}</strong>
        </div>
      </div>
      <div className="recruitment-pipeline-footer">
        <StatusBadge label={copy.labels.status[item.status]} value={item.status} />
        <button
          type="button"
          className="recruitment-inline-button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(item.id);
          }}
        >
          {copy.buttons.openProfile}
        </button>
      </div>
    </article>
  );
}
