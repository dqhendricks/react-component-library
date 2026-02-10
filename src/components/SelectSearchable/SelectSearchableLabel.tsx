import * as React from 'react';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';

export type SelectSearchableLabelProps = Omit<
  React.ComponentPropsWithoutRef<'label'>,
  'id' | 'htmlFor'
>;

export function SelectSearchableLabel({
  children,
  ...rest
}: SelectSearchableLabelProps) {
  const store = useSelectSearchableStoreContext();

  const triggerId = useSelectSearchableStore(store, (s) => s.triggerId);
  const labelId = useSelectSearchableStore(store, (s) => s.labelId);

  return (
    <label
      {...rest}
      id={labelId}
      htmlFor={triggerId}
      // Consumer styling hook
      data-part="label"
    >
      {children}
    </label>
  );
}