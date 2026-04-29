import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sheet from './Sheet';

describe('Sheet', () => {
  it('renders children when open', () => {
    render(<Sheet open onOpenChange={() => {}}>hello</Sheet>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const { queryByText } = render(<Sheet open={false} onOpenChange={() => {}}>hello</Sheet>);
    expect(queryByText('hello')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when backdrop is clicked', () => {
    const onOpenChange = vi.fn();
    render(<Sheet open onOpenChange={onOpenChange}>hello</Sheet>);
    fireEvent.click(screen.getByTestId('sheet-backdrop'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on Escape', () => {
    const onOpenChange = vi.fn();
    render(<Sheet open onOpenChange={onOpenChange}>hello</Sheet>);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
