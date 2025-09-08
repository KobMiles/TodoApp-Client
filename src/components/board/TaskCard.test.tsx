import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../board/TaskCard';
import type { TodoTaskDto } from '../../types/todoTask';

const base = (overrides: Partial<TodoTaskDto> = {}): TodoTaskDto => ({
  id: 1,
  title: 'Hello',
  description: 'Desc',
  dueDate: null,
  status: 0,
  createdAt: new Date().toISOString(),
  completedAt: null,
  ...overrides,
});

test('renders title and description', () => {
  render(<TaskCard task={base()} />);
  
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.getByText(/Desc/)).toBeInTheDocument();
});


test('renders "No description" when empty', () => {
  render(<TaskCard task={base({ description: null })} />);
  
  expect(screen.getByText('No description')).toBeInTheDocument();
});

test('shows future due badge with non-overdue style', () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  render(<TaskCard task={base({ dueDate: future })} />);
  
  const badge = screen.getByText(/Due/i);
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveClass('badge--due');
});

test('shows past due badge with overdue style', () => {
  const past = new Date(Date.now() - 60_000).toISOString();
  render(<TaskCard task={base({ dueDate: past })} />);

  const badge = screen.getByText(/Due/i);
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveClass('badge--overdue');
});

test('fires Details and Edit callbacks', async () => {
  const onDetails = jest.fn();
  const onEdit = jest.fn();
  const user = userEvent.setup();
  render(<TaskCard task={base()} onDetails={onDetails} onEdit={onEdit} />);

  await user.click(screen.getByRole('button', { name: /Details/i }));
  await user.click(screen.getByRole('button', { name: /Edit/i }));
  expect(onDetails).toHaveBeenCalledTimes(1);
  expect(onEdit).toHaveBeenCalledTimes(1);
});
