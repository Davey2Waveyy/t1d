import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppContainer from './AppContainer';

describe('AppContainer', () => {
  it('wraps dashboard content in the desktop phone presentation shell', () => {
    render(
      <AppContainer>
        <div>Dashboard content</div>
      </AppContainer>
    );

    expect(screen.getByTestId('phone-frame')).toBeInTheDocument();
    expect(screen.getByTestId('phone-screen')).toContainElement(screen.getByText('Dashboard content'));
    expect(screen.getByTestId('phone-notch')).toBeInTheDocument();
    expect(screen.getByTestId('phone-home-indicator')).toBeInTheDocument();
  });
});
