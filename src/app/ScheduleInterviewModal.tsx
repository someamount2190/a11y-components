import { useEffect, useRef, useState } from "react";
import { Modal } from "../lib/components/Modal";
import { Combobox } from "../lib/components/Combobox";
import { DatePicker } from "../lib/components/DatePicker";
import { Avatar } from "./ui";
import { INTERVIEWER_OPTIONS, positionById, type Candidate } from "./data";

export function ScheduleInterviewModal({
  candidate,
  onClose,
  onSchedule,
}: {
  /** The candidate to schedule, or null when the modal is closed. */
  candidate: Candidate | null;
  onClose: () => void;
  onSchedule: (candidateId: string, interviewerId: string, date: Date) => void;
}) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const [interviewerId, setInterviewerId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [touched, setTouched] = useState(false);

  // Reset the form whenever a different candidate is opened.
  useEffect(() => {
    if (candidate) {
      setInterviewerId(candidate.interviewerId ?? null);
      setDate(candidate.interviewDate ?? null);
      setTouched(false);
    }
  }, [candidate]);

  const valid = interviewerId !== null && date !== null;
  const formId = "schedule-form";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || !candidate) return;
    onSchedule(candidate.id, interviewerId!, date!);
  };

  return (
    <Modal
      open={candidate !== null}
      onClose={onClose}
      title="Schedule interview"
      description={
        candidate ? `Set up an interview for ${candidate.name}.` : undefined
      }
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button ref={submitRef} type="submit" form={formId} className="btn btn--primary">
            Confirm interview
          </button>
        </>
      }
    >
      {candidate && (
        <form id={formId} className="form" onSubmit={submit} noValidate>
          <div className="candidate-chip">
            <Avatar name={candidate.name} size={40} />
            <div>
              <div className="candidate-chip__name">{candidate.name}</div>
              <div className="candidate-chip__sub">
                {positionById(candidate.positionId).title}
              </div>
            </div>
          </div>

          <Combobox
            label="Interviewer *"
            options={INTERVIEWER_OPTIONS}
            value={interviewerId}
            onChange={setInterviewerId}
            placeholder="Assign an interviewer…"
          />
          {touched && interviewerId === null && (
            <span className="field__error">Pick an interviewer.</span>
          )}

          <DatePicker
            label="Interview date *"
            value={date}
            onChange={setDate}
            min={new Date()}
          />
          {touched && date === null && (
            <span className="field__error">Choose a date.</span>
          )}
        </form>
      )}
    </Modal>
  );
}
