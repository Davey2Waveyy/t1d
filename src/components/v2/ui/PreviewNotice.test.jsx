import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PreviewNotice from './PreviewNotice';

describe('PreviewNotice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('explains preview and medical-safety limits before acknowledgement', () => {
    render(<PreviewNotice />);

    expect(screen.getByRole('dialog', { name: 'Preview safety notice' })).toBeInTheDocument();
    expect(screen.getAllByText(/preview demo/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
    expect(screen.getByText(/do not use betatrace to make insulin dosing/i)).toBeInTheDocument();
  });

  it('stores acknowledgement and calls onAccept', () => {
    const onAccept = vi.fn();
    render(<PreviewNotice onAccept={onAccept} />);

    fireEvent.click(screen.getByRole('button', { name: 'I understand' }));

    expect(localStorage.getItem('betatrace_preview_notice_seen')).toBe('true');
    expect(onAccept).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog', { name: 'Preview safety notice' })).not.toBeInTheDocument();
  });

  it('does not render after acknowledgement', () => {
    localStorage.setItem('betatrace_preview_notice_seen', 'true');

    render(<PreviewNotice />);

    expect(screen.queryByRole('dialog', { name: 'Preview safety notice' })).not.toBeInTheDocument();
  });
});
