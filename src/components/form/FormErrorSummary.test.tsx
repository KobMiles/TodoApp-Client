import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DueQuickActions } from './DueQuickActions';

describe('DueQuickActions', () => {
  test('renders group and buttons', () => {
    render(<DueQuickActions onToday18={() => {}} onTomorrow09={() => {}} onNoDue={() => {}} />);
    expect(screen.getByRole('group', { name: /quick due presets/i })).toBeInTheDocument(); // [21]
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument(); // [21]
    expect(screen.getByRole('button', { name: /tomorrow/i })).toBeInTheDocument(); // [21]
    expect(screen.getByRole('button', { name: /no due/i })).toBeInTheDocument(); // [21]
  });

  test('fires callbacks', async () => {
    const user = userEvent.setup();
    const onToday18 = jest.fn();
    const onTomorrow09 = jest.fn();
    const onNoDue = jest.fn();
    render(<DueQuickActions onToday18={onToday18} onTomorrow09={onTomorrow09} onNoDue={onNoDue} />);
    await user.click(screen.getByRole('button', { name: /today/i })); // [16]
    await user.click(screen.getByRole('button', { name: /tomorrow/i })); // [16]
    await user.click(screen.getByRole('button', { name: /no due/i })); // [16]
    expect(onToday18).toHaveBeenCalledTimes(1);
    expect(onTomorrow09).toHaveBeenCalledTimes(1);
    expect(onNoDue).toHaveBeenCalledTimes(1);
  });

  test('disabled prevents clicks', async () => {
    const user = userEvent.setup();
    const onToday18 = jest.fn();
    const onTomorrow09 = jest.fn();
    const onNoDue = jest.fn();
    render(<DueQuickActions disabled onToday18={onToday18} onTomorrow09={onTomorrow09} onNoDue={onNoDue} />);
    await user.click(screen.getByRole('button', { name: /today/i })); // [16]
    await user.click(screen.getByRole('button', { name: /tomorrow/i })); // [16]
    await user.click(screen.getByRole('button', { name: /no due/i })); // [16]
    expect(onToday18).not.toHaveBeenCalled();
    expect(onTomorrow09).not.toHaveBeenCalled();
    expect(onNoDue).not.toHaveBeenCalled();
  });
});
