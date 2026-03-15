import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderBasic } from './harness';
import { SelectSearchable } from '..';

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

  it('supports trigger-only typeahead prefix navigation and opens the list', async () => {
    const user = userEvent.setup();

    render(
      <SelectSearchable.Root onValueChange={() => {}}>
        <SelectSearchable.Label>Select Food</SelectSearchable.Label>
        <SelectSearchable.Trigger>
          <SelectSearchable.TriggerValue placeholder="Choose..." />
        </SelectSearchable.Trigger>
        <SelectSearchable.Dropdown>
          <SelectSearchable.OptionList>
            <SelectSearchable.Option value="apple">Apple</SelectSearchable.Option>
            <SelectSearchable.Option value="apricot">Apricot</SelectSearchable.Option>
            <SelectSearchable.Option value="banana">Banana</SelectSearchable.Option>
            <SelectSearchable.Option value="broccoli">Broccoli</SelectSearchable.Option>
          </SelectSearchable.OptionList>
        </SelectSearchable.Dropdown>
      </SelectSearchable.Root>,
    );

    const trigger = screen.getByRole('combobox', { name: 'Select Food' });

    trigger.focus();
    await user.keyboard('b');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-activedescendant');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('r');
    expect(screen.getByRole('option', { name: 'Broccoli' })).toHaveAttribute('data-active', 'true');
  });

  it('does not use trigger typeahead when a search input is present', async () => {
    const user = userEvent.setup();

    render(
      <SelectSearchable.Root onValueChange={() => {}}>
        <SelectSearchable.Label>Select Food</SelectSearchable.Label>
        <SelectSearchable.Trigger>
          <SelectSearchable.TriggerValue placeholder="Choose..." />
        </SelectSearchable.Trigger>
        <SelectSearchable.Dropdown>
          <SelectSearchable.Search placeholder="Search..." />
          <SelectSearchable.OptionList>
            <SelectSearchable.Option value="apple">Apple</SelectSearchable.Option>
            <SelectSearchable.Option value="banana">Banana</SelectSearchable.Option>
          </SelectSearchable.OptionList>
        </SelectSearchable.Dropdown>
      </SelectSearchable.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Select Food' });

    await user.click(trigger);
    const search = screen.getByRole('combobox', { name: 'Select Food' });
    await user.keyboard('b');

    expect(search).toHaveValue('b');
    expect(screen.getByRole('option', { name: 'Banana' })).not.toHaveAttribute('data-active', 'true');
  });
});
