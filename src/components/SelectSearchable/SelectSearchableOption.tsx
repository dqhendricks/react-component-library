import React, { useCallback, useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableValue,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';
import { makeDomOptionId } from '../utils/makeDomOptionId';

type LiProps = React.ComponentPropsWithoutRef<'li'>;

export type SelectSearchableOptionProps = React.PropsWithChildren<
  Omit<
    LiProps,
    | 'id'
    | 'role'
    | 'aria-selected'
    | 'aria-disabled'
    | 'aria-hidden'
    | 'hidden'
    | 'ref'
  > & {
    rowId: string; // used to uniquely identify this row within the SelectSearchable context
    value: string;
    disabled?: boolean;
  }
>;

function asArray(v: SelectSearchableValue | undefined): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

/**
 * Renders a selectable list item.
 * OptionList owns registration/order; each Option owns its own DOM rendering.
 */
export const SelectSearchableOption = React.memo(function SelectSearchableOption({
  rowId,
  value,
  disabled,
  children,
  ...liProps
}: SelectSearchableOptionProps) {
  const store = useSelectSearchableStoreContext();

  const listboxId = useSelectSearchableStore(store, (s) => s.listboxId) ?? 'cs-listbox';
  const domId = useMemo(() => makeDomOptionId(listboxId, rowId), [listboxId, rowId]);

  // Subscribe to this option's own derived flags only.
  const isSelected = useSelectSearchableStore(store, (s) => s.selectedValueSet.has(value));
  const isActive = useSelectSearchableStore(store, (s) => s.activeDescendantId === domId);
  const hidden = useSelectSearchableStore(store, (s) => !s.visibleIds.has(domId));

  const setActive = useCallback(() => {
    if (disabled) return;
    store.setActiveDescendantId(domId);
  }, [store, domId, disabled]);

  const commit = useCallback(() => {
    if (disabled) return;

    const s = store.getSnapshot();

    if (!s.multiple) {
      store.commitValue(value);
      return;
    }

    const current = asArray(s.value);
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);

    store.commitValue(Array.from(set));
  }, [store, disabled, value]);

  const ourLiProps: LiProps = {
    id: domId,
    role: 'option',
    'aria-selected': isSelected,
    'aria-disabled': disabled || undefined,
    hidden,
    'aria-hidden': hidden || undefined,
    className: [
      styles.option,
      isSelected ? styles.optionSelected : '',
      isActive ? styles.optionActive : '',
      disabled ? styles.optionDisabled : '',
    ]
      .filter(Boolean)
      .join(' '),
    onMouseEnter: setActive,
    onMouseDown: (ev) => ev.preventDefault(),
    onClick: commit,
  };

  const mergedLiProps = mergeProps(liProps, ourLiProps);

  return (
    <li
      {...mergedLiProps}
      data-option-id={domId}
      data-part="option"
      data-selected={isSelected || undefined}
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      data-hidden={hidden || undefined}
    >
      {children}
    </li>
  );
});
