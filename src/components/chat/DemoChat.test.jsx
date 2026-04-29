import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DemoChat from './DemoChat';

describe('DemoChat', () => {
  it('does not render the assistant control while hidden', () => {
    render(<DemoChat hidden context={{}} />);

    expect(screen.queryByRole('button', { name: /open beta assistant/i })).not.toBeInTheDocument();
  });
});
