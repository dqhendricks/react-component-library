import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderBasic } from './harness';

describe('SelectSearchable (search)', () => {
  it('typing filters visible options (filtered ones become hidden)', async () => {
    const user = userEvent.setup();
    renderBasic();

    await user.click(screen.getByRole('button', { name: 'Select Person' }));

    // Grab Bob while it's still accessible
    const bob = screen.getByRole('option', { name: 'Bob' });
    expect(bob).toBeVisible();

    const search = screen.getByRole('combobox', { name: 'Select Person' });
    await user.type(search, 'al');

    // Visible (accessible)
    expect(screen.getByRole('option', { name: 'Alice' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Alex' })).toBeVisible();

    // Bob is now filtered out: should be hidden/inaccessible
    expect(bob).not.toBeVisible();
    expect(bob).toHaveAttribute('aria-hidden', 'true');
    expect(bob).toHaveAttribute('hidden');
  });

  it('clearing the search shows all options again', async () => {
    const user = userEvent.setup();
    renderBasic();

    await user.click(screen.getByRole('button', { name: 'Select Person' }));

    const search = screen.getByRole('combobox', { name: 'Select Person' });

    await user.type(search, 'al');
    expect(screen.queryByRole('option', { name: 'Bob' })).not.toBeInTheDocument();

    await user.clear(search);

    expect(screen.getByRole('option', { name: 'Alice' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Bob' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Alex' })).toBeVisible();
  });

  it('search is case-insensitive', async () => {
    const user = userEvent.setup();
    renderBasic();

    await user.click(screen.getByRole('button', { name: 'Select Person' }));

    const search = screen.getByRole('combobox', { name: 'Select Person' });
    await user.type(search, 'AL');

    expect(screen.getByRole('option', { name: 'Alice' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Alex' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Bob' })).not.toBeInTheDocument();
  });

  it('searching to a single match allows selecting it', async () => {
    const user = userEvent.setup();
    renderBasic();

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);

    const search = screen.getByRole('combobox', { name: 'Select Person' });
    await user.type(search, 'bob');

    expect(screen.queryByRole('option', { name: 'Alice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alex' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Bob' }));

    expect(trigger).toHaveTextContent('Bob');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});