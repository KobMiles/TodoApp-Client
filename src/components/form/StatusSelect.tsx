import { Status } from '../../types/todoTask';

export function StatusSelect({
  value,
  onChange,
  id = 'status',
}: {
  value: Status;
  onChange: (next: Status) => void;
  id?: string;
}) {
  return (
    <select
      id={id}
      className="modal__control"
      value={value}
      onChange={(e) => onChange(Number(e.currentTarget.value) as Status)}
    >
      <option value={Status.Todo}>Todo</option>
      <option value={Status.InProgress}>In Progress</option>
      <option value={Status.Done}>Done</option>
    </select>
  );
}
