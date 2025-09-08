import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { getTodoTasks, updateTodoTask, createTodoTask, deleteTodoTask } from '../features/todoTasks/todoTasksSlice';
import { COLUMN_ORDER, statusToColumn, type ColumnId } from '../constants/board';
import type { TodoTaskDto, CreateTodoTaskDto } from '../types/todoTask';
import { Status } from '../types/todoTask';
import '../styles/board.css';
import { Column } from '../components/board/Column';
import { Modal } from '../components/common/Modal';

type Bucket = Record<ColumnId, TodoTaskDto[]>;

const group = (items: TodoTaskDto[]): Bucket => ({
  todo: items.filter(t => statusToColumn(t.status) === 'todo'),
  inProgress: items.filter(t => statusToColumn(t.status) === 'inProgress'),
  done: items.filter(t => statusToColumn(t.status) === 'done'),
});

const statusText = (s: Status) =>
  s === Status.Todo ? 'Todo' : s === Status.InProgress ? 'In Progress' : 'Done';

const pad = (n: number) => String(n).padStart(2, '0');

const toLocalDateTimeParts = (iso?: string | null) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
};

const combineLocalToWire = (dateStr: string, timeStr: string) => {
  if (!dateStr) return null;
  const t = timeStr || '00:00';
  return `${dateStr}T${t}:00`;
};

