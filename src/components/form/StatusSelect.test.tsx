import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusSelect } from './StatusSelect';
import { Status } from '../../types/todoTask';

describe('StatusSelect', () => {
  test('renders with current value', () => {
    render(<StatusSelect value={Status.Todo} onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue(String(Status.Todo));
  });

  test('changes value and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<StatusSelect value={Status.Todo} onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox'), String(Status.InProgress));

    expect(onChange).toHaveBeenCalledWith(Status.InProgress);
  });

  test('applies custom id', () => {
    render(<StatusSelect id="status-field" value={Status.Done} onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'status-field');
  });
});
