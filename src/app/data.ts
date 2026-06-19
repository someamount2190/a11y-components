import type { ComboboxOption } from "../lib/components/Combobox";

/* ============================ Stages ============================ */

export type StageId =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface Stage {
  id: StageId;
  label: string;
  tone: "slate" | "blue" | "violet" | "amber" | "green" | "red";
}

export const STAGES: Stage[] = [
  { id: "applied", label: "Applied", tone: "slate" },
  { id: "screening", label: "Screening", tone: "blue" },
  { id: "interview", label: "Interview", tone: "violet" },
  { id: "offer", label: "Offer", tone: "amber" },
  { id: "hired", label: "Hired", tone: "green" },
  { id: "rejected", label: "Rejected", tone: "red" },
];

/** The forward pipeline (excludes the terminal "rejected" branch). */
export const PIPELINE: StageId[] = ["applied", "screening", "interview", "offer", "hired"];

export const stageById = (id: StageId): Stage =>
  STAGES.find((s) => s.id === id) ?? STAGES[0];

export const nextStage = (id: StageId): StageId | null => {
  const i = PIPELINE.indexOf(id);
  return i >= 0 && i < PIPELINE.length - 1 ? PIPELINE[i + 1] : null;
};

/* ============================ Positions ============================ */

export interface Position {
  id: string;
  title: string;
  team: string;
}

export const POSITIONS: Position[] = [
  { id: "fe-senior", title: "Senior Frontend Engineer", team: "Web Platform" },
  { id: "be-staff", title: "Staff Backend Engineer", team: "Core Services" },
  { id: "design-product", title: "Product Designer", team: "Design" },
  { id: "devops", title: "DevOps Engineer", team: "Infrastructure" },
  { id: "data-ds", title: "Data Scientist", team: "Insights" },
  { id: "pm", title: "Product Manager", team: "Product" },
  { id: "mobile-ios", title: "iOS Engineer", team: "Mobile" },
  { id: "em", title: "Engineering Manager", team: "Web Platform" },
];

export const positionById = (id: string): Position =>
  POSITIONS.find((p) => p.id === id) ?? POSITIONS[0];

export const POSITION_OPTIONS: ComboboxOption[] = POSITIONS.map((p) => ({
  value: p.id,
  label: p.title,
  description: p.team,
}));

export const STAGE_OPTIONS: ComboboxOption[] = STAGES.map((s) => ({
  value: s.id,
  label: s.label,
}));

/* ============================ People ============================ */

export interface Interviewer {
  id: string;
  name: string;
  role: string;
}

export const INTERVIEWERS: Interviewer[] = [
  { id: "i1", name: "Ada Lovelace", role: "Eng Lead, Web Platform" },
  { id: "i2", name: "Grace Hopper", role: "Principal Engineer" },
  { id: "i3", name: "Katherine Johnson", role: "Staff Engineer" },
  { id: "i4", name: "Alan Kay", role: "Director of Design" },
  { id: "i5", name: "Barbara Liskov", role: "VP Engineering" },
];

export const interviewerById = (id: string): Interviewer =>
  INTERVIEWERS.find((i) => i.id === id) ?? INTERVIEWERS[0];

export const INTERVIEWER_OPTIONS: ComboboxOption[] = INTERVIEWERS.map((i) => ({
  value: i.id,
  label: i.name,
  description: i.role,
}));

const RECRUITERS = ["Jordan Ellis", "Priya Shah", "Marcus Webb"];

/* ============================ Candidate ============================ */

export type InterviewStatus = "scheduled" | "completed" | "cancelled";

export interface Interview {
  id: string;
  round: string;
  type: "phone" | "video" | "onsite";
  interviewerId: string;
  date: Date;
  durationMin: number;
  status: InterviewStatus;
  /** 1–5, present once completed. */
  score?: number;
  feedback?: string;
}

export type ActivityType =
  | "applied"
  | "stage_change"
  | "note"
  | "email"
  | "interview_scheduled"
  | "interview_completed"
  | "offer"
  | "rejected";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  actor: string;
  date: Date;
  text: string;
}

export interface ScorecardEntry {
  competency: string;
  /** 0–4. 0 means not yet assessed. */
  rating: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  links: { linkedin?: string; github?: string; portfolio?: string };
  positionId: string;
  stage: StageId;
  appliedDate: Date;
  score: number;
  source: string;
  referredBy?: string;
  currentTitle: string;
  currentCompany: string;
  experienceYears: number;
  salaryExpectation: number;
  recruiter: string;
  hiringManager: string;
  summary: string;
  skills: string[];
  scorecard: ScorecardEntry[];
  interviews: Interview[];
  activity: ActivityEvent[];
  interviewerId?: string;
  interviewDate?: Date;
}

/* ===================== Deterministic generator ===================== */
// Seeded so every reload shows the same realistic record per candidate.

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const pickN = <T,>(rng: () => number, arr: T[], n: number): T[] => {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
};
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const SKILLS_BY_POSITION: Record<string, string[]> = {
  "fe-senior": ["React", "TypeScript", "Accessibility", "CSS Architecture", "Web Performance", "Testing", "Design Systems", "GraphQL"],
  "be-staff": ["Go", "PostgreSQL", "Distributed Systems", "Kafka", "gRPC", "Kubernetes", "Observability", "API Design"],
  "design-product": ["Figma", "Design Systems", "Prototyping", "User Research", "Interaction Design", "Accessibility", "Motion"],
  "devops": ["Terraform", "AWS", "Kubernetes", "CI/CD", "Observability", "Incident Response", "Networking", "Security"],
  "data-ds": ["Python", "SQL", "Pandas", "Experimentation", "ML", "dbt", "Causal Inference", "Data Viz"],
  "pm": ["Roadmapping", "Discovery", "Analytics", "Stakeholder Mgmt", "A/B Testing", "Strategy", "Writing"],
  "mobile-ios": ["Swift", "SwiftUI", "UIKit", "Combine", "Core Data", "XCTest", "Accessibility", "Performance"],
  "em": ["People Mgmt", "Hiring", "Roadmapping", "Mentorship", "Architecture", "Agile", "Coaching"],
};
const COMPANIES = ["Stripe", "Figma", "Vercel", "Datadog", "Linear", "Notion", "Cloudflare", "Shopify", "Airbnb", "Spotify", "GitLab", "Atlassian"];
const SOURCES = ["LinkedIn", "Referral", "Job board", "Career site", "Recruiter outreach", "Conference"];
const COMPETENCIES = ["Technical depth", "Communication", "Problem solving", "Culture add"];
const FEEDBACK_POS = [
  "Strong signal. Clear communicator and reasoned through trade-offs well.",
  "Excellent depth. Would happily work with them. Advance.",
  "Solid problem solving; handled follow-ups with composure.",
  "Great culture add — collaborative and curious throughout.",
];
const FEEDBACK_MIX = [
  "Good fundamentals but struggled to scope the harder follow-up.",
  "Reasonable solution; communication could be more structured.",
  "Promising, though limited depth on system design. Borderline.",
];
const FEEDBACK_NEG = [
  "Gaps in core fundamentals surfaced under pressure.",
  "Did not finish the core problem; struggled to recover from hints.",
  "Misaligned on seniority expectations for the role.",
];

const ROUND_PLAN: { round: string; type: Interview["type"]; duration: number }[] = [
  { round: "Recruiter Screen", type: "phone", duration: 30 },
  { round: "Technical Interview", type: "video", duration: 60 },
  { round: "System Design", type: "video", duration: 60 },
  { round: "Hiring Manager", type: "video", duration: 45 },
  { round: "Team & Values", type: "onsite", duration: 45 },
];

/** How many rounds have been reached / completed for a given stage. */
function roundsForStage(stage: StageId): { completed: number; scheduled: number } {
  switch (stage) {
    case "applied": return { completed: 0, scheduled: 0 };
    case "screening": return { completed: 1, scheduled: 0 };
    case "interview": return { completed: 2, scheduled: 1 };
    case "offer": return { completed: 5, scheduled: 0 };
    case "hired": return { completed: 5, scheduled: 0 };
    case "rejected": return { completed: 2, scheduled: 0 };
  }
}

