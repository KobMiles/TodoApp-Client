import { useMemo, useState, useCallback } from 'react';
import type { TodoTaskDto, CreateTodoTaskDto } from '../types/todoTask';
import { COLUMN_ORDER, statusToColumn, type ColumnId } from '../constants/board';
import '../styles/board.css';

import { Column } from '../components/board/Column/Column';
import { Modal } from '../components/common/Modal/Modal';
import { TaskDetails } from '../components/board/TaskDetails/TaskDetails';
import { EditTaskForm } from '../components/board/EditTaskForm/EditTaskForm';
import { CreateTaskForm } from '../components/board/CreateTaskForm/CreateTaskForm';

import {
  useGetTodoTasksQuery,
  useCreateTodoTaskMutation,
  useUpdateTodoTaskMutation,
  useDeleteTodoTaskMutation,
} from '../api/todoApi';

type Bucket = Record<ColumnId, TodoTaskDto[]>;

const group = (items: TodoTaskDto[]): Bucket => {
  return {
    todo: items.filter((t) => statusToColumn(t.status) === 'todo'),
    inProgress: items.filter((t) => statusToColumn(t.status) === 'inProgress'),
    done: items.filter((t) => statusToColumn(t.status) === 'done'),
  };
};

export default function BoardPage() {
  const { data = [], isFetching, error, refetch } = useGetTodoTasksQuery();
  const [createTask, { isLoading: isCreating }] = useCreateTodoTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTodoTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTodoTaskMutation();

  const loading = isFetching || isCreating || isUpdating || isDeleting;
  const errText = error ? 'Failed to load' : undefined;

  const [openDetails, setOpenDetails] = useState(false);
  const [selected, setSelected] = useState<TodoTaskDto | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [edit, setEdit] = useState<TodoTaskDto | null>(null);

  const [openCreate, setOpenCreate] = useState(false);

  const buckets = useMemo(() => group(data), [data]);

  const onDetails = (t: TodoTaskDto) => {
    setSelected(t);
    setOpenDetails(true);
  };
  const closeDetails = useCallback(() => setOpenDetails(false), []);

  const onEdit = (t: TodoTaskDto) => {
    setEdit({ ...t });
    setOpenEdit(true);
  };
  const closeEdit = useCallback(() => setOpenEdit(false), []);

  const openCreateModal = () => setOpenCreate(true);
  const closeCreate = useCallback(() => setOpenCreate(false), []);

  const onDeleteSelected = async () => {
    if (!selected) return;
    const ok = window.confirm(`Delete task "${selected.title}"?`);
    if (!ok) return;
    try {
      await deleteTask(selected.id).unwrap();
      setOpenDetails(false);
      if (openEdit) setOpenEdit(false);
    } catch {
      alert('Failed to delete task');
    }
  };

  const onEditFromDetails = () => {
    if (!selected) return;
    onEdit(selected);
    setOpenDetails(false);
  };

  const submitEdit = async (dto: TodoTaskDto) => {
    try {
      await updateTask(dto).unwrap();
      setOpenEdit(false);
    } catch {
      alert('Failed to update task');
    }
  };

  const submitCreate = async (payload: CreateTodoTaskDto) => {
    try {
      await createTask(payload).unwrap();
      setOpenCreate(false);
    } catch {
      alert('Failed to create task');
    }
  };

  return (
    <main className="board">
      <div className="board__top">
        <h2 className="board__title">Todo Tasks</h2>
        <div className="board__actions">
          <button className="btn action-btn" onClick={openCreateModal}>+ Add Task</button>
          <button className="btn-ghost action-btn" onClick={() => refetch()}>Refresh</button>
        </div>
      </div>

      {errText && (
        <div className="board__error" role="alert">
          Error: {errText}
        </div>
      )}

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

      <Modal
        open={openDetails && !!selected}
        title={selected?.title ?? 'Details'}
        onClose={closeDetails}
      >
        {selected && (
          <TaskDetails
            task={selected}
            onEdit={onEditFromDetails}
            onDelete={onDeleteSelected}
          />
        )}
      </Modal>

      <Modal
        open={openEdit && !!edit}
        title={edit ? `Edit: ${edit.title}` : 'Edit'}
        onClose={closeEdit}
        initialFocusId="f-title"
      >
        {edit && (
          <EditTaskForm
            value={edit}
            onCancel={closeEdit}
            onSubmit={submitEdit}
          />
        )}
      </Modal>

      <Modal
        open={openCreate}
        title="Create task"
        onClose={closeCreate}
        initialFocusId="c-title"
      >
        <CreateTaskForm onCancel={closeCreate} onSubmit={submitCreate} />
      </Modal>
    </main>
  );
}
