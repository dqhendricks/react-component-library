import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderBasic } from './harness';

describe('SelectSearchable (multiple)', () => {
  it('does not close listbox when selecting options', async () => {
    const user = userEvent.setup();
    renderBasic({ multiple: true });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('allows selecting multiple options and updates trigger text', async () => {
    const user = userEvent.setup();
    renderBasic({ multiple: true });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));
    await user.click(screen.getByRole('option', { name: 'Bob' }));

    // Adjust if you format differently (e.g. "Alice, Bob" or "Alice; Bob")
    expect(trigger).toHaveTextContent('Alice, Bob');
  });

  it('clicking a selected option toggles it off', async () => {
    const user = userEvent.setup();
    renderBasic({ multiple: true });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    const alice = screen.getByRole('option', { name: 'Alice' });

    await user.click(alice);
    expect(trigger).toHaveTextContent('Alice');

    await user.click(alice);
    expect(trigger).not.toHaveTextContent('Alice');
  });

  it('fires onValueChange with an array in multiple mode', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    renderBasic({ multiple: true, onValueChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));
    await user.click(screen.getByRole('option', { name: 'Bob' }));

    // last call should contain both
    expect(onValueChange).toHaveBeenLastCalledWith(expect.arrayContaining(['alice', 'bob']));
    // and should be an array (not string)
    expect(Array.isArray(onValueChange.mock.calls.at(-1)?.[0])).toBe(true);
  });

  it('native onChange reflects multiple selections on the hidden select', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderBasic({ multiple: true, onChange });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));
    await user.click(screen.getByRole('option', { name: 'Bob' }));

    // In <select multiple>, value is usually the first selected option.
    // Better assertion: check selectedOptions.
    const eventArg = onChange.mock.calls.at(-1)?.[0];
    const selectEl = (eventArg?.target ?? eventArg?.currentTarget) as HTMLSelectElement;

    const selectedValues = Array.from(selectEl.selectedOptions).map((o) => o.value);
    expect(selectedValues).toEqual(expect.arrayContaining(['alice', 'bob']));
  });
});