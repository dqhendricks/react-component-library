import React from 'react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSearchable as S } from '../';

function Example({ children, multiple = false, value, onValueChange = () => {} }: {
  children: React.ComponentProps<typeof S.OptionList>['children'];
  multiple?: boolean;
  value?: string | string[];
  onValueChange?: React.ComponentProps<typeof S.Root>['onValueChange'];
}) {
  return (
    <form data-testid="form">
      <S.Root name="person" multiple={multiple} value={value} onValueChange={onValueChange}>
        <S.Label>Person</S.Label>
        <S.Trigger><S.TriggerValue placeholder="Choose" /></S.Trigger>
        <S.Dropdown><S.Search /><S.OptionList>{children}</S.OptionList></S.Dropdown>
      </S.Root>
    </form>
  );
}

function duplicateOptions() {
  return [
    <S.Option key="first" value="alice">Alice First</S.Option>,
    <S.Option key="second" value="alice">Alice Second</S.Option>,
    <S.Option key="bob" value="bob">Bob</S.Option>,
  ];
}

async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Person' }));
  return user;
}

describe('SelectSearchable duplicate values: first wins', () => {
  beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

  it.each([false, true])('keeps only the first row and label in multiple=%s', async (multiple) => {
    render(<Example multiple={multiple} value={multiple ? ['alice'] : 'alice'}>{duplicateOptions()}</Example>);
    await open();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'Alice First' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Alice Second')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Person' })).toHaveTextContent('Alice First');
    expect(new FormData(screen.getByTestId('form') as HTMLFormElement).getAll('person')).toEqual(['alice']);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('duplicate option value "alice"'));
  });

  it('accepts keyless duplicates without throwing', async () => {
    render(<Example>
      <S.Option value="alice">Alice First</S.Option>
      <S.Option value="alice">Alice Second</S.Option>
    </Example>);
    await open();
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.queryByText('Alice Second')).not.toBeInTheDocument();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('excludes ignored labels from search and rows from keyboard navigation', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange}>{duplicateOptions()}</Example>);
    const user = await open();
    const search = screen.getByRole('combobox');
    await user.type(search, 'Second');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    await user.clear(search);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('bob');
  });

  it('toggles the retained multiple-selection option independently', async () => {
    const onValueChange = vi.fn();
    render(<Example multiple onValueChange={onValueChange}>{duplicateOptions()}</Example>);
    const user = await open();
    await user.click(screen.getByRole('option', { name: 'Alice First' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['alice']);
    await user.click(screen.getByRole('option', { name: 'Bob' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['alice', 'bob']);
    await user.click(screen.getByRole('option', { name: 'Alice First' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['bob']);
  });

  it('warns once per value across StrictMode, rerenders, and repeated duplicates', async () => {
    const view = () => <React.StrictMode><Example>{[
      ...duplicateOptions(),
      <S.Option key="third" value="alice">Alice Third</S.Option>,
      <S.Option key="bob-copy" value="bob">Bob Copy</S.Option>,
    ]}</Example></React.StrictMode>;
    const { rerender } = render(view());
    await open();
    rerender(view());
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('keeps first-wins behavior without production warnings', async () => {
    vi.stubEnv('DEV', false);
    render(<Example>{duplicateOptions()}</Example>);
    await open();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('uses the first option in the current order after data changes', async () => {
    const items = duplicateOptions();
    const { rerender } = render(<Example value="alice">{items}</Example>);
    await open();
    const originalId = screen.getByRole('option', { name: 'Alice First' }).id;
    rerender(<Example value="alice">{[items[1], items[0], items[2]]}</Example>);
    expect(screen.getByRole('button', { name: 'Person' })).toHaveTextContent('Alice Second');
    expect(screen.queryByText('Alice First')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Alice Second' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Alice Second' })).toHaveAttribute('id', originalId);
  });

  it('does not promote an enabled duplicate over a disabled first option', async () => {
    render(<Example value="alice">
      <S.Option value="alice" disabled>Alice Disabled</S.Option>
      <S.Option value="alice">Alice Enabled</S.Option>
    </Example>);
    await open();
    expect(screen.getByRole('button', { name: 'Person' })).toHaveTextContent('Alice Disabled');
    expect(screen.queryByText('Alice Enabled')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('keeps the DOM ID when a React key changes, but changes it when the value changes', async () => {
    const view = (key: string, value: string) => <Example>
      <S.Option key={key} value={value}>Person A</S.Option>
    </Example>;
    const { rerender } = render(view('first-key', 'a / "東京"'));
    const user = await open();
    const originalId = screen.getByRole('option').id;
    expect(originalId).not.toMatch(/\s/);
    rerender(view('new-key', 'a / "東京"'));
    expect(screen.getByRole('option')).toHaveAttribute('id', originalId);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', originalId);
    expect(document.getElementById(originalId)).toBe(screen.getByRole('option'));

    rerender(view('new-key', 'different value'));
    expect(screen.getByRole('option').id).not.toBe(originalId);
  });

  it('gives identical values in different selects distinct active-descendant targets', async () => {
    render(<>
      <Example><S.Option value="alice">Alice</S.Option></Example>
      <Example><S.Option value="alice">Alice</S.Option></Example>
    </>);
    const user = userEvent.setup();
    const triggers = screen.getAllByRole('button', { name: 'Person' });
    await user.click(triggers[0]);
    await user.keyboard('{ArrowDown}');
    const firstOption = screen.getByRole('option');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', firstOption.id);

    await user.click(triggers[1]);
    await user.keyboard('{ArrowDown}');
    const secondOption = screen.getByRole('option');
    expect(secondOption.id).not.toBe(firstOption.id);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-activedescendant', secondOption.id);
    expect(document.getElementById(firstOption.id)).toBe(firstOption);
    expect(document.getElementById(secondOption.id)).toBe(secondOption);
  });

  it('hides a section and separator when all its options are duplicates', async () => {
    render(<Example>
      <S.OptionCategoryHeader>Original</S.OptionCategoryHeader>
      <S.Option value="alice">Alice First</S.Option>
      <S.OptionDivider data-testid="separator" />
      <S.OptionCategoryHeader data-testid="duplicate-group">Repeated</S.OptionCategoryHeader>
      <S.Option value="alice">Alice Second</S.Option>
    </Example>);
    await open();
    expect(screen.getByTestId('duplicate-group')).not.toBeVisible();
    expect(screen.getByTestId('separator')).not.toBeVisible();
  });

  it('allows identical labels with distinct values without warnings', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange}>
      <S.Option value="one">Alex</S.Option>
      <S.Option value="two">Alex</S.Option>
    </Example>);
    const user = await open();
    await user.click(screen.getAllByRole('option', { name: 'Alex' })[1]);
    expect(onValueChange).toHaveBeenLastCalledWith('two');
    expect(console.warn).not.toHaveBeenCalled();
  });
});
