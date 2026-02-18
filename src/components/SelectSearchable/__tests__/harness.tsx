import React from 'react';
import { render } from '@testing-library/react';
import { SelectSearchable } from '../';

type RootProps = Partial<React.ComponentProps<typeof SelectSearchable.Root>>;

export function renderBasic(rootProps: RootProps = {}) {
  return render(
    <SelectSearchable.Root onValueChange={() => {}} {...rootProps}>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>

      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue placeholder="Choose…" />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          <SelectSearchable.Option itemId='1' value="alice">Alice</SelectSearchable.Option>
          <SelectSearchable.Option itemId='2' value="bob">Bob</SelectSearchable.Option>
          <SelectSearchable.Option itemId='3' value="alex">Alex</SelectSearchable.Option>
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>

      <SelectSearchable.Error hideWhenValid>Error</SelectSearchable.Error>
    </SelectSearchable.Root>
  );
}