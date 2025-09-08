import { configureStore } from '@reduxjs/toolkit'
import todoTasks from '../features/todoTasks/todoTasksSlice'

export const store = configureStore({
  reducer: { todoTasks },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
