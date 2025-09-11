import { Status } from '../types/todoTask';

export type ColumnId = 'todo' | 'inProgress' | 'done';

export const COLUMN_ORDER: ColumnId[] = ['todo', 'inProgress', 'done'];

export const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: 'Todo',
  inProgress: 'In Progress',
  done: 'Done',
};

export const statusToColumn = (s: Status): ColumnId => {
  if (s === Status.Todo) {
    return 'todo';
  }
  if (s === Status.InProgress) {
    return 'inProgress';
  }
  return 'done';
};

export {};
