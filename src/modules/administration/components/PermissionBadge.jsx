import { getAdminBadgeMeta } from "../utils/administration.helpers";

export default function PermissionBadge({ value }) {
  const meta = getAdminBadgeMeta(value);
  return <span className={`administration-badge ${meta.tone}`}>{meta.label}</span>;
}
