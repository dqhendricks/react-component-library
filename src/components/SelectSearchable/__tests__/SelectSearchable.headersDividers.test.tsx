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
          <SelectSearchable.OptionDivider data-testid="div-leading" />

          <SelectSearchable.OptionCategoryHeader data-testid="hdr-fruit">
            Fruits
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.Option itemId="apple" value="apple">
            Apple
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider data-testid="div-fruit-between" />
          <SelectSearchable.Option itemId="apricot" value="apricot">
            Apricot
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider data-testid="div-before-veg-header-direct" />

          <SelectSearchable.OptionCategoryHeader data-testid="hdr-veg">
            Vegetables
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.OptionDivider data-testid="div-after-veg-header" />
          <SelectSearchable.OptionDivider data-testid="div-stacked-1" />
          <SelectSearchable.OptionDivider data-testid="div-stacked-2" />
          <SelectSearchable.Option itemId="broccoli" value="broccoli">
            Broccoli
          </SelectSearchable.Option>
          <SelectSearchable.Option itemId="beet" value="beet">
            Beet
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider data-testid="div-veg-between" />
          <SelectSearchable.Option itemId="carrot" value="carrot">
            Carrot
          </SelectSearchable.Option>

          <SelectSearchable.OptionCategoryHeader data-testid="hdr-empty">
            Empty
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.OptionDivider data-testid="div-empty" />
          <SelectSearchable.OptionDivider data-testid="div-trailing" />
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

    expect(screen.getByTestId('hdr-fruit')).toBeInTheDocument();
    expect(screen.getByTestId('hdr-veg')).toBeInTheDocument();
    expect(screen.queryByTestId('hdr-empty')).not.toBeInTheDocument();

    expect(screen.getByTestId('div-fruit-between')).toBeInTheDocument();
    expect(screen.getByTestId('div-veg-between')).toBeInTheDocument();

    expect(screen.queryByTestId('div-leading')).not.toBeInTheDocument();
    expect(screen.getByTestId('div-before-veg-header-direct')).toBeInTheDocument();
    expect(screen.queryByTestId('div-stacked-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-stacked-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-after-veg-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-empty')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-trailing')).not.toBeInTheDocument();
  });

  it('hides or shows category headers based on section search matches', async () => {
    renderWithRows();
    const { user, search } = await openAndGetSearch();

    await user.type(search, 'bro');

    expect(screen.queryByTestId('hdr-fruit')).not.toBeInTheDocument();
    expect(screen.getByTestId('hdr-veg')).toBeInTheDocument();
    expect(screen.queryByTestId('hdr-empty')).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'ap');

    expect(screen.getByTestId('hdr-fruit')).toBeInTheDocument();
    expect(screen.queryByTestId('hdr-veg')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-before-veg-header-direct')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hdr-empty')).not.toBeInTheDocument();
  });

  it('normalizes divider visibility through filtering (stacked/header-adjacent/edges)', async () => {
    renderWithRows();
    const { user, search } = await openAndGetSearch();

    await user.type(search, 'ap');
    expect(screen.getByTestId('div-fruit-between')).toBeInTheDocument();
    expect(screen.queryByTestId('div-stacked-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-stacked-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-leading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-trailing')).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'bro');
    expect(screen.queryByTestId('div-fruit-between')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-before-veg-header-direct')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-veg-between')).not.toBeInTheDocument();
    expect(screen.queryByTestId('div-after-veg-header')).not.toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});
