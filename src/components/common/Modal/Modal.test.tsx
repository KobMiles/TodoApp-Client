import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

test('returns null when closed', () => {
  const { container } = render(<Modal open={false} title="X" onClose={() => {}}>Body</Modal>);
  
  expect(container.firstChild).toBeNull();
});

test('renders dialog with title when open', () => {
  render(<Modal open title="My Modal" onClose={() => {}}>Body</Modal>);

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('My Modal')).toBeInTheDocument();
});

test('closes on Close button and backdrop click', () => {
  const onClose = jest.fn();

  render(<Modal open title="Close me" onClose={onClose}>Body</Modal>);

  fireEvent.click(screen.getByRole('button', { name: /Close dialog/i }));

  fireEvent.click(document.querySelector('.modal__backdrop') as HTMLElement);

  expect(onClose).toHaveBeenCalledTimes(2);
});

test('closes on Escape key', () => {
  const onClose = jest.fn();

  render(<Modal open title="Esc" onClose={onClose}>Body</Modal>);

  fireEvent.keyDown(document, { key: 'Escape' });

  expect(onClose).toHaveBeenCalledTimes(1);
});
