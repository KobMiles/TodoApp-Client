import { Status } from '../types/todoTask';

export type ColumnId = 'todo' | 'inProgress' | 'done';

export const COLUMN_ORDER: ColumnId[] = ['todo', 'inProgress', 'done'];

export const COLUMN_TITLES: Record<ColumnId, string> = {
  todo: 'Todo',
  inProgress: 'In Progress',
  done: 'Done',
};

export const statusToColumn = (s: Status): ColumnId =>
  s === Status.Todo ? 'todo' : s === Status.InProgress ? 'inProgress' : 'done';

export {};
