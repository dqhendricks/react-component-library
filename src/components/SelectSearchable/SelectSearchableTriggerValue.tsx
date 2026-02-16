import React, { useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
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

  const display = useMemo(() => {
    if (Array.isArray(value)) {
      if (value.length === 0) return placeholder;

      const labels = value
        .map(v => store.getOptionByValue(String(v))?.label)
        .filter(Boolean) as string[];

      return labels.length ? labels.join(', ') : '';
    }

    if (value == null || value === '') return placeholder;

    return store.getOptionByValue(String(value))?.label ?? '';
  }, [value, placeholder, store]);

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