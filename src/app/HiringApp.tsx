import { useEffect, useMemo, useRef, useState } from "react";
import { Combobox } from "../lib/components/Combobox";
import { DatePicker } from "../lib/components/DatePicker";
import { DataTable, type Column } from "../lib/components/DataTable";
import {
  Avatar,
  Icons,
  ScoreBar,
  StageBadge,
  ToastStack,
  type Toast,
} from "./ui";
import { AddCandidateModal, type NewCandidate } from "./AddCandidateModal";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { CandidateDrawer } from "./CandidateDrawer";
import {
  POSITION_OPTIONS,
  STAGE_OPTIONS,
  STAGES,
  SEED_CANDIDATES,
  positionById,
  interviewerById,
  nextStage,
  stageById,
  type ActivityEvent,
  type Candidate,
  type Interview,
  type StageId,
} from "./data";
import "./app.css";

const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

const NAV = [
  { id: "candidates", label: "Candidates", Icon: Icons.users },
  { id: "pipeline", label: "Pipeline", Icon: Icons.pipeline },
  { id: "interviews", label: "Interviews", Icon: Icons.calendar },
  { id: "reports", label: "Reports", Icon: Icons.chart },
  { id: "settings", label: "Settings", Icon: Icons.settings },
];

export function HiringApp({ onOpenDocs }: { onOpenDocs: () => void }) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>(SEED_CANDIDATES);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [appliedAfter, setAppliedAfter] = useState<Date | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<Candidate | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const idCounter = useRef(1000);
  const toastCounter = useRef(0);
  const actCounter = useRef(0);

  // The drawer reads from live state so inline mutations reflect immediately.
  const detailCandidate = detailId
    ? candidates.find((c) => c.id === detailId) ?? null
    : null;

  const now = () => new Date();
  const makeActivity = (
    type: ActivityEvent["type"],
    actor: string,
    text: string,
  ): ActivityEvent => ({ id: `act-${++actCounter.current}`, type, actor, date: now(), text });

  // Simulate the initial data fetch so the table's loading state is real.
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  const pushToast = (message: string, tone: Toast["tone"] = "success") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ----------------------------- Filtering ---------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (roleFilter && c.positionId !== roleFilter) return false;
      if (stageFilter && c.stage !== stageFilter) return false;
      if (appliedAfter && c.appliedDate < appliedAfter) return false;
      if (q) {
        const haystack =
          `${c.name} ${c.email} ${positionById(c.positionId).title}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [candidates, search, roleFilter, stageFilter, appliedAfter]);

  const activeFilters =
    (roleFilter ? 1 : 0) +
    (stageFilter ? 1 : 0) +
    (appliedAfter ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setRoleFilter(null);
    setStageFilter(null);
    setAppliedAfter(null);
  };

  /* ------------------------------- Stats ------------------------------ */

  const stats = useMemo(() => {
    const inPipeline = candidates.filter(
      (c) => c.stage !== "hired" && c.stage !== "rejected",
    ).length;
    return [
      { label: "Total candidates", value: candidates.length, Icon: Icons.users },
      { label: "Active in pipeline", value: inPipeline, Icon: Icons.pipeline },
      {
        label: "Interviews",
        value: candidates.filter((c) => c.stage === "interview").length,
        Icon: Icons.calendar,
      },
      {
        label: "Offers out",
        value: candidates.filter((c) => c.stage === "offer").length,
        Icon: Icons.chart,
      },
    ];
  }, [candidates]);

  /* ------------------------------ Mutations --------------------------- */

  const addCandidate = (input: NewCandidate) => {
    const id = `c${++idCounter.current}`;
    const pos = positionById(input.positionId);
    const newCandidate: Candidate = {
      id,
      name: input.name,
      email: input.email || "—",
      phone: "—",
      location: "—",
      links: {},
      positionId: input.positionId,
      stage: "applied",
      appliedDate: input.appliedDate,
      score: 75,
      source: "Career site",
      currentTitle: pos.title,
      currentCompany: "—",
      experienceYears: 0,
      salaryExpectation: 0,
      recruiter: "You",
      hiringManager: "—",
      summary: `New applicant for ${pos.title}. No interviews completed yet.`,
      skills: [],
      scorecard: ["Technical depth", "Communication", "Problem solving", "Culture add"].map(
        (competency) => ({ competency, rating: 0 }),
      ),
      interviews: [],
      activity: [makeActivity("applied", input.name, `Applied for ${pos.title}.`)],
    };
    setCandidates((prev) => [newCandidate, ...prev]);
    setAddOpen(false);
    pushToast(`${input.name} added to Applied.`);
  };

  const scheduleInterview = (candidateId: string, interviewerId: string, date: Date) => {
    const who = interviewerById(interviewerId);
    // The date picker returns midnight; give the interview a real 10:00 slot.
    const slot = new Date(date);
    slot.setHours(10, 0, 0, 0);
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c;
        const interview: Interview = {
          id: `${c.id}-iv${c.interviews.length + 1}`,
          round: `Interview ${c.interviews.filter((i) => i.round.startsWith("Interview")).length + 1}`,
          type: "video",
          interviewerId,
          date: slot,
          durationMin: 60,
          status: "scheduled",
        };
        return {
          ...c,
          interviewerId,
          interviewDate: date,
          stage: "interview",
          interviews: [...c.interviews, interview],
          activity: [
            makeActivity("interview_scheduled", "You", `Interview scheduled with ${who.name} on ${dateFmt.format(date)}.`),
            ...c.activity,
          ],
        };
      }),
    );
    const c = candidates.find((x) => x.id === candidateId);
    setScheduleFor(null);
    pushToast(`Interview scheduled for ${c?.name ?? "candidate"} on ${dateFmt.format(date)}.`);
  };

  const advanceStage = (candidate: Candidate) => {
    const target = nextStage(candidate.stage);
    if (!target) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? {
              ...c,
              stage: target,
              activity: [
                makeActivity("stage_change", "You", `Advanced to ${stageById(target).label}.`),
                ...c.activity,
              ],
            }
          : c,
      ),
    );
    pushToast(`${candidate.name} advanced to ${stageById(target).label}.`);
  };

  const rejectCandidate = (candidate: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidate.id
          ? {
              ...c,
              stage: "rejected",
              activity: [makeActivity("rejected", "You", "Moved to rejected."), ...c.activity],
            }
          : c,
      ),
    );
    pushToast(`${candidate.name} moved to Rejected.`);
  };

  const addNote = (candidateId: string, text: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, activity: [makeActivity("note", "You", text), ...c.activity] }
          : c,
      ),
    );
  };

  const bulkSetStage = (stage: StageId, verb: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        selected.has(c.id)
          ? {
              ...c,
              stage,
              activity: [makeActivity("stage_change", "You", `Bulk ${verb}.`), ...c.activity],
            }
          : c,
      ),
    );
    pushToast(`${selected.size} candidate${selected.size === 1 ? "" : "s"} ${verb}.`);
    setSelected(new Set());
  };

  /* ------------------------------ Columns ----------------------------- */

  const columns: Column<Candidate>[] = [
    {
      key: "name",
      header: "Candidate",
      sortable: true,
      width: "26%",
      render: (c) => (
        <div className="cell-candidate">
          <Avatar name={c.name} />
          <div className="cell-candidate__text">
            <button type="button" className="cell-candidate__name linklike" onClick={() => setDetailId(c.id)}>
              {c.name}
            </button>
            <span className="cell-candidate__email">{c.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "positionId",
      header: "Position",
      sortable: true,
      sortAccessor: (c) => positionById(c.positionId).title,
      render: (c) => {
        const p = positionById(c.positionId);
        return (
          <div className="cell-stack">
            <span>{p.title}</span>
            <span className="cell-sub">{p.team}</span>
          </div>
        );
      },
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      sortAccessor: (c) => STAGES.findIndex((s) => s.id === c.stage),
      render: (c) => <StageBadge stage={c.stage} />,
    },
    {
      key: "appliedDate",
      header: "Applied",
      sortable: true,
      sortAccessor: (c) => c.appliedDate,
      render: (c) => dateFmt.format(c.appliedDate),
    },
    {
      key: "score",
      header: "Match",
      sortable: true,
      align: "start",
      width: "12%",
      sortAccessor: (c) => c.score,
      render: (c) => <ScoreBar value={c.score} />,
    },
    {
      key: "actions",
      header: <span className="a11y-visually-hidden">Actions</span>,
      align: "end",
      render: (c) => (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setScheduleFor(c)}
        >
          <Icons.calendarPlus size={15} />
          {c.stage === "interview" ? "Reschedule" : "Schedule"}
        </button>
      ),
    },
  ];

  const emptyMessage =
    activeFilters > 0
      ? "No candidates match your filters. Try clearing them."
      : "No candidates yet. Add your first one to get started.";

  return (
    <div className="app">
      {/* ------------------------------ Sidebar ----------------------------- */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <Icons.pipeline size={22} />
          </span>
          <span className="brand__name">Atlas Hiring</span>
        </div>
        <nav className="nav" aria-label="Primary">
          {NAV.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="nav__item"
              aria-current={i === 0 ? "page" : undefined}
            >
              <item.Icon size={19} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <button type="button" className="nav__docs" onClick={onOpenDocs}>
          View component library
          <Icons.arrowRight size={15} />
        </button>
      </aside>

      {/* ------------------------------- Main ------------------------------- */}
      <div className="main">
        <header className="topbar">
          <div className="topbar__search">
            <Icons.search size={18} />
            <input
              type="search"
              aria-label="Search candidates by name, email, or position"
              placeholder="Search candidates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar__right">
            <button type="button" className="btn btn--primary" onClick={() => setAddOpen(true)}>
              <Icons.plus size={17} />
              Add candidate
            </button>
            <span className="topbar__avatar" title="Signed in as Recruiter">
              <Avatar name="Chris Correa" size={34} />
            </span>
          </div>
        </header>

        <main className="content" id="candidates">
          <div className="page-head">
            <div>
              <h1>Candidates</h1>
              <p>Track everyone moving through the hiring pipeline.</p>
            </div>
          </div>

          <section className="stats" aria-label="Pipeline summary">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <span className="stat__icon" aria-hidden="true">
                  <s.Icon size={20} />
                </span>
                <div>
                  <div className="stat__value">{s.value}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="panel" aria-label="Filters and candidate table">
            <div className="filters">
              <div className="filters__field">
                <Combobox
                  label="Position"
                  options={POSITION_OPTIONS}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  placeholder="All positions"
                  emptyMessage="No matching position"
                />
              </div>
              <div className="filters__field">
                <Combobox
                  label="Stage"
                  options={STAGE_OPTIONS}
                  value={stageFilter}
                  onChange={setStageFilter}
                  placeholder="All stages"
                />
              </div>
              <div className="filters__field">
                <DatePicker
                  label="Applied after"
                  value={appliedAfter}
                  onChange={setAppliedAfter}
                  max={new Date()}
                />
              </div>
              {activeFilters > 0 && (
                <button type="button" className="btn btn--ghost btn--sm filters__clear" onClick={clearFilters}>
                  <Icons.x size={14} />
                  Clear {activeFilters} filter{activeFilters === 1 ? "" : "s"}
                </button>
              )}
            </div>

            {selected.size > 0 && (
              <div className="bulkbar" role="region" aria-label="Bulk actions">
                <span className="bulkbar__count">{selected.size} selected</span>
                <div className="bulkbar__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => bulkSetStage("screening", "moved to Screening")}>
                    Move to Screening
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => bulkSetStage("interview", "moved to Interview")}>
                    Move to Interview
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => bulkSetStage("rejected", "rejected")}>
                    Reject
                  </button>
                </div>
                <button type="button" className="btn btn--ghost btn--sm bulkbar__clear" onClick={() => setSelected(new Set())}>
                  Clear selection
                </button>
              </div>
            )}

            <DataTable
              caption="Candidates"
              visuallyHiddenCaption
              columns={columns}
              data={filtered}
              getRowId={(c) => c.id}
              selectable
              selectedIds={selected}
              onSelectionChange={setSelected}
              loading={loading}
              loadingRows={6}
              emptyMessage={emptyMessage}
            />
            {!loading && (
              <div className="panel__foot">
                Showing {filtered.length} of {candidates.length} candidates
              </div>
            )}
          </section>
        </main>
      </div>

      <CandidateDrawer
        candidate={detailCandidate}
        onClose={() => setDetailId(null)}
        onAdvance={advanceStage}
        onReject={rejectCandidate}
        onSchedule={(c) => {
          // Avoid nested focus traps: close the drawer, then open the modal.
          setDetailId(null);
          setScheduleFor(c);
        }}
        onAddNote={addNote}
      />
      <AddCandidateModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={addCandidate} />
      <ScheduleInterviewModal
        candidate={scheduleFor}
        onClose={() => setScheduleFor(null)}
        onSchedule={scheduleInterview}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
