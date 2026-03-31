import { useCallback, useEffect, useMemo, useState } from "react";
import recruitmentService from "../services/recruitment.service";

function matchesText(value, query) {
  if (!query) {
    return true;
  }

  return String(value || "")
    .toLowerCase()
    .includes(query.toLowerCase());
}

export default function useRecruitmentData() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const [version, setVersion] = useState(0);
  const [dashboard, setDashboard] = useState({
    jobRequests: [],
    candidates: [],
    interviews: [],
    evaluations: [],
    stats: [],
    pipelineSummary: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError("");

      try {
        const nextDashboard = await recruitmentService.getRecruitmentDashboardData();
        if (active) {
          setDashboard(nextDashboard);
        }
      } catch (error) {
        if (active) {
          setLoadError(error?.message || "No se pudo cargar Recruitment.");
          setDashboard({
            jobRequests: [],
            candidates: [],
            interviews: [],
            evaluations: [],
            stats: [],
            pipelineSummary: [],
            recentActivity: [],
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [version]);

  const { jobRequests, candidates, interviews, evaluations } = dashboard;

  const filteredJobRequests = useMemo(() => {
    return jobRequests.filter((item) => {
      const matchesQuery =
        matchesText(item.title, query) ||
        matchesText(item.position, query) ||
        matchesText(item.hiringManager, query) ||
        matchesText(item.department, query);

      const matchesStatus = status === "all" || item.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [jobRequests, query, status]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const matchesQuery =
        matchesText(item.name, query) ||
        matchesText(item.position, query) ||
        matchesText(item.contact, query);

      const matchesStatus = status === "all" || item.status === status;
      const matchesStage = stage === "all" || item.stage === stage;

      return matchesQuery && matchesStatus && matchesStage;
    });
  }, [candidates, query, status, stage]);

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const matchesQuery =
        matchesText(item.candidateName, query) ||
        matchesText(item.vacancy, query) ||
        matchesText(item.interviewer, query);

      const matchesStatus = status === "all" || item.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [interviews, query, status]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const matchesQuery =
        matchesText(item.candidateName, query) ||
        matchesText(item.vacancy, query) ||
        matchesText(item.summary, query);

      const matchesStatus = status === "all" || item.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [evaluations, query, status]);

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  const createJobRequest = useCallback(async (payload) => {
    await recruitmentService.createJobRequest(payload);
    refresh();
  }, [refresh]);

  const updateJobRequest = useCallback(async (payload) => {
    await recruitmentService.updateJobRequest(payload);
    refresh();
  }, [refresh]);

  const createCandidate = useCallback(async (payload) => {
    await recruitmentService.createCandidate(payload);
    refresh();
  }, [refresh]);

  const createInterview = useCallback(async (payload) => {
    await recruitmentService.createInterview(payload);
    refresh();
  }, [refresh]);

  const createEvaluation = useCallback(async (payload) => {
    await recruitmentService.createEvaluation(payload);
    refresh();
  }, [refresh]);

  return {
    dashboard,
    isLoading,
    loadError,
    query,
    setQuery,
    status,
    setStatus,
    stage,
    setStage,
    filteredJobRequests,
    filteredCandidates,
    filteredInterviews,
    filteredEvaluations,
    createJobRequest,
    updateJobRequest,
    createCandidate,
    createInterview,
    createEvaluation,
  };
}
