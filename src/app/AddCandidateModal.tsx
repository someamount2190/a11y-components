import { useRef, useState } from "react";
import { Modal } from "../lib/components/Modal";
import { Combobox } from "../lib/components/Combobox";
import { DatePicker } from "../lib/components/DatePicker";
import { POSITION_OPTIONS, type Candidate } from "./data";

export interface NewCandidate {
  name: string;
  email: string;
  positionId: string;
  appliedDate: Date;
}

export function AddCandidateModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (c: NewCandidate) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [positionId, setPositionId] = useState<string | null>(null);
  const [appliedDate, setAppliedDate] = useState<Date | null>(new Date());
  const [touched, setTouched] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPositionId(null);
    setAppliedDate(new Date());
    setTouched(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const valid = name.trim() !== "" && positionId !== null && appliedDate !== null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onAdd({ name: name.trim(), email: email.trim(), positionId: positionId!, appliedDate: appliedDate! });
    reset();
  };

  const formId = "add-candidate-form";

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add candidate"
      description="Create a candidate and drop them into the top of the pipeline."
      initialFocusRef={nameRef}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn--primary">
            Add candidate
          </button>
        </>
      }
    >
      <form id={formId} className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="cand-name" className="field__label">
            Full name <span className="field__req" aria-hidden="true">*</span>
          </label>
          <input
            ref={nameRef}
            id="cand-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={touched && name.trim() === ""}
            aria-describedby={touched && name.trim() === "" ? "cand-name-err" : undefined}
          />
          {touched && name.trim() === "" && (
            <span id="cand-name-err" className="field__error">
              A name is required.
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="cand-email" className="field__label">
            Email
          </label>
          <input
            id="cand-email"
            type="email"
            className="input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Combobox
          label="Position *"
          options={POSITION_OPTIONS}
          value={positionId}
          onChange={setPositionId}
          placeholder="Search positions…"
        />
        {touched && positionId === null && (
          <span className="field__error">Choose a position.</span>
        )}

        <DatePicker
          label="Applied date"
          value={appliedDate}
          onChange={setAppliedDate}
          max={new Date()}
        />
      </form>
    </Modal>
  );
}

export type { Candidate };