const buildTimeOptions = (stepMin = 30) => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += stepMin) opts.push(`${pad(h)}:${pad(m)}`);
  return opts;
};
const TIME_OPTS = buildTimeOptions();

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(s => s.todoTasks);

  const [openDetails, setOpenDetails] = useState(false);
  const [selected, setSelected] = useState<TodoTaskDto | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [edit, setEdit] = useState<TodoTaskDto | null>(null);
  const [dueDatePart, setDueDatePart] = useState('');
  const [dueTimePart, setDueTimePart] = useState('');

  const [openCreate, setOpenCreate] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cDate, setCDate] = useState('');
  const [cTime, setCTime] = useState('');

  useEffect(() => { dispatch(getTodoTasks()); }, [dispatch]);

  const buckets = useMemo(() => group(items), [items]);

  const onDetails = (t: TodoTaskDto) => { setSelected(t); setOpenDetails(true); };
  const closeDetails = useCallback(() => setOpenDetails(false), []);

  const onEdit = (t: TodoTaskDto) => {
    setEdit({ ...t });
    const parts = toLocalDateTimeParts(t.dueDate);
    setDueDatePart(parts.date);
    setDueTimePart(parts.time);
    setOpenEdit(true);
  };
  const closeEdit = useCallback(() => setOpenEdit(false), []);
  const onEditChange = (patch: Partial<TodoTaskDto>) => setEdit(prev => (prev ? { ...prev, ...patch } : prev));

  const quickEdit = {
    today1800: () => setDueTimePart('18:00'),
    tomorrow0900: () => { const d = new Date(); d.setDate(d.getDate()+1); setDueDatePart(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`); setDueTimePart('09:00'); },
  };

  const onSaveEdit = async () => {
    if (!edit) return;
    const wireDue = combineLocalToWire(dueDatePart, dueTimePart);
    const dto: TodoTaskDto = { ...edit, dueDate: wireDue as any };
    try {
      await dispatch(updateTodoTask(dto)).unwrap();
      await dispatch(getTodoTasks());
      setOpenEdit(false);
    } catch { alert('Failed to update task'); }
  };

  const openCreateModal = () => {
    const d = new Date();
    setCDate(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`);
    setCTime('');
    setCTitle(''); setCDesc('');
    setOpenCreate(true);
  };
  const closeCreate = useCallback(() => setOpenCreate(false), []);
  const onSaveCreate = async () => {
    const dueWire = combineLocalToWire(cDate, cTime);
    const payload: CreateTodoTaskDto = {
      title: cTitle.trim(),
      description: cDesc.trim() || undefined,
      dueDate: dueWire ?? undefined,
    };
    if (!payload.title) { alert('Title is required'); return; }
    try {
      await dispatch(createTodoTask(payload)).unwrap();
      await dispatch(getTodoTasks());
      setOpenCreate(false);
    } catch { alert('Failed to create task'); }
  };

  const onDeleteSelected = async () => {
    if (!selected) return;
    const ok = window.confirm(`Delete task "${selected.title}"?`);
    if (!ok) return;
    try {
      await dispatch(deleteTodoTask(selected.id)).unwrap();
      await dispatch(getTodoTasks());
      setOpenDetails(false);
      if (openEdit) setOpenEdit(false);
    } catch { alert('Failed to delete task'); }
  };

  const onEditFromDetails = () => {
    if (!selected) return;
    onEdit(selected);
    setOpenDetails(false);
  };

  return (
    <main className="board">
      <div className="board__top">
        <h2 className="board__title">Todo Tasks</h2>
        <div className="board__actions">
          <button className="btn" onClick={openCreateModal}>+ Add Task</button>
        </div>
      </div>

      {error && <div style={{color:'#f87171', maxWidth:1200, margin:'0 auto 12px'}} role="alert">Error: {error}</div>}

      <div className="grid">
        {COLUMN_ORDER.map((col: ColumnId) => (
          <Column
            key={col}
            id={col}
            tasks={buckets[col]}
            loading={loading}
            onDetails={onDetails}
            onEdit={onEdit}
          />
        ))}
      </div>

      <Modal open={openDetails && !!selected} title={selected?.title ?? 'Details'} onClose={closeDetails}>
        {selected && (
          <>
            <div className="modal__row"><span className="modal__label">Title</span><span>{selected.title}</span></div>
            <div className="modal__row"><span className="modal__label">Description</span><span>{selected.description ?? '—'}</span></div>
            <div className="modal__row"><span className="modal__label">Status</span><span>{statusText(selected.status)}</span></div>
            <div className="modal__row"><span className="modal__label">Due date</span><span>{selected.dueDate ? new Date(selected.dueDate).toLocaleString() : '—'}</span></div>
            <div className="modal__row"><span className="modal__label">Created</span><span>{new Date(selected.createdAt).toLocaleString()}</span></div>
            <div className="modal__row"><span className="modal__label">Completed</span><span>{selected.completedAt ? new Date(selected.completedAt).toLocaleString() : '—'}</span></div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:12}}>
              <button className="btn-ghost" onClick={onEditFromDetails}>Edit</button>
              <button className="btn" onClick={onDeleteSelected}>Delete</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={openEdit && !!edit} title={edit ? `Edit: ${edit.title}` : 'Edit'} onClose={closeEdit} initialFocusId="f-title">
        {edit && (
          <form className="modal__body" role="form" aria-labelledby="modal-title" noValidate
                onSubmit={(e) => { e.preventDefault(); onSaveEdit(); }}>
            <div className="modal__row">
              <label className="modal__label" htmlFor="f-title">Title</label>
              <input id="f-title" value={edit.title}
                     onChange={(e) => onEditChange({ title: e.target.value })}
                     style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}
                     required />
            </div>

            <div className="modal__row">
              <label className="modal__label" htmlFor="f-desc">Description</label>
              <textarea id="f-desc" value={edit.description ?? ''} rows={3}
                        onChange={(e) => onEditChange({ description: e.target.value })}
                        style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}} />
            </div>

            <div className="modal__row">
              <label className="modal__label" htmlFor="f-status">Status</label>
              <select
                id="f-status"
                value={edit.status}
                onChange={(e) => onEditChange({ status: Number(e.currentTarget.value) as Status })}
                style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}
              >
                <option value={Status.Todo}>Todo</option>
                <option value={Status.InProgress}>In Progress</option>
                <option value={Status.Done}>Done</option>
              </select>
            </div>

            <div className="modal__row" style={{ gap: 12, alignItems:'center' }}>
              <label className="modal__label" htmlFor="f-date" style={{ width:140 }}>Due date</label>
              <input id="f-date" type="date" value={dueDatePart}
                     onChange={(e) => setDueDatePart(e.currentTarget.value)}
                     style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}} />
              <select aria-label="Time" value={dueTimePart} onChange={(e) => setDueTimePart(e.currentTarget.value)}
                      style={{ width:160, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}>
                <option value="">--:--</option>
                {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div style={{ display:'flex', gap:8 }}>
                <button type="button" className="btn-ghost" onClick={() => setDueTimePart('18:00')}>Today 18:00</button>
                <button type="button" className="btn-ghost" onClick={() => { const d=new Date(); d.setDate(d.getDate()+1); setDueDatePart(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`); setDueTimePart('09:00'); }}>Tomorrow 09:00</button>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:10 }}>
              <button type="button" className="btn-ghost" onClick={closeEdit}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={openCreate} title="Create task" onClose={closeCreate} initialFocusId="c-title">
        <form className="modal__body" role="form" aria-labelledby="modal-title" noValidate
              onSubmit={(e) => { e.preventDefault(); onSaveCreate(); }}>
          <div className="modal__row">
            <label className="modal__label" htmlFor="c-title">Title</label>
            <input id="c-title" value={cTitle}
                   onChange={(e) => setCTitle(e.currentTarget.value)}
                   style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}
                   required />
          </div>

          <div className="modal__row">
            <label className="modal__label" htmlFor="c-desc">Description</label>
            <textarea id="c-desc" value={cDesc} rows={3}
                      onChange={(e) => setCDesc(e.currentTarget.value)}
                      style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}} />
          </div>

          <div className="modal__row" style={{ gap: 12, alignItems:'center' }}>
            <label className="modal__label" htmlFor="c-date" style={{ width:140 }}>Due date</label>
            <input id="c-date" type="date" value={cDate}
                   onChange={(e) => setCDate(e.currentTarget.value)}
                   style={{flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}} />
            <select aria-label="Time" value={cTime} onChange={(e) => setCTime(e.currentTarget.value)}
                    style={{ width:160, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--panel-2)', color:'var(--fg)'}}>
              <option value="">--:--</option>
              {TIME_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ display:'flex', gap:8 }}>
              <button type="button" className="btn-ghost" onClick={() => setCTime('18:00')}>Today 18:00</button>
              <button type="button" className="btn-ghost" onClick={() => { const d=new Date(); d.setDate(d.getDate()+1); setCDate(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`); setCTime('09:00'); }}>Tomorrow 09:00</button>
              <button type="button" className="btn-ghost" onClick={() => { setCDate(''); setCTime(''); }}>No due</button>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:10 }}>
            <button type="button" className="btn-ghost" onClick={closeCreate}>Cancel</button>
            <button type="submit" className="btn btn--primary">Create</button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
