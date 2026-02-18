import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSearchable } from '../';

function renderWithCustomTrigger({
  multiple = false,
}: { multiple?: boolean } = {}) {
  return render(
    <SelectSearchable.Root multiple={multiple} onValueChange={() => {}}>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>

      <SelectSearchable.Trigger>
        {({ selectedValues, selectedLabels, isOpen, multiple }) => (
          <div>
            <div data-testid="open">{String(isOpen)}</div>
            <div data-testid="multiple">{String(multiple)}</div>
            <div data-testid="values">{selectedValues.join('|')}</div>
            <div data-testid="labels">{selectedLabels.join('|')}</div>
            <div>{selectedLabels.length ? selectedLabels.join(', ') : 'Choose…'}</div>
          </div>
        )}
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          <SelectSearchable.Option itemId='1' value="alice">Alice</SelectSearchable.Option>
          <SelectSearchable.Option itemId='2' value="bob">Bob</SelectSearchable.Option>
          <SelectSearchable.Option itemId='3' value="alex">Alex</SelectSearchable.Option>
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>,
  );
}

describe('SelectSearchable (custom rendered trigger)', () => {
  it('passes initial render args (closed, no selection, multiple=false)', () => {
    renderWithCustomTrigger({ multiple: false });

    expect(screen.getByRole('button', { name: 'Select Person' })).toBeInTheDocument();
    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.getByTestId('multiple')).toHaveTextContent('false');
    expect(screen.getByTestId('values')).toHaveTextContent('');
    expect(screen.getByTestId('labels')).toHaveTextContent('');
    expect(screen.getByText('Choose…')).toBeInTheDocument();
  });

  it('updates isOpen when opening/closing', async () => {
    const user = userEvent.setup();
    renderWithCustomTrigger();

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    expect(screen.getByTestId('open')).toHaveTextContent('false');

    await user.click(trigger);
    expect(screen.getByTestId('open')).toHaveTextContent('true');

    await user.click(trigger);
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('after selecting an option, selectedValues/selectedLabels update', async () => {
    const user = userEvent.setup();
    renderWithCustomTrigger({ multiple: false });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Alice' }));

    // single-select should close
    expect(screen.getByTestId('open')).toHaveTextContent('false');

    expect(screen.getByTestId('values')).toHaveTextContent('alice');
    expect(screen.getByTestId('labels')).toHaveTextContent('Alice');
    expect(trigger).toHaveTextContent('Alice');
  });

  it('in multiple=true, selectedValues/labels reflect toggling multiple selections', async () => {
    const user = userEvent.setup();
    renderWithCustomTrigger({ multiple: true });

    const trigger = screen.getByRole('button', { name: 'Select Person' });

    await user.click(trigger);

    // select Alice + Bob
    await user.click(screen.getByRole('option', { name: 'Alice' }));
    await user.click(screen.getByRole('option', { name: 'Bob' }));

    expect(screen.getByTestId('multiple')).toHaveTextContent('true');
    expect(screen.getByTestId('open')).toHaveTextContent('true'); // multi stays open in your impl (if that’s true)

    // order depends on your commit ordering; assert as a set-ish check
    const valuesText = screen.getByTestId('values').textContent ?? '';
    const labelsText = screen.getByTestId('labels').textContent ?? '';
    expect(valuesText.split('|').sort()).toEqual(['alice', 'bob'].sort());
    expect(labelsText.split('|').sort()).toEqual(['Alice', 'Bob'].sort());
  });
});