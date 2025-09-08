export enum Status {
  Todo = 0,
  InProgress = 1,
  Done = 2,
}

export interface CreateTodoTaskDto {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface TodoTaskDto {
  id: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: Status;
  createdAt: string;
  completedAt?: string | null;
}

export interface UpdateTodoTaskDto extends TodoTaskDto {}