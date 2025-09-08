<<<<<<< HEAD
=======
// src/components/board/__tests__/Column.test.tsx
>>>>>>> a4b6200 (Add Jest setup and tests)
import { render, screen } from '@testing-library/react';
import { Column } from '../board/Column';
import type { TodoTaskDto } from '../../types/todoTask';

const makeTask = (id: number, title: string): TodoTaskDto => ({
  id,
  title,
  description: null,
  dueDate: null,
  status: 0,
  createdAt: new Date().toISOString(),
  completedAt: null
});

test('renders column title, subtitle and tasks count', () => {
  const tasks = [makeTask(1, 'A'), makeTask(2, 'B')];
  render(<Column id="todo" tasks={tasks} loading={false} />);
  expect(screen.getByText('Todo')).toBeInTheDocument();
  expect(screen.getByText("This item hasn't been started")).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('B')).toBeInTheDocument();
});

test('shows skeletons while loading', () => {
  render(<Column id="inProgress" tasks={[]} loading />);
  expect(document.querySelectorAll('.skel')).toHaveLength(3);
});

test('bubbles Details/Edit callbacks from TaskCard', async () => {
  const onDetails = jest.fn();
  const onEdit = jest.fn();
  const tasks = [makeTask(3, 'Card')];

  render(<Column id="done" tasks={tasks} loading={false} onDetails={onDetails} onEdit={onEdit} />);

  await screen.findByText('Card');
  (await screen.findByRole('button', { name: /Details/i })).click();
  (await screen.findByRole('button', { name: /Edit/i })).click();

  expect(onDetails).toHaveBeenCalledTimes(1);
  expect(onEdit).toHaveBeenCalledTimes(1);
});
