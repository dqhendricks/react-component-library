import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderBasic } from './harness';

describe('SelectSearchable (basic)', () => {
  it('renders trigger and label', () => {
    renderBasic();

    expect(screen.getByText('Select Person')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Person' })).toBeInTheDocument();
  });

  it('opens and shows options', async () => {
    const user = userEvent.setup();
    renderBasic();

    expect(
        screen.queryByRole('listbox'),
        'listbox should not be accessible while closed',
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Select Person' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Alice' })).toBeInTheDocument();
  });

  it('selecting an option updates trigger and fires onValueChange callback', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasic({ onValueChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));

    expect(trigger).toHaveTextContent('Alice');
    expect(onValueChange).toHaveBeenCalledWith('alice');
  });

  it('selecting an option fires native onChange with target.value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderBasic({ onChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));

    expect(onChange).toHaveBeenCalledTimes(1);

    const eventArg = onChange.mock.calls[0]?.[0];
    expect(eventArg).toBeTruthy();

    expect(eventArg.target.value).toBe('alice');
  });
});