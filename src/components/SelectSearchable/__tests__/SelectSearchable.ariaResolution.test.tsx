import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSearchable as S } from '..';

type FixtureProps = {
  root?: React.ComponentProps<typeof S.Root>;
  trigger?: Omit<React.ComponentProps<typeof S.Trigger>, 'children'>;
  search?: React.ComponentProps<typeof S.Search>;
  showError?: boolean;
  customTrigger?: boolean;
  searchable?: boolean;
};
function Fixture({ root, trigger, search, showError = true, customTrigger = false, searchable = true }: FixtureProps) {
  return <>
    <p id="external-name">External field</p>
    <p id="local-name">Local search</p>
    <p id="help">Shared instructions</p>
    <p id="local-help">Search instructions</p>
    <p id="external-error">External error</p>
    <S.Root id="person" {...root}>
      <S.Label>Assignee</S.Label>
      <S.Trigger {...trigger}>
        {customTrigger
          ? ({ selectedLabels }) => <><span>{selectedLabels.join(', ') || 'Choose'}</span><span aria-hidden="true">Arrow</span></>
          : <S.TriggerValue placeholder="Choose" />}
      </S.Trigger>
      <S.Dropdown>
        {searchable && <S.Search {...search} />}
        <S.OptionList>
          <S.Option value="alice">Alice</S.Option>
          <S.Option value="bob">Bob</S.Option>
        </S.OptionList>
      </S.Dropdown>
      {showError && <S.Error hideWhenValid>Choose a person</S.Error>}
    </S.Root>
  </>;
}
async function open() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button'));
  return user;
}

describe('SelectSearchable accessibility resolution', () => {
  it('gives the trigger its field name and changing visible value, and Search its own translated name', async () => {
    render(<Fixture search={{ 'aria-label': 'Personen suchen' }} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAccessibleName('Assignee Choose');
    const user = await open();
    const search = screen.getByRole('combobox');
    expect(search).toHaveAccessibleName('Personen suchen');
    expect(search).not.toHaveAttribute('aria-labelledby');
    await user.click(screen.getByRole('option', { name: 'Alice' }));
    expect(trigger).toHaveAccessibleName('Assignee Alice');
  });

  it.each([
    [{ 'aria-label': 'Go to to school' }, 'Go to to school'],
    [{ 'aria-label': 'Ignored', 'aria-labelledby': 'external-name' }, 'External field'],
  ])('uses Root naming ahead of Label without changing scalar text: %j', async (root, name) => {
    render(<Fixture root={root} />);
    expect(screen.getByRole('button')).toHaveAccessibleName(`${name} Choose`);
    await open();
    expect(screen.getByRole('combobox')).toHaveAccessibleName(name);
  });

  it('selects a complete local naming source over Root, with labelledby preferred within that source', async () => {
    render(<Fixture root={{ 'aria-labelledby': 'external-name' }}
      trigger={{ 'aria-label': 'Choose an assignee' }}
      search={{ 'aria-label': 'Ignored', 'aria-labelledby': 'local-name' }} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAccessibleName('Choose an assignee');
    expect(trigger).not.toHaveAttribute('aria-labelledby');
    await open();
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Local search');
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-label');
  });

  it('uses local descriptions instead of shared descriptions and appends the visible error', async () => {
    render(<Fixture root={{ 'aria-invalid': true, 'aria-describedby': 'help', 'aria-description': 'Go to to school' }}
      search={{ 'aria-describedby': 'local-help', 'aria-description': 'Search for for people' }} />);
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Shared instructions Choose a person');
    expect(screen.getByRole('button')).toHaveAttribute('aria-description', 'Go to to school');
    await open();
    const search = screen.getByRole('combobox');
    expect(search).toHaveAccessibleDescription('Search instructions Choose a person');
    expect(search).toHaveAttribute('aria-describedby', 'local-help person--error');
    expect(search).toHaveAttribute('aria-description', 'Search for for people');
    expect(search).toHaveAttribute('aria-invalid', 'true');
    expect(search).toHaveAttribute('data-invalid', 'true');
  });

  it('honors errormessage directly without describing the same error twice', async () => {
    render(<Fixture root={{ 'aria-invalid': true, 'aria-errormessage': 'person--error', 'aria-describedby': 'help person--error' }}
      search={{ 'aria-errormessage': 'external-error' }} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-errormessage', 'person--error');
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'help');
    await open();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-errormessage', 'external-error');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-describedby', 'help person--error');
  });

  it('preserves supplied ID lists, including whitespace and repeated IDs', async () => {
    const nameIds = ' local-name\tlocal-name ';
    const descriptionIds = ' local-help\nlocal-help ';
    const errorIds = ' external-error\texternal-error ';
    render(<Fixture showError={false} root={{ 'aria-invalid': true }} search={{
      'aria-labelledby': nameIds,
      'aria-describedby': descriptionIds,
      'aria-errormessage': errorIds,
    }} />);
    await open();
    const search = screen.getByRole('combobox');
    expect(search.getAttribute('aria-labelledby')).toBe(nameIds);
    expect(search.getAttribute('aria-describedby')).toBe(descriptionIds);
    expect(search.getAttribute('aria-errormessage')).toBe(errorIds);
  });

  it('does not append an existing internal error ID or remove unrelated duplicate IDs', () => {
    const descriptionIds = 'help\thelp\nperson--error';
    const { rerender } = render(<Fixture root={{ 'aria-invalid': true, 'aria-describedby': descriptionIds }} />);
    expect(screen.getByRole('button').getAttribute('aria-describedby')).toBe(descriptionIds);
    rerender(<Fixture root={{
      'aria-invalid': true,
      'aria-describedby': descriptionIds,
      'aria-errormessage': 'external-error\tperson--error',
    }} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'help help');
  });

  it('updates error references when validity or error rendering changes', () => {
    const { rerender } = render(<Fixture root={{ 'aria-invalid': false }} />);
    expect(document.getElementById('person--error')).toBeNull();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
    rerender(<Fixture root={{ 'aria-invalid': true }} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'person--error');
    expect(document.getElementById('person--error')).not.toBeNull();
    rerender(<Fixture root={{ 'aria-invalid': true }} showError={false} />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
    rerender(<Fixture root={{ 'aria-invalid': 'false', 'aria-errormessage': 'external-error' }} />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-errormessage');
  });

  it('includes custom trigger content and multiple selections without decorative content', () => {
    render(<Fixture root={{ multiple: true, value: ['alice', 'bob'] }} customTrigger />);
    expect(screen.getByRole('button')).toHaveAccessibleName('Assignee Alice, Bob');
  });

  it('retains select-only naming and ensures controls references resolve to the listbox', async () => {
    const { rerender } = render(<Fixture searchable={false} root={{ 'aria-invalid': true }} />);
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Assignee');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    rerender(<Fixture />);
    await open();
    const listbox = screen.getByRole('listbox');
    for (const control of [screen.getByRole('button'), screen.getByRole('combobox')]) {
      expect(document.getElementById(control.getAttribute('aria-controls')!)).toBe(listbox);
    }
  });
});