interface Seed {
  id: string; name: string; email: string; positionId: string;
  stage: StageId; appliedDate: Date; score: number; location: string;
}

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const SEEDS: Seed[] = [
  { id: "c1", name: "Maya Okonkwo", email: "maya.okonkwo@mail.com", positionId: "fe-senior", stage: "interview", appliedDate: d(2026, 5, 28), score: 92, location: "Lisbon, PT" },
  { id: "c2", name: "Daniel Reyes", email: "d.reyes@mail.com", positionId: "be-staff", stage: "screening", appliedDate: d(2026, 6, 2), score: 81, location: "Austin, US" },
  { id: "c3", name: "Priya Nair", email: "priya.nair@mail.com", positionId: "design-product", stage: "offer", appliedDate: d(2026, 5, 12), score: 96, location: "Bengaluru, IN" },
  { id: "c4", name: "Tomás Silva", email: "tomas.silva@mail.com", positionId: "devops", stage: "applied", appliedDate: d(2026, 6, 15), score: 74, location: "São Paulo, BR" },
  { id: "c5", name: "Hana Kim", email: "hana.kim@mail.com", positionId: "data-ds", stage: "interview", appliedDate: d(2026, 6, 5), score: 88, location: "Seoul, KR" },
  { id: "c6", name: "Leo Müller", email: "leo.muller@mail.com", positionId: "fe-senior", stage: "applied", appliedDate: d(2026, 6, 14), score: 69, location: "Berlin, DE" },
  { id: "c7", name: "Amara Bello", email: "amara.bello@mail.com", positionId: "pm", stage: "screening", appliedDate: d(2026, 6, 9), score: 85, location: "Lagos, NG" },
  { id: "c8", name: "Owen Carter", email: "owen.carter@mail.com", positionId: "mobile-ios", stage: "hired", appliedDate: d(2026, 4, 22), score: 90, location: "Manchester, UK" },
  { id: "c9", name: "Sofia Rossi", email: "sofia.rossi@mail.com", positionId: "be-staff", stage: "rejected", appliedDate: d(2026, 5, 30), score: 58, location: "Milan, IT" },
  { id: "c10", name: "Jamal Haddad", email: "jamal.haddad@mail.com", positionId: "devops", stage: "screening", appliedDate: d(2026, 6, 11), score: 77, location: "Amman, JO" },
  { id: "c11", name: "Elena Petrova", email: "elena.petrova@mail.com", positionId: "data-ds", stage: "interview", appliedDate: d(2026, 6, 1), score: 83, location: "Tallinn, EE" },
  { id: "c12", name: "Noah Bennett", email: "noah.bennett@mail.com", positionId: "em", stage: "offer", appliedDate: d(2026, 5, 8), score: 94, location: "Toronto, CA" },
  { id: "c13", name: "Yuki Tanaka", email: "yuki.tanaka@mail.com", positionId: "design-product", stage: "applied", appliedDate: d(2026, 6, 17), score: 72, location: "Osaka, JP" },
  { id: "c14", name: "Fatima Zahra", email: "fatima.zahra@mail.com", positionId: "pm", stage: "interview", appliedDate: d(2026, 6, 4), score: 87, location: "Casablanca, MA" },
  { id: "c15", name: "Mateo Gómez", email: "mateo.gomez@mail.com", positionId: "fe-senior", stage: "screening", appliedDate: d(2026, 6, 10), score: 79, location: "Madrid, ES" },
  { id: "c16", name: "Chloe Dubois", email: "chloe.dubois@mail.com", positionId: "mobile-ios", stage: "applied", appliedDate: d(2026, 6, 16), score: 66, location: "Lyon, FR" },
];

const handle = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, "");

