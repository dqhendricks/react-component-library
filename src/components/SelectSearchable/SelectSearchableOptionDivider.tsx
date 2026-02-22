import React from 'react';
import styles from './SelectSearchable.module.css';
import { mergeProps } from '../utils/mergeProps';

type LiProps = React.ComponentPropsWithoutRef<'li'>;

export type SelectSearchableOptionDividerProps = Omit<
  LiProps,
  'role' | 'aria-hidden' | 'hidden'
>;

export function SelectSearchableOptionDivider(props: SelectSearchableOptionDividerProps) {
  const ourProps: LiProps = {
    role: 'separator',
    'aria-orientation': 'horizontal',
    className: styles.optionDivider,
  };

  const merged = mergeProps(props, ourProps);

  return (
    <li
      {...merged}
      data-part="option-divider"
    />
  );
}
