import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderBasic } from './harness';

describe('SelectSearchable (keyboard)', () => {
  it('ArrowDown then Enter selects the first option', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasic({ onValueChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    trigger.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenCalledWith('alice');
    expect(trigger).toHaveTextContent('Alice');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Escape closes the listbox without selecting', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasic({ onValueChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('ArrowDown twice then Enter selects the second option', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasic({ onValueChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenCalledWith('bob');
    expect(trigger).toHaveTextContent('Bob');
  });

    it('in multiple mode, Enter toggles selection on and off and listbox stays open', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasic({ multiple: true, onValueChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);

    // Move to first option
    await user.keyboard('{ArrowDown}');

    // First Enter → select "alice"
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith(
        expect.arrayContaining(['alice'])
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Second Enter → deselect "alice"
    await user.keyboard('{Enter}');

    expect(onValueChange).toHaveBeenLastCalledWith(
        expect.not.arrayContaining(['alice'])
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
});