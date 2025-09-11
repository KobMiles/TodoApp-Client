import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/api';
import { API_PATHS } from '../constants/api';
import type { TodoTaskDto, CreateTodoTaskDto, UpdateTodoTaskDto } from '../types/todoTask';

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL || '',
  }),
  tagTypes: ['TodoTask'],
  endpoints: (build) => ({
    getTodoTasks: build.query<TodoTaskDto[], void>({
      query: () => ({ url: API_PATHS.todoTasks }),
      providesTags: (result) => {
        if (result) {
          return [
            ...result.map((t) => ({ type: 'TodoTask' as const, id: t.id })),
            { type: 'TodoTask' as const, id: 'LIST' },
          ];
        }
        return [{ type: 'TodoTask', id: 'LIST' }];
      },
    }),
    createTodoTask: build.mutation<TodoTaskDto, CreateTodoTaskDto>({
      query: (body) => ({ url: API_PATHS.todoTasks, method: 'POST', body }),
      invalidatesTags: [{ type: 'TodoTask', id: 'LIST' }],
    }),
    updateTodoTask: build.mutation<TodoTaskDto, UpdateTodoTaskDto>({
      query: (body) => ({ url: API_PATHS.todoTasks, method: 'PUT', body }),
      invalidatesTags: (res) => {
        if (res) {
          return [{ type: 'TodoTask', id: res.id }, { type: 'TodoTask', id: 'LIST' }];
        }
        return [{ type: 'TodoTask', id: 'LIST' }];
      },
    }),
    deleteTodoTask: build.mutation<number, number>({
      query: (id) => ({ url: `${API_PATHS.todoTasks}/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => {
        return [{ type: 'TodoTask', id }, { type: 'TodoTask', id: 'LIST' }];
      },
    }),
  }),
});

export const {
  useGetTodoTasksQuery,
  useCreateTodoTaskMutation,
  useUpdateTodoTaskMutation,
  useDeleteTodoTaskMutation,
} = todoApi;
