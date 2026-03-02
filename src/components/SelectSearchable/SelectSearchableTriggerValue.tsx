import React from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStore,
  useSelectSearchableStoreContext,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';

export type SelectSearchableTriggerValueProps = Omit<
  React.ComponentPropsWithoutRef<'span'>,
  'children'
> & {
  placeholder?: string;
};

export function SelectSearchableTriggerValue({
  placeholder = 'Select…',
  ...rest
}: SelectSearchableTriggerValueProps) {
  const store = useSelectSearchableStoreContext();

  const value = useSelectSearchableStore(store, (s) => s.value);
  const selectedLabels = useSelectSearchableStore(store, (s) => s.selectedLabels);

  const display = Array.isArray(value)
    ? value.length === 0
      ? placeholder
      : selectedLabels.length
        ? selectedLabels.join(', ')
        : ''
    : value == null || value === ''
      ? placeholder
      : selectedLabels[0] ?? '';

  const ourProps: React.ComponentPropsWithoutRef<'span'> = {
    className: styles.triggerValue,
  };

  const merged = mergeProps(rest, ourProps);

  return (
    <span
      {...merged}
      // Consumer styling hooks
      data-part='value'
    >
      {display}
    </span>
  );;
}
