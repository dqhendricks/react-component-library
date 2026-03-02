import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSearchable } from '../';

function renderWithDuplicateValues({
  multiple = false,
  value,
}: {
  multiple?: boolean;
  value?: string | string[];
} = {}) {
  return render(
    <SelectSearchable.Root multiple={multiple} value={value} onValueChange={() => {}}>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>

      <SelectSearchable.Trigger>
        {({ selectedValues, selectedLabels }) => (
          <div>
            <div data-testid="values">{selectedValues.join('|')}</div>
            <div data-testid="labels">{selectedLabels.join('|')}</div>
            <div>{selectedLabels.length ? selectedLabels.join(', ') : 'Choose…'}</div>
          </div>
        )}
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          <SelectSearchable.Option rowId="first-alice" value="alice">Alice First</SelectSearchable.Option>
          <SelectSearchable.Option rowId="bob" value="bob">Bob</SelectSearchable.Option>
          <SelectSearchable.Option rowId="second-alice" value="alice">Alice Second</SelectSearchable.Option>
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>,
  );
}

describe('SelectSearchable (duplicate values)', () => {
  it('in single mode, only the first option with a duplicate value is selected', async () => {
    const user = userEvent.setup();
    renderWithDuplicateValues({ value: 'alice' });

    await user.click(screen.getByRole('button', { name: 'Select Person' }));

    expect(screen.getByRole('option', { name: 'Alice First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Alice Second' })).toHaveAttribute('aria-selected', 'false');
  });

  it('in single mode, trigger render args use the first option label for a duplicate value', () => {
    renderWithDuplicateValues({ value: 'alice' });

    expect(screen.getByTestId('values')).toHaveTextContent('alice');
    expect(screen.getByTestId('labels')).toHaveTextContent('Alice First');
    expect(screen.getByRole('button', { name: 'Select Person' })).toHaveTextContent('Alice First');
  });

  it('in multiple mode, all options with the duplicate value are selected', async () => {
    const user = userEvent.setup();
    renderWithDuplicateValues({ multiple: true, value: ['alice'] });

    await user.click(screen.getByRole('button', { name: 'Select Person' }));

    expect(screen.getByRole('option', { name: 'Alice First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Alice Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Bob' })).toHaveAttribute('aria-selected', 'false');
  });

  it('in multiple mode, trigger render args keep a single value/label entry for duplicate values', () => {
    renderWithDuplicateValues({ multiple: true, value: ['alice'] });

    expect(screen.getByTestId('values')).toHaveTextContent('alice');
    expect(screen.getByTestId('labels')).toHaveTextContent('Alice First');
  });
});
