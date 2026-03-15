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
          <SelectSearchable.Option value="apple">
            Apple
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider data-testid="div-fruit-between" />
          <SelectSearchable.Option value="apricot">
            Apricot
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider data-testid="div-before-veg-header-direct" />

          <SelectSearchable.OptionCategoryHeader data-testid="hdr-veg">
            Vegetables
          </SelectSearchable.OptionCategoryHeader>
          <SelectSearchable.OptionDivider data-testid="div-after-veg-header" />
          <SelectSearchable.OptionDivider data-testid="div-stacked-1" />
          <SelectSearchable.OptionDivider data-testid="div-stacked-2" />
          <SelectSearchable.Option value="broccoli">
            Broccoli
          </SelectSearchable.Option>
          <SelectSearchable.Option value="beet">
            Beet
          </SelectSearchable.Option>
          <SelectSearchable.OptionDivider data-testid="div-veg-between" />
          <SelectSearchable.Option value="carrot">
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


  it('throws when duplicate option values are missing keys', () => {
    expect(() =>
      render(
        <SelectSearchable.Root onValueChange={() => {}}>
          <SelectSearchable.Trigger>
            <SelectSearchable.TriggerValue />
          </SelectSearchable.Trigger>
          <SelectSearchable.Dropdown>
            <SelectSearchable.OptionList>
              <SelectSearchable.Option value="apple">Apple A</SelectSearchable.Option>
              <SelectSearchable.Option value="apple">Apple B</SelectSearchable.Option>
            </SelectSearchable.OptionList>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>,
      ),
    ).toThrow(/duplicated for keyless options/i);
  });
});

