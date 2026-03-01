import React from 'react';
import styles from './SelectSearchable.module.css';
import { mergeProps } from '../utils/mergeProps';

type LiProps = React.ComponentPropsWithoutRef<'li'>;

export type SelectSearchableOptionCategoryHeaderProps = Omit<
  LiProps,
  'role' | 'aria-hidden' | 'hidden'
> & {
  rowId: string;
};

export function SelectSearchableOptionCategoryHeader({
  rowId: _rowId,
  children,
  ...userProps
}: SelectSearchableOptionCategoryHeaderProps) {
  const ourProps: LiProps = {
    role: 'presentation',
    className: styles.optionCategoryHeader,
  };

  const merged = mergeProps(userProps, ourProps);

  return (
    <li
      {...merged}
      data-part="option-category-header"
    >
      {children}
    </li>
  );
}