function enrich(seed: Seed): Candidate {
  const rng = makeRng(hashStr(seed.id));
  const pos = positionById(seed.positionId);
  const skills = pickN(rng, SKILLS_BY_POSITION[seed.positionId] ?? [], 5);
  const experienceYears = 3 + Math.floor(rng() * 12);
  const currentCompany = pick(rng, COMPANIES);
  const seniorityWord = experienceYears > 9 ? "Staff" : experienceYears > 6 ? "Senior" : "";
  const currentTitle = `${seniorityWord} ${pos.title.replace(/^(Senior|Staff)\s/, "")}`.trim();
  const baseSalary = 120000 + Math.round((rng() * 90 + pos.title.length) * 1000);
  const source = pick(rng, SOURCES);
  const referredBy = source === "Referral" ? pick(rng, INTERVIEWERS).name : undefined;
  const recruiter = pick(rng, RECRUITERS);
  const hiringManager = pick(rng, INTERVIEWERS).name;
  const h = handle(seed.name);

  const summary = `${seniorityWord || "Experienced"} ${pos.title.toLowerCase()} with ${experienceYears} years' experience, currently at ${currentCompany}. ${
    seed.score >= 85 ? "Top of the funnel for this role." : seed.score >= 70 ? "Solid match worth progressing." : "Early-stage match; needs validation."
  }`;

  // Interviews from the round plan, gated by stage progress.
  const { completed, scheduled } = roundsForStage(seed.stage);
  const interviews: Interview[] = [];
  for (let i = 0; i < completed + scheduled; i++) {
    const plan = ROUND_PLAN[i] ?? ROUND_PLAN[ROUND_PLAN.length - 1];
    const isDone = i < completed;
    const day = addDays(seed.appliedDate, 3 + i * 4);
    day.setHours(10 + i, i % 2 ? 30 : 0, 0, 0); // give each round a real time slot
    let score: number | undefined;
    let feedback: string | undefined;
    if (isDone) {
      const pool = seed.stage === "rejected" && i >= completed - 1 ? FEEDBACK_NEG : seed.score >= 84 ? FEEDBACK_POS : FEEDBACK_MIX;
      feedback = pick(rng, pool);
      score = seed.stage === "rejected" && i >= completed - 1 ? 2 : seed.score >= 88 ? 5 : seed.score >= 78 ? 4 : 3;
    }
    interviews.push({
      id: `${seed.id}-iv${i + 1}`,
      round: plan.round,
      type: plan.type,
      interviewerId: pick(rng, INTERVIEWERS).id,
      date: day,
      durationMin: plan.duration,
      status: isDone ? "completed" : "scheduled",
      score,
      feedback,
    });
  }

  // Scorecard: only meaningful once interviews have happened.
  const scorecard: ScorecardEntry[] = COMPETENCIES.map((competency) => ({
    competency,
    rating: completed === 0 ? 0 : Math.max(1, Math.min(4, Math.round((seed.score / 100) * 4 + (rng() - 0.5)))),
  }));

  // Activity timeline, newest first.
  const activity: ActivityEvent[] = [];
  const push = (type: ActivityType, actor: string, date: Date, text: string) =>
    activity.push({ id: `${seed.id}-act${activity.length + 1}`, type, actor, date, text });

  push("applied", seed.name, seed.appliedDate, `Applied for ${pos.title} via ${source}.`);
  if (referredBy) push("note", recruiter, addDays(seed.appliedDate, 0), `Referred by ${referredBy}.`);
  interviews.forEach((iv) => {
    push("interview_scheduled", recruiter, addDays(iv.date, -2), `${iv.round} scheduled with ${interviewerById(iv.interviewerId).name}.`);
    if (iv.status === "completed")
      push("interview_completed", interviewerById(iv.interviewerId).name, iv.date, `${iv.round} completed — scored ${iv.score}/5.`);
  });
  if (seed.stage === "offer") push("offer", recruiter, addDays(seed.appliedDate, 22), "Offer extended. Awaiting response.");
  if (seed.stage === "hired") push("offer", recruiter, addDays(seed.appliedDate, 24), "Offer accepted. 🎉");
  if (seed.stage === "rejected") push("rejected", recruiter, addDays(seed.appliedDate, 12), "Moved to rejected after panel review.");
  activity.sort((a, b) => b.date.getTime() - a.date.getTime());

  const lastInterview = [...interviews].reverse().find((iv) => iv.status === "scheduled") ?? interviews[interviews.length - 1];

  return {
    ...seed,
    phone: `+1 (5${Math.floor(rng() * 90 + 10)}) ${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 9000 + 1000)}`,
    links: {
      linkedin: `linkedin.com/in/${h}`,
      github: seed.positionId !== "design-product" && seed.positionId !== "pm" ? `github.com/${h}` : undefined,
      portfolio: seed.positionId === "design-product" ? `${h}.design` : undefined,
    },
    source,
    referredBy,
    currentTitle,
    currentCompany,
    experienceYears,
    salaryExpectation: Math.round(baseSalary / 1000) * 1000,
    recruiter,
    hiringManager,
    summary,
    skills,
    scorecard,
    interviews,
    interviewerId: lastInterview?.interviewerId,
    interviewDate: lastInterview?.date,
    activity,
  };
}

export const SEED_CANDIDATES: Candidate[] = SEEDS.map(enrich);

/* ============================ Formatters ============================ */

const currencyFmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
export const formatCurrency = (n: number) => currencyFmt.format(n);

export const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
export const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
