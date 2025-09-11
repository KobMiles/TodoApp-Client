import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';
import { Status } from '../../../types/todoTask';

const baseTask = {
  id: 1,
  title: 'Demo',
  description: 'A short description',
  status: Status.Todo,
  dueDate: '2023-12-25T14:00:00Z',
  createdAt: '2023-01-01T00:00:00Z',
  completedAt: null as string | null,
};

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2023-12-25T12:00:00Z').getTime());
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders title and description fallback', () => {
    render(<TaskCard task={{ ...baseTask, description: null }} />);
    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  test('ellipsizes long description', () => {
    const long = 'x'.repeat(120);
    render(<TaskCard task={{ ...baseTask, description: long }} />);
    expect(screen.getByText(/…$/)).toBeInTheDocument();
  });

  test('shows due badge for future date', () => {
    render(<TaskCard task={{ ...baseTask, dueDate: '2023-12-25T14:00:00Z' }} />);
    const badge = screen.getByText(/^Due /);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge', 'badge--due');
  });

  test('marks overdue for past date', () => {
    render(<TaskCard task={{ ...baseTask, dueDate: '2023-12-25T10:00:00Z' }} />);
    const badge = screen.getByText(/^Due /);
    expect(badge).toHaveClass('badge--overdue');
  });

  test('invokes details and edit callbacks', async () => {
    const user = userEvent.setup();
    const onDetails = jest.fn();
    const onEdit = jest.fn();

    render(<TaskCard task={baseTask} onDetails={onDetails} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /details/i }));
    await user.click(screen.getByRole('button', { name: /edit/i }));

    expect(onDetails).toHaveBeenCalledWith(baseTask);
    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });

  test('hides due badge when dueDate is empty', () => {
    render(<TaskCard task={{ ...baseTask, dueDate: undefined }} />);
    expect(screen.queryByText(/^Due /)).toBeNull();
  });
});
