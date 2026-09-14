import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SelectSearchable } from '..';
import { useSelectSearchableStoreContext, type SelectSearchableStore } from '../SelectSearchableStoreContext';

describe('SelectSearchable (collection updates)', () => {
  it.each(['removed', 'disabled'] as const)('preserves active state across equivalent JSX, then clears a %s option', async (change) => {
    const user = userEvent.setup();
    let store: SelectSearchableStore;
    function CaptureStore() {
      store = useSelectSearchableStoreContext();
      return null;
    }
    function Example({ changed = false, showList = true }) {
      return (
        <StrictMode>
          <SelectSearchable.Root>
            <CaptureStore />
            <SelectSearchable.Trigger>Choose person</SelectSearchable.Trigger>
            <SelectSearchable.Dropdown>
              <SelectSearchable.Search aria-label="Search people" />
              {showList && <SelectSearchable.OptionList>
                {['alice', 'bob']
                  .filter(value => !(value === 'bob' && changed && change === 'removed'))
                  .map(value => (
                    <SelectSearchable.Option key={value} value={value} disabled={value === 'bob' && changed}>
                      {value === 'alice' ? 'Alice' : 'Bob'}
                    </SelectSearchable.Option>
                  ))}
              </SelectSearchable.OptionList>}
            </SelectSearchable.Dropdown>
          </SelectSearchable.Root>
        </StrictMode>
      );
    }
    const { rerender } = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Choose person' }));
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const bob = screen.getByRole('option', { name: 'Bob' });
    expect(bob).toHaveAttribute('data-active', 'true');

    rerender(<Example />);
    expect(bob).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', bob.id);

    rerender(<Example changed />);
    expect(store!.getSnapshot().activeDescendantId).toBeNull();

    await user.keyboard('{ArrowDown}');
    expect(store!.getSnapshot().activeDescendantId).not.toBeNull();
    rerender(<Example changed showList={false} />);
    expect(store!.getSnapshot().activeDescendantId).toBeNull();
    expect(store!.getSnapshot().options.size).toBe(0);
  });
});
