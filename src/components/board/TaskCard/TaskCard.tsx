import type { TodoTaskDto } from '../../../types/todoTask';

const ellipsize = (txt?: string | null, n = 80) =>
  !txt ? 'No description' : (txt.length > n ? txt.slice(0, n - 1) + '…' : txt);

const dtf = new Intl.DateTimeFormat(navigator.language, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

interface Props {
  task: TodoTaskDto;
  onDetails?: (t: TodoTaskDto) => void;
  onEdit?: (t: TodoTaskDto) => void;
}

export function TaskCard({ task, onDetails, onEdit }: Props) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = !!due && due.getTime() < Date.now();
  return (
    <div className="card">
      <h4 className="card__title">{task.title}</h4>
      <div className="card__meta">{ellipsize(task.description)}</div>
      {due && (
        <div className="card__due">
          <span
            className={`badge ${isOverdue ? 'badge--overdue' : 'badge--due'}`}
            title={due.toLocaleString()}
          >
            Due {dtf.format(due)}
          </span>
        </div>
      )}
      <div className="card__footer">
        <button className="btn-ghost" onClick={() => onDetails?.(task)} aria-label={`Details of ${task.title}`}>
          Details
        </button>
        <button className="btn-ghost" onClick={() => onEdit?.(task)} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
      </div>
    </div>
  );
}
