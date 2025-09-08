import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { http } from '../../services/http'
import { API_PATHS } from '../../constants/api'
import type { CreateTodoTaskDto, TodoTaskDto, UpdateTodoTaskDto } from '../../types/todoTask'

interface State { items: TodoTaskDto[]; loading: boolean; error?: string }
const initialState: State = { items: [], loading: false }

export const getTodoTasks = createAsyncThunk<TodoTaskDto[], void, { rejectValue: string }>(
  'todoTasks/getAll',
  async (_, { rejectWithValue }) => {
    try { const { data } = await http.get<TodoTaskDto[]>(API_PATHS.todoTasks); return data }
    catch { return rejectWithValue('Fetch error') }
  }
)

export const createTodoTask = createAsyncThunk<TodoTaskDto, CreateTodoTaskDto, { rejectValue: string }>(
  'todoTasks/create',
  async (dto, { rejectWithValue }) => {
    try { const { data } = await http.post<TodoTaskDto>(API_PATHS.todoTasks, dto); return data }
    catch { return rejectWithValue('Create error') }
  }
)

export const updateTodoTask = createAsyncThunk<TodoTaskDto, UpdateTodoTaskDto, { rejectValue: string }>(
  'todoTasks/update',
  async (dto, { rejectWithValue }) => {
    try { const { data } = await http.put<TodoTaskDto>(API_PATHS.todoTasks, dto); return data }
    catch { return rejectWithValue('Update error') }
  }
)

export const deleteTodoTask = createAsyncThunk<number, number, { rejectValue: string }>(
  'todoTasks/delete',
  async (id, { rejectWithValue }) => {
    try { await http.delete(`${API_PATHS.todoTasks}/${id}`); return id }
    catch { return rejectWithValue('Delete error') }
  }
)

const slice = createSlice({
  name: 'todoTasks',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getTodoTasks.pending, (s) => { s.loading = true; s.error = undefined })
     .addCase(getTodoTasks.fulfilled, (s, a: PayloadAction<TodoTaskDto[]>) => { s.loading = false; s.items = a.payload })
     .addCase(getTodoTasks.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'unknown error' })

     .addCase(createTodoTask.pending, (s) => { s.loading = true; s.error = undefined })
     .addCase(createTodoTask.fulfilled, (s, a: PayloadAction<TodoTaskDto>) => { s.loading = false; s.items.push(a.payload) })
     .addCase(createTodoTask.rejected, (s, a) => { s.loading = false; s.error = a.payload || 'unknown error' })

     .addCase(updateTodoTask.pending, (s, a) => {
       const arg = a.meta.arg
       const i = s.items.findIndex(t => t.id === arg.id)
       if (i !== -1) s.items[i] = { ...s.items[i], ...arg }
     })
     .addCase(updateTodoTask.fulfilled, (s, a: PayloadAction<TodoTaskDto>) => {
       const i = s.items.findIndex(t => t.id === a.payload.id)
       if (i !== -1) s.items[i] = a.payload
     })
     .addCase(updateTodoTask.rejected, (s, a) => { s.error = a.payload || 'update failed' })

     .addCase(deleteTodoTask.fulfilled, (s, a: PayloadAction<number>) => {
       s.items = s.items.filter(t => t.id !== a.payload)
     })
  },
})

export default slice.reducer
