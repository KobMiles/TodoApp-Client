import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { getTodoTasks, updateTodoTask, createTodoTask, deleteTodoTask } from '../features/todoTasks/todoTasksSlice';
import { COLUMN_ORDER, statusToColumn, type ColumnId } from '../constants/board';
import type { TodoTaskDto, CreateTodoTaskDto } from '../types/todoTask';
import '../styles/board.css';
import { Column } from '../components/board/Column/Column';
import { Modal } from '../components/common/Modal/Modal';
import { TaskDetails } from '../components/board/TaskDetails/TaskDetails';
import { EditTaskForm } from '../components/board/EditTaskForm/EditTaskForm';
import { CreateTaskForm } from '../components/board/CreateTaskForm/CreateTaskForm';

type Bucket = Record<ColumnId, TodoTaskDto[]>;

const group = (items: TodoTaskDto[]): Bucket => ({
  todo: items.filter(t => statusToColumn(t.status) === 'todo'),
  inProgress: items.filter(t => statusToColumn(t.status) === 'inProgress'),
  done: items.filter(t => statusToColumn(t.status) === 'done'),
});

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(s => s.todoTasks);

  const [openDetails, setOpenDetails] = useState(false);
  const [selected, setSelected] = useState<TodoTaskDto | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [edit, setEdit] = useState<TodoTaskDto | null>(null);

  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => { dispatch(getTodoTasks()); }, [dispatch]);

  const buckets = useMemo(() => group(items), [items]);

  const onDetails = (t: TodoTaskDto) => { setSelected(t); setOpenDetails(true); };
  const closeDetails = useCallback(() => setOpenDetails(false), []);

  const onEdit = (t: TodoTaskDto) => { setEdit({ ...t }); setOpenEdit(true); };
  const closeEdit = useCallback(() => setOpenEdit(false), []);

  const openCreateModal = () => { setOpenCreate(true); };
  const closeCreate = useCallback(() => setOpenCreate(false), []);

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

  const submitEdit = async (dto: TodoTaskDto) => {
    try {
      await dispatch(updateTodoTask(dto)).unwrap();
      await dispatch(getTodoTasks());
      setOpenEdit(false);
    } catch { alert('Failed to update task'); }
  };

  const submitCreate = async (payload: CreateTodoTaskDto) => {
    try {
      await dispatch(createTodoTask(payload)).unwrap();
      await dispatch(getTodoTasks());
      setOpenCreate(false);
    } catch { alert('Failed to create task'); }
  };

  return (
    <main className="board">
      <div className="board__top">
        <h2 className="board__title">Todo Tasks</h2>
        <div className="board__actions">
          <button className="btn" onClick={openCreateModal}>+ Add Task</button>
        </div>
      </div>

      {error && <div className="board__error" role="alert">Error: {error}</div>}

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
          <TaskDetails task={selected} onEdit={onEditFromDetails} onDelete={onDeleteSelected} />
        )}
      </Modal>

      <Modal open={openEdit && !!edit} title={edit ? `Edit: ${edit.title}` : 'Edit'} onClose={closeEdit} initialFocusId="f-title">
        {edit && (
          <EditTaskForm value={edit} onCancel={closeEdit} onSubmit={submitEdit} />
        )}
      </Modal>

      <Modal open={openCreate} title="Create task" onClose={closeCreate} initialFocusId="c-title">
        <CreateTaskForm onCancel={closeCreate} onSubmit={submitCreate} />
      </Modal>
    </main>
  );
}
