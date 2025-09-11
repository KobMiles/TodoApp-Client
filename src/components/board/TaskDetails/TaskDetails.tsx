import type { TodoTaskDto } from '../../../types/todoTask';
import { Status } from '../../../types/todoTask';

const statusText = (s: Status) => {
  if (s === Status.Todo) {
    return 'Todo';
  }
  if (s === Status.InProgress) {
    return 'In Progress';
  }
  return 'Done';
};

export function TaskDetails({
  task,
  onEdit,
  onDelete,
}: {
  task: TodoTaskDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="modal__row"><span className="modal__label">Title</span><span>{task.title}</span></div>
      <div className="modal__row"><span className="modal__label">Description</span><span>{task.description ?? '—'}</span></div>
      <div className="modal__row"><span className="modal__label">Status</span><span>{statusText(task.status)}</span></div>
      <div className="modal__row"><span className="modal__label">Due date</span><span>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</span></div>
      <div className="modal__row"><span className="modal__label">Created</span><span>{new Date(task.createdAt).toLocaleString()}</span></div>
      <div className="modal__row"><span className="modal__label">Completed</span><span>{task.completedAt ? new Date(task.completedAt).toLocaleString() : '—'}</span></div>
      <div className="board__form-actions">
        <button className="btn-ghost" onClick={onEdit}>Edit</button>
        <button className="btn" onClick={onDelete}>Delete</button>
      </div>
    </>
  );
}
