import { useMemo } from "react";
import useEmployeeProfile from "./useEmployeeProfile";

export default function useEmployeeDocuments() {
  const profile = useEmployeeProfile();

  const summary = useMemo(() => {
    const documents = profile.employee?.documents || [];

    return {
      total: documents.length,
      approved: documents.filter((item) => item.status === "approved").length,
      pending: documents.filter((item) => item.status === "pending").length,
      missing: documents.filter((item) => item.status === "missing").length,
      expiring: documents.filter((item) => item.expiresAt).length,
    };
  }, [profile.employee]);

  return {
    ...profile,
    documents: profile.employee?.documents || [],
    summary,
  };
}
