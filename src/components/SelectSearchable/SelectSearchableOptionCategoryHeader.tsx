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
> & {
  rowId: string;
};

export function SelectSearchableOptionCategoryHeader({
  rowId,
  children,
  ...userProps
}: SelectSearchableOptionCategoryHeaderProps) {
  const store = useSelectSearchableStoreContext();

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
