import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTaskForm } from './CreateTaskForm';

jest.mock('../../../utils/dateTime', () => ({
  buildTimeOptions: jest.fn(() => ['09:00', '18:00']),
  combineLocalToWire: jest.fn((date, time) => (date ? `${date}T${time || '00:00'}:00` : null)),
  pad: jest.fn((n) => String(n).padStart(2, '0')),
}));

jest.mock('../../../validators/todoTaskValidators', () => ({
  CreateTodoTaskClientSchema: { safeParse: jest.fn() },
  getFieldErrors: jest.fn(),
}));

describe('CreateTaskForm', () => {
  const baseProps = { onCancel: jest.fn(), onSubmit: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    const fixed = new Date('2023-12-25T10:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => fixed as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('submits valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const { CreateTodoTaskClientSchema } = require('../../../validators/todoTaskValidators');
    CreateTodoTaskClientSchema.safeParse.mockReturnValue({
      success: true,
      data: { title: 'Task', description: 'Desc', dueDate: '2023-12-25T09:00:00' },
    });

    render(<CreateTaskForm {...baseProps} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/title/i), 'Task');
    await user.type(screen.getByLabelText(/description/i), 'Desc');
    await user.clear(screen.getByLabelText(/due date/i));
    await user.type(screen.getByLabelText(/due date/i), '2023-12-25');
    await user.selectOptions(screen.getByLabelText(/time/i), '09:00');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Task',
        description: 'Desc',
        dueDate: '2023-12-25T09:00:00',
      })
    );
  });

  test('blocks submit and shows errors on invalid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const { CreateTodoTaskClientSchema, getFieldErrors } = require('../../../validators/todoTaskValidators');
    CreateTodoTaskClientSchema.safeParse.mockReturnValue({ success: false, error: new Error('x') });
    getFieldErrors.mockReturnValue({ title: 'Title is required' });

    render(<CreateTaskForm {...baseProps} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  test('cancel triggers onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(<CreateTaskForm {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
