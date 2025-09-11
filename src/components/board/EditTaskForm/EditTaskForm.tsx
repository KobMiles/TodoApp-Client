import { useMemo, useState } from 'react';
import type { TodoTaskDto } from '../../../types/todoTask';
import { Status } from '../../../types/todoTask';
import { FormErrorSummary } from '../../form/FormErrorSummary';
import { UpdateTodoTaskClientSchema, getFieldErrors } from '../../../validators/todoTaskValidators';
import { toLocalDateTimeParts, combineLocalToWire, buildTimeOptions, pad } from '../../../utils/dateTime';
import { DueQuickActions } from '../../form/DueQuickActions';

const TIME_OPTS = buildTimeOptions();

export function EditTaskForm({
  value,
  onCancel,
  onSubmit,
}: {
  value: TodoTaskDto;
  onCancel: () => void;
  onSubmit: (dto: TodoTaskDto) => void;
}) {
  const init = useMemo(() => toLocalDateTimeParts(value.dueDate), [value.dueDate]);
  const [title, setTitle] = useState(value.title);
  const [description, setDescription] = useState(value.description ?? '');
  const [status, setStatus] = useState<Status>(value.status);
  const [datePart, setDatePart] = useState(init.date);
  const [timePart, setTimePart] = useState(init.time);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today1800 = () => setTimePart('18:00');
  const tomorrow0900 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDatePart(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    setTimePart('09:00');
  };
  const noDue = () => { setDatePart(''); setTimePart(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueWire = combineLocalToWire(datePart, timePart);
    const candidate: TodoTaskDto = {
      ...value,
      title,
      description,
      status,
      dueDate: dueWire ?? undefined,
    };
    const res = UpdateTodoTaskClientSchema.safeParse(candidate);
    if (!res.success) {
      setErrors(getFieldErrors(res.error));
      return;
    }
    onSubmit(res.data);
  };

  return (
    <form className="modal__body" aria-labelledby="modal-title" noValidate onSubmit={handleSubmit}>
      <FormErrorSummary errors={errors} heading="Cannot save task" id="edit-error-summary" />
      <div className="modal__row">
        <label className="modal__label" htmlFor="f-title">Title</label>
        <input
          id="f-title"
          className="modal__control"
          value={title}
          onChange={(e) => { setTitle(e.currentTarget.value); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'edit-error-summary' : undefined}
        />
      </div>
      <div className="modal__row">
        <label className="modal__label" htmlFor="f-desc">Description</label>
        <textarea
          id="f-desc"
          className="modal__control"
          value={description}
          rows={3}
          onChange={(e) => { setDescription(e.currentTarget.value); if (errors.description) setErrors(p => ({ ...p, description: '' })); }}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'edit-error-summary' : undefined}
        />
      </div>
      <div className="modal__row">
        <label className="modal__label" htmlFor="f-status">Status</label>
        <select
          id="f-status"
          className="modal__control"
          value={status}
          onChange={(e) => setStatus(Number(e.currentTarget.value) as Status)}
        >
          <option value={Status.Todo}>Todo</option>
          <option value={Status.InProgress}>In Progress</option>
          <option value={Status.Done}>Done</option>
        </select>
      </div>
      <div className="modal__row board__date-row">
        <label className="modal__label" htmlFor="f-date">Due date</label>
        <input
          id="f-date"
          type="date"
          className="modal__control"
          value={datePart}
          onChange={(e) => { setDatePart(e.currentTarget.value); if (errors.dueDate) setErrors(p => ({ ...p, dueDate: '' })); }}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'edit-error-summary' : undefined}
        />
        <select
          aria-label="Time"
          className="time-select"
          value={timePart}
          onChange={(e) => { setTimePart(e.currentTarget.value); if (errors.dueDate) setErrors(p => ({ ...p, dueDate: '' })); }}
        >
          <option value="">--:--</option>
          {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <DueQuickActions onToday18={today1800} onTomorrow09={tomorrow0900} onNoDue={noDue} />
      </div>
      <div className="board__form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn--primary">Save</button>
      </div>
    </form>
  );
}
