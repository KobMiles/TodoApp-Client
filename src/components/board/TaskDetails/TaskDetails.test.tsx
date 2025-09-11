import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetails } from './TaskDetails';
import { Status } from '../../../types/todoTask';

const fullTask = {
  id: 7,
  title: 'Build feature',
  description: 'Implement details view',
  status: Status.Done,
  dueDate: '2023-12-25T14:00:00Z',
  createdAt: '2023-12-20T10:00:00Z',
  completedAt: '2023-12-24T18:00:00Z',
};

const emptyTask = {
  ...fullTask,
  description: null as string | null,
  dueDate: undefined as string | undefined,
  completedAt: null as string | null,
  status: Status.InProgress,
};

describe('TaskDetails', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest
      .spyOn(global.Date.prototype, 'toLocaleString')
      .mockImplementation(function (this: Date) {
        return this.toISOString();
      });
  });
  afterEach(() => {
    spy.mockRestore();
  });

  test('renders all fields with formatted dates', () => {
    render(<TaskDetails task={fullTask} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Build feature')).toBeInTheDocument();
    expect(screen.getByText('Implement details view')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    expect(
      screen.getByText(new Date(fullTask.dueDate!).toISOString())
    ).toBeInTheDocument();
    expect(
      screen.getByText(new Date(fullTask.createdAt!).toISOString())
    ).toBeInTheDocument();
    expect(
      screen.getByText(new Date(fullTask.completedAt!).toISOString())
    ).toBeInTheDocument();
  });

  test('shows placeholders when optional fields are missing', () => {
    render(<TaskDetails task={emptyTask} onEdit={() => {}} onDelete={() => {}} />);
    const placeholders = screen.getAllByText('—');
    expect(placeholders.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  test('fires edit and delete handlers', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(<TaskDetails task={fullTask} onEdit={onEdit} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
