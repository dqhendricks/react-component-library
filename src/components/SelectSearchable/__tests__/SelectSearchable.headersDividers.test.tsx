import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSearchable } from '../';

function renderWithRows() {
  return render(
    <SelectSearchable.Root onValueChange={() => {}}>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>

      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue placeholder="Choose..." />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search..." />
        <SelectSearchable.OptionList>
          <SelectSearchable.OptionDivider rowId="div-leading" data-testid="div-leading" />

          <SelectSearchable.OptionCategoryHeader rowId="hdr-fruit" data-testid="hdr-fruit">
            Fruits
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.Option rowId="apple" value="apple">
            Apple
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider rowId="div-fruit-between" data-testid="div-fruit-between" />
          <SelectSearchable.Option rowId="apricot" value="apricot">
            Apricot
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider rowId="div-before-veg-header-direct" data-testid="div-before-veg-header-direct" />

          <SelectSearchable.OptionCategoryHeader rowId="hdr-veg" data-testid="hdr-veg">
            Vegetables
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.OptionDivider rowId="div-after-veg-header" data-testid="div-after-veg-header" />
          <SelectSearchable.OptionDivider rowId="div-stacked-1" data-testid="div-stacked-1" />
          <SelectSearchable.OptionDivider rowId="div-stacked-2" data-testid="div-stacked-2" />
          <SelectSearchable.Option rowId="broccoli" value="broccoli">
            Broccoli
          </SelectSearchable.Option>
          <SelectSearchable.Option rowId="beet" value="beet">
            Beet
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider rowId="div-veg-between" data-testid="div-veg-between" />
          <SelectSearchable.Option rowId="carrot" value="carrot">
            Carrot
          </SelectSearchable.Option>

          <SelectSearchable.OptionCategoryHeader rowId="hdr-empty" data-testid="hdr-empty">
            Empty
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.OptionDivider rowId="div-empty" data-testid="div-empty" />
          <SelectSearchable.OptionDivider rowId="div-trailing" data-testid="div-trailing" />
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>,
  );
}

async function openAndGetSearch() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Select Person' }));
  const search = screen.getByRole('combobox', { name: 'Select Person' });
  return { user, search };
}

describe('SelectSearchable (headers/dividers visibility)', () => {
  it('shows only valid headers and dividers when fully visible', async () => {
    renderWithRows();
    await openAndGetSearch();

    expect(screen.getByTestId('hdr-fruit')).toBeVisible();
    expect(screen.getByTestId('hdr-veg')).toBeVisible();
    expect(screen.getByTestId('hdr-empty')).not.toBeVisible();

    expect(screen.getByTestId('div-fruit-between')).toBeVisible();
    expect(screen.getByTestId('div-veg-between')).toBeVisible();

    expect(screen.getByTestId('div-leading')).not.toBeVisible();
    expect(screen.getByTestId('div-before-veg-header-direct')).toBeVisible();
    expect(screen.getByTestId('div-stacked-1')).not.toBeVisible();
    expect(screen.getByTestId('div-stacked-2')).not.toBeVisible();
    expect(screen.getByTestId('div-after-veg-header')).not.toBeVisible();
    expect(screen.getByTestId('div-empty')).not.toBeVisible();
    expect(screen.getByTestId('div-trailing')).not.toBeVisible();
  });

  it('hides or shows category headers based on section search matches', async () => {
    renderWithRows();
    const { user, search } = await openAndGetSearch();

    await user.type(search, 'bro');

    expect(screen.getByTestId('hdr-fruit')).not.toBeVisible();
    expect(screen.getByTestId('hdr-veg')).toBeVisible();
    expect(screen.getByTestId('hdr-empty')).not.toBeVisible();

    await user.clear(search);
    await user.type(search, 'ap');

    expect(screen.getByTestId('hdr-fruit')).toBeVisible();
    expect(screen.getByTestId('hdr-veg')).not.toBeVisible();
    expect(screen.getByTestId('div-before-veg-header-direct')).not.toBeVisible();
    expect(screen.getByTestId('hdr-empty')).not.toBeVisible();
  });

  it('normalizes divider visibility through filtering (stacked/header-adjacent/edges)', async () => {
    renderWithRows();
    const { user, search } = await openAndGetSearch();

    await user.type(search, 'ap');
    expect(screen.getByTestId('div-fruit-between')).toBeVisible();
    expect(screen.getByTestId('div-stacked-1')).not.toBeVisible();
    expect(screen.getByTestId('div-stacked-2')).not.toBeVisible();
    expect(screen.getByTestId('div-leading')).not.toBeVisible();
    expect(screen.getByTestId('div-trailing')).not.toBeVisible();

    await user.clear(search);
    await user.type(search, 'bro');
    expect(screen.getByTestId('div-fruit-between')).not.toBeVisible();
    expect(screen.getByTestId('div-before-veg-header-direct')).not.toBeVisible();
    expect(screen.getByTestId('div-veg-between')).not.toBeVisible();
    expect(screen.getByTestId('div-after-veg-header')).not.toBeVisible();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('throws when a header or divider is missing rowId', () => {
    expect(() =>
      render(
        <SelectSearchable.Root onValueChange={() => {}}>
          <SelectSearchable.Trigger>
            <SelectSearchable.TriggerValue />
          </SelectSearchable.Trigger>
          <SelectSearchable.Dropdown>
            <SelectSearchable.OptionList>
              {/* @ts-expect-error runtime validation */}
              <SelectSearchable.OptionCategoryHeader>Fruits</SelectSearchable.OptionCategoryHeader>
            </SelectSearchable.OptionList>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>,
      ),
    ).toThrow(/requires a unique rowId prop/i);
  });

  it('throws when rowIds are duplicated', () => {
    expect(() =>
      render(
        <SelectSearchable.Root onValueChange={() => {}}>
          <SelectSearchable.Trigger>
            <SelectSearchable.TriggerValue />
          </SelectSearchable.Trigger>
          <SelectSearchable.Dropdown>
            <SelectSearchable.OptionList>
              <SelectSearchable.Option rowId="duplicate" value="apple">Apple</SelectSearchable.Option>
              <SelectSearchable.OptionDivider rowId="duplicate" />
            </SelectSearchable.OptionList>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>,
      ),
    ).toThrow(/duplicated within the same OptionList/i);
  });
});

