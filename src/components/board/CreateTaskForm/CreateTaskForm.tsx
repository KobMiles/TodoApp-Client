import { useEffect, useState } from 'react';
import type { CreateTodoTaskDto } from '../../../types/todoTask';
import { FormErrorSummary } from '../../form/FormErrorSummary';
import { CreateTodoTaskClientSchema, getFieldErrors } from '../../../validators/todoTaskValidators';
import { combineLocalToWire, pad, buildTimeOptions } from '../../../utils/dateTime';
import { DueQuickActions } from '../../form/DueQuickActions';

const TIME_OPTS = buildTimeOptions();

export function CreateTaskForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (dto: CreateTodoTaskDto) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const d = new Date();
    setDatePart(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    setTimePart('');
  }, []);

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
    const candidate = { title, description, dueDate: dueWire ?? undefined };
    const res = CreateTodoTaskClientSchema.safeParse(candidate);
    if (!res.success) {
      setErrors(getFieldErrors(res.error));
      return;
    }
    onSubmit(res.data as CreateTodoTaskDto);
  };

  return (
    <form className="modal__body" role="form" aria-labelledby="modal-title" noValidate onSubmit={handleSubmit}>
      <FormErrorSummary errors={errors} heading="Cannot create task" id="create-error-summary" />
      <div className="modal__row">
        <label className="modal__label" htmlFor="c-title">Title</label>
        <input
          id="c-title"
          className="modal__control"
          value={title}
          onChange={(e) => { setTitle(e.currentTarget.value); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'create-error-summary' : undefined}
        />
      </div>
      <div className="modal__row">
        <label className="modal__label" htmlFor="c-desc">Description</label>
        <textarea
          id="c-desc"
          className="modal__control"
          value={description}
          rows={3}
          onChange={(e) => { setDescription(e.currentTarget.value); if (errors.description) setErrors(p => ({ ...p, description: '' })); }}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'create-error-summary' : undefined}
        />
      </div>
      <div className="modal__row board__date-row">
        <label className="modal__label" htmlFor="c-date">Due date</label>
        <input
          id="c-date"
          type="date"
          className="modal__control"
          value={datePart}
          onChange={(e) => { setDatePart(e.currentTarget.value); if (errors.dueDate) setErrors(p => ({ ...p, dueDate: '' })); }}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? 'create-error-summary' : undefined}
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
        <button type="submit" className="btn btn--primary">Create</button>
      </div>
    </form>
  );
}
