import React from 'react';
import styles from './SelectSearchable.module.css';
import { mergeProps } from '../utils/mergeProps';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from './SelectSearchableStoreContext';

type LiProps = React.ComponentPropsWithoutRef<'li'>;

export type SelectSearchableOptionDividerProps = Omit<
  LiProps,
  'role' | 'aria-hidden' | 'hidden'
> & {
  rowId: string;
};

export function SelectSearchableOptionDivider({
  rowId,
  ...props
}: SelectSearchableOptionDividerProps) {
  const store = useSelectSearchableStoreContext();

  const hidden = useSelectSearchableStore(store, (s) => {
    const meta = s.dividersByRowId.get(rowId);
    if (!meta) return true;

    const beforeVisible = meta.beforeOptionIds.some((optionId) => s.visibleIds.has(optionId));

    if (meta.nextHeaderRowId) {
      const nextHeader = s.headersByRowId.get(meta.nextHeaderRowId);
      const nextHeaderVisible = nextHeader
        ? nextHeader.optionIds.some((optionId) => s.visibleIds.has(optionId))
        : false;
      return !(beforeVisible && nextHeaderVisible);
    }

    const afterVisible = meta.afterOptionIds.some((optionId) => s.visibleIds.has(optionId));
    return !(beforeVisible && afterVisible);
  });

  const ourProps: LiProps = {
    role: 'separator',
    'aria-orientation': 'horizontal',
    hidden,
    'aria-hidden': hidden || undefined,
    className: styles.optionDivider,
  };

  const merged = mergeProps(props, ourProps);

  return (
    <li
      {...merged}
      data-part="option-divider"
      data-hidden={hidden || undefined}
    />
  );
}
