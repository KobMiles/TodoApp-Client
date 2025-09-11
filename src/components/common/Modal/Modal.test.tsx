import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      const id = setTimeout(() => cb(performance.now()), 0) as unknown as number;
      return id;
    });
  });

  afterEach(() => {
    (window.requestAnimationFrame as any).mockRestore?.();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders dialog with title and children when open', () => {
    render(
      <Modal open title="My Dialog" onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByRole('dialog', { name: 'My Dialog' })).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('clicking backdrop calls onClose', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onClose = jest.fn();
    render(
      <Modal open title="Dlg" onClose={onClose}>
        <div>Body</div>
      </Modal>
    );
    const backdrop = document.querySelector('.modal__backdrop') as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('pressing Escape closes the dialog', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onClose = jest.fn();
    render(
      <Modal open title="Dlg" onClose={onClose}>
        <div>Body</div>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('focuses close button by default after rAF', () => {
    render(
      <Modal open title="Dlg" onClose={() => {}}>
        <input id="field-a" />
      </Modal>
    );
    jest.runAllTimers();
    expect(screen.getByRole('button', { name: /close dialog/i })).toHaveFocus();
  });

  test('focuses element by initialFocusId', () => {
    render(
      <Modal open title="Dlg" onClose={() => {}} initialFocusId="field-a">
        <input id="field-a" />
      </Modal>
    );
    jest.runAllTimers();
    const target = document.getElementById('field-a') as HTMLElement;
    expect(target).toHaveFocus();
  });

  test('returns null when closed', () => {
    const { container } = render(
      <Modal open={false} title="Dlg" onClose={() => {}}>
        <div>Body</div>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });
});
