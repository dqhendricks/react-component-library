import React, { useCallback } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableValue,
} from './SelectSearchableStoreContext';
import { mergeProps } from '../utils/mergeProps';

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
    value: string;
    disabled?: boolean;
  }
>;

export type SelectSearchableOptionInternalProps = {
  __internalDomId?: string;
};

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
  __internalDomId,
  value,
  disabled,
  children,
  ...liProps
}: SelectSearchableOptionProps & SelectSearchableOptionInternalProps) {
  const store = useSelectSearchableStoreContext();

  if (!__internalDomId) {
    throw new Error(
      'SelectSearchable.Option must be rendered within SelectSearchable.OptionList.',
    );
  }
  const domId = __internalDomId;

  // Subscribe to this option's own derived flags only.
  const isSelected = useSelectSearchableStore(store, (s) =>
    s.multiple
      ? s.selectedValueSet.has(value)
      : s.selectedSingleId === domId,
  );
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
