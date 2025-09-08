import { Status } from '../../types/todoTask';

// Базовий селект статусу з числовим value [2]
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
      value={value}
      onChange={(e) => onChange(Number(e.currentTarget.value) as Status)} // HTMLSelectElement.value -> string [6]
      style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}
    >
      <option value={Status.Todo}>Todo</option>
      <option value={Status.InProgress}>In Progress</option>
      <option value={Status.Done}>Done</option>
    </select>
  );
}
