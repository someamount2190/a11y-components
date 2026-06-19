import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "../lib/hooks/useFocusTrap";
import { useScrollLock } from "../lib/hooks/useScrollLock";
import { Avatar, Icons, ScoreBar, StageBadge, StarRating } from "./ui";
import {
  PIPELINE,
  dateFmt,
  dateTimeFmt,
  formatCurrency,
  interviewerById,
  nextStage,
  positionById,
  stageById,
  type Candidate,
  type Interview,
} from "./data";
import "./drawer.css";

type TabId = "overview" | "interviews" | "activity";

export function CandidateDrawer({
  candidate,
  onClose,
  onAdvance,
  onReject,
  onSchedule,
  onAddNote,
}: {
  candidate: Candidate | null;
  onClose: () => void;
  onAdvance: (c: Candidate) => void;
  onReject: (c: Candidate) => void;
  onSchedule: (c: Candidate) => void;
  onAddNote: (id: string, text: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const open = candidate !== null;
  const [tab, setTab] = useState<TabId>("overview");
  const [note, setNote] = useState("");

  useScrollLock(open);
  useFocusTrap(panelRef, { active: open, initialFocus: closeRef });

  useEffect(() => {
    if (open) setTab("overview");
  }, [open, candidate?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!candidate) return null;
  const c = candidate;
  const pos = positionById(c.positionId);
  const next = nextStage(c.stage);
  const terminal = c.stage === "hired" || c.stage === "rejected";
  const currentIndex = PIPELINE.indexOf(c.stage);

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "interviews", label: "Interviews", count: c.interviews.length },
    { id: "activity", label: "Activity", count: c.activity.length },
  ];

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") nextIndex = index === 0 ? last : index - 1;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = last;
    if (nextIndex !== null) {
      e.preventDefault();
      setTab(TABS[nextIndex].id);
      (e.currentTarget.parentElement?.children[nextIndex] as HTMLElement)?.focus();
    }
  };

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;
    onAddNote(c.id, text);
    setNote("");
  };

  return createPortal(
    <div className="drawer-overlay" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* -------------------------- Header -------------------------- */}
        <div className="drawer__header">
          <button ref={closeRef} type="button" className="drawer__close" aria-label="Close candidate details" onClick={onClose}>
            <Icons.x size={18} />
          </button>
          <div className="drawer__id">
            <Avatar name={c.name} size={64} />
            <div className="drawer__idtext">
              <h2 id={titleId}>{c.name}</h2>
              <p className="drawer__role">
                {c.currentTitle} · {c.currentCompany}
              </p>
              <p className="drawer__meta">
                <span><Icons.mapPin size={14} /> {c.location}</span>
                <span><Icons.briefcase size={14} /> {c.experienceYears} yrs exp</span>
              </p>
            </div>
          </div>
          <div className="drawer__statusrow">
            <StageBadge stage={c.stage} />
            <span className="drawer__applied">Applied {dateFmt.format(c.appliedDate)} for <strong>{pos.title}</strong></span>
            <span className="drawer__scorewrap"><span className="drawer__scorelbl">Match</span><ScoreBar value={c.score} /></span>
          </div>

          {/* Action bar */}
          <div className="drawer__actions">
            {!terminal && next && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdvance(c)}>
                <Icons.arrowRight size={15} /> Advance to {stageById(next).label}
              </button>
            )}
            {!terminal && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onSchedule(c)}>
                <Icons.calendarPlus size={15} /> Schedule interview
              </button>
            )}
            {!terminal && (
              <button type="button" className="btn btn--danger btn--sm" onClick={() => onReject(c)}>
                <Icons.x size={15} /> Reject
              </button>
            )}
            {terminal && (
              <span className="drawer__terminal" data-tone={c.stage}>
                {c.stage === "hired" ? "Hired — pipeline complete" : "Rejected — no longer in pipeline"}
              </span>
            )}
          </div>

          {/* Pipeline stepper */}
          <ol className="stepper" aria-label="Pipeline progress">
            {PIPELINE.map((s, i) => {
              const state =
                c.stage === "rejected" ? "muted" : i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
              return (
                <li key={s} className="stepper__step" data-state={state}>
                  <span className="stepper__dot" aria-hidden="true">
                    {state === "done" ? <Icons.check size={12} /> : i + 1}
                  </span>
                  <span className="stepper__label">{stageById(s).label}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* --------------------------- Tabs --------------------------- */}
        <div className="drawer__tabs" role="tablist" aria-label="Candidate sections">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className="drawer__tab"
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
            >
              {t.label}
              {t.count !== undefined && <span className="drawer__tabcount">{t.count}</span>}
            </button>
          ))}
        </div>

        <div className="drawer__body">
          {/* ------------------------ Overview ------------------------ */}
          {tab === "overview" && (
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="drawer__panel">
              <section className="summary">
                <span className="summary__icon" aria-hidden="true"><Icons.sparkle size={16} /></span>
                <p>{c.summary}</p>
              </section>

              <div className="infogrid">
                <div className="infocard">
                  <h3>Contact</h3>
                  <ul className="infolist">
                    <li><Icons.mail size={15} /> <a href={`mailto:${c.email}`}>{c.email}</a></li>
                    <li><Icons.phone size={15} /> <a href={`tel:${c.phone}`}>{c.phone}</a></li>
                    <li><Icons.mapPin size={15} /> {c.location}</li>
                    {c.links.linkedin && <li><Icons.external size={15} /> <a href={`https://${c.links.linkedin}`} target="_blank" rel="noreferrer">{c.links.linkedin}</a></li>}
                    {c.links.github && <li><Icons.external size={15} /> <a href={`https://${c.links.github}`} target="_blank" rel="noreferrer">{c.links.github}</a></li>}
                    {c.links.portfolio && <li><Icons.external size={15} /> <a href={`https://${c.links.portfolio}`} target="_blank" rel="noreferrer">{c.links.portfolio}</a></li>}
                  </ul>
                </div>
                <div className="infocard">
                  <h3>Application</h3>
                  <ul className="infolist">
                    <li><Icons.briefcase size={15} /> {pos.title} · <span className="muted">{pos.team}</span></li>
                    <li><Icons.wallet size={15} /> {formatCurrency(c.salaryExpectation)} expected</li>
                    <li><Icons.sparkle size={15} /> Source: {c.source}{c.referredBy ? ` (via ${c.referredBy})` : ""}</li>
                    <li><Icons.calendar size={15} /> Applied {dateFmt.format(c.appliedDate)}</li>
                    <li><Icons.users size={15} /> Recruiter: {c.recruiter}</li>
                    <li><Icons.building size={15} /> Hiring manager: {c.hiringManager}</li>
                  </ul>
                </div>
              </div>

              <section className="block">
                <h3>Skills</h3>
                <div className="tags">
                  {c.skills.map((s) => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </div>
              </section>

              <section className="block">
                <h3>Scorecard</h3>
                {c.scorecard[0]?.rating === 0 ? (
                  <p className="muted">Not yet assessed — no interviews completed.</p>
                ) : (
                  <ul className="scorecard">
                    {c.scorecard.map((s) => (
                      <li key={s.competency}>
                        <span>{s.competency}</span>
                        <StarRating value={s.rating} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          {/* ------------------------ Interviews ------------------------ */}
          {tab === "interviews" && (
            <div role="tabpanel" id="panel-interviews" aria-labelledby="tab-interviews" className="drawer__panel">
              {c.interviews.length === 0 ? (
                <div className="emptyblock">
                  <Icons.calendar size={32} />
                  <p>No interviews yet. Schedule the first round to get started.</p>
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => onSchedule(c)}>
                    <Icons.calendarPlus size={15} /> Schedule interview
                  </button>
                </div>
              ) : (
                <ol className="ivlist">
                  {c.interviews.map((iv) => (
                    <InterviewRow key={iv.id} iv={iv} />
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* ------------------------ Activity ------------------------ */}
          {tab === "activity" && (
            <div role="tabpanel" id="panel-activity" aria-labelledby="tab-activity" className="drawer__panel">
              <form className="composer" onSubmit={submitNote}>
                <label htmlFor="note-input" className="a11y-visually-hidden">Add a note</label>
                <textarea
                  id="note-input"
                  className="composer__input"
                  placeholder="Leave a note for the hiring team…"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button type="submit" className="btn btn--primary btn--sm" disabled={!note.trim()}>
                  <Icons.send size={15} /> Post
                </button>
              </form>
              <ol className="timeline">
                {c.activity.map((a) => (
                  <li key={a.id} className="timeline__item" data-type={a.type}>
                    <span className="timeline__icon" aria-hidden="true"><ActivityIcon type={a.type} /></span>
                    <div className="timeline__body">
                      <p className="timeline__text">{a.text}</p>
                      <p className="timeline__meta">{a.actor} · {dateFmt.format(a.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function InterviewRow({ iv }: { iv: Interview }) {
  const who = interviewerById(iv.interviewerId);
  const TypeIcon = iv.type === "phone" ? Icons.phone : iv.type === "onsite" ? Icons.building : Icons.video;
  return (
    <li className="ivcard" data-status={iv.status}>
      <div className="ivcard__top">
        <span className="ivcard__round">
          <span className="ivcard__typeicon" aria-hidden="true"><TypeIcon size={15} /></span>
          {iv.round}
        </span>
        <span className="ivcard__status" data-status={iv.status}>
          {iv.status === "completed" ? "Completed" : iv.status === "scheduled" ? "Scheduled" : "Cancelled"}
        </span>
      </div>
      <div className="ivcard__meta">
        <span><Icons.users size={14} /> {who.name} · <span className="muted">{who.role}</span></span>
        <span><Icons.clock size={14} /> {dateTimeFmt.format(iv.date)} · {iv.durationMin}m</span>
      </div>
      {iv.status === "completed" && (
        <div className="ivcard__result">
          <span className="ivcard__score">Score <StarRating value={iv.score ?? 0} max={5} /></span>
          {iv.feedback && <p className="ivcard__feedback">“{iv.feedback}”</p>}
        </div>
      )}
    </li>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "applied": return <Icons.users size={14} />;
    case "interview_scheduled": return <Icons.calendarPlus size={14} />;
    case "interview_completed": return <Icons.check size={14} />;
    case "offer": return <Icons.sparkle size={14} />;
    case "rejected": return <Icons.x size={14} />;
    case "email": return <Icons.mail size={14} />;
    default: return <Icons.message size={14} />;
  }
}
