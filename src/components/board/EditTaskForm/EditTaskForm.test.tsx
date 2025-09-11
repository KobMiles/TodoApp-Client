import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditTaskForm } from './EditTaskForm';
import { Status } from '../../../types/todoTask';

jest.mock('../../../utils/dateTime', () => ({
  buildTimeOptions: jest.fn(() => ['09:00', '18:00']),
  toLocalDateTimeParts: jest.fn(), 
  combineLocalToWire: jest.fn((date, time) => (date ? `${date}T${time || '00:00'}:00` : null)),
  pad: jest.fn((n) => String(n).padStart(2, '0')),
}));

jest.mock('../../../validators/todoTaskValidators', () => ({
  UpdateTodoTaskClientSchema: { safeParse: jest.fn() },
  getFieldErrors: jest.fn(),
}));

const baseTask = {
  id: 1,
  title: 'Old',
  description: 'Old desc',
  status: Status.Todo,
  dueDate: '2023-12-25T09:00:00',
  createdAt: '2023-01-01T00:00:00',
  completedAt: null,
};

describe('EditTaskForm', () => {
  const baseProps = { value: baseTask, onCancel: jest.fn(), onSubmit: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    const { toLocalDateTimeParts } = require('../../../utils/dateTime');
    toLocalDateTimeParts.mockReturnValue({ date: '2023-12-25', time: '09:00' });
  });

  test('submits valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const { UpdateTodoTaskClientSchema } = require('../../../validators/todoTaskValidators');
    const resultData = {
      ...baseTask,
      title: 'New',
      description: 'New desc',
      status: Status.InProgress,
      dueDate: '2023-12-25T18:00:00',
    };
    UpdateTodoTaskClientSchema.safeParse.mockReturnValue({ success: true, data: resultData });

    render(<EditTaskForm {...baseProps} onSubmit={onSubmit} />);
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'New');
    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), 'New desc');
    await user.selectOptions(screen.getByLabelText(/status/i), String(Status.InProgress));
    await user.selectOptions(screen.getByLabelText(/time/i), '18:00');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(resultData));
  });

  test('blocks submit and shows errors on invalid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const { UpdateTodoTaskClientSchema, getFieldErrors } = require('../../../validators/todoTaskValidators');
    UpdateTodoTaskClientSchema.safeParse.mockReturnValue({ success: false, error: new Error('x') });
    getFieldErrors.mockReturnValue({ title: 'Title is required' });

    render(<EditTaskForm {...baseProps} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  test('cancel triggers onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(<EditTaskForm {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
