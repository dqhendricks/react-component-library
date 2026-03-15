import React from 'react';
import styles from './SelectSearchable.module.css';
import { mergeProps } from '../utils/mergeProps';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';

type LiProps = React.ComponentPropsWithoutRef<'li'>;

export type SelectSearchableOptionCategoryHeaderProps = Omit<
  LiProps,
  'role' | 'aria-hidden' | 'hidden'
>;

export type SelectSearchableOptionCategoryHeaderInternalProps = {
  __internalRowId?: string;
};

export function SelectSearchableOptionCategoryHeader({
  __internalRowId,
  children,
  ...userProps
}: SelectSearchableOptionCategoryHeaderProps & SelectSearchableOptionCategoryHeaderInternalProps) {
  const store = useSelectSearchableStoreContext();

  if (!__internalRowId) {
    throw new Error(
      'SelectSearchable.OptionCategoryHeader must be rendered within SelectSearchable.OptionList.',
    );
  }

  const rowId = __internalRowId;

  const hidden = useSelectSearchableStore(store, (s) => {
    const meta = s.headersByRowId.get(rowId);
    if (!meta) return true;
    return !meta.optionIds.some((optionId) => s.visibleIds.has(optionId));
  });

  const ourProps: LiProps = {
    role: 'presentation',
    hidden,
    'aria-hidden': hidden || undefined,
    className: styles.optionCategoryHeader,
  };

  const merged = mergeProps(userProps, ourProps);

  return (
    <li
      {...merged}
      data-part="option-category-header"
      data-hidden={hidden || undefined}
    >
      {children}
    </li>
  );
}
