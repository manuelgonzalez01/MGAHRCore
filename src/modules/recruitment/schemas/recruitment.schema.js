export const RECRUITMENT_STATUS_OPTIONS = {
  jobRequests: ["open", "in_progress", "approved", "closed"],
  candidates: ["active", "pipeline", "finalist"],
  interviews: ["scheduled", "confirmed", "pending"],
  evaluations: ["completed", "in_review"],
};

export const RECRUITMENT_STAGE_OPTIONS = ["screening", "interview", "evaluation", "offer"];
export const RECRUITMENT_PRIORITY_OPTIONS = ["high", "medium", "low"];
export const RECRUITMENT_MODALITY_OPTIONS = ["remote", "hybrid", "onsite"];
export const RECRUITMENT_INTERVIEW_FORMATS = ["virtual", "onsite"];
export const RECRUITMENT_RECOMMENDATION_OPTIONS = [
  "recommended",
  "recommended_with_observations",
  "follow_up",
];

export const initialJobRequestForm = {
  title: "",
  companyId: "",
  companyName: "",
  positionId: "",
  position: "",
  departmentId: "",
  department: "",
  levelId: "",
  levelName: "",
  hiringManager: "",
  openings: "1",
  locationId: "",
  location: "",
  modality: "hybrid",
  priority: "medium",
  status: "open",
};

export const initialCandidateForm = {
  name: "",
  companyId: "",
  companyName: "",
  positionId: "",
  position: "",
  departmentId: "",
  department: "",
  levelId: "",
  levelName: "",
  stage: "screening",
  status: "active",
  score: "0",
  availability: "",
  experience: "",
  source: "",
  summary: "",
  locationId: "",
  location: "",
  contact: "",
};

export const initialInterviewForm = {
  candidateName: "",
  vacancy: "",
  interviewer: "",
  date: "",
  time: "",
  format: "virtual",
  status: "scheduled",
};

export const initialEvaluationForm = {
  candidateName: "",
  vacancy: "",
  score: "0",
  technicalScore: "0",
  competencyScore: "0",
  recommendation: "recommended",
  summary: "",
  status: "completed",
};
