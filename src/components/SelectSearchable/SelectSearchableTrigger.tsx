import React, { forwardRef, useCallback, useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableValue,
} from './SelectSearchableStoreContext';
import { useComboboxOwnerProps } from './useComboboxOwnerProps';
import { mergeProps } from '../utils/mergeProps';
import { assignRef } from '../utils/assignRef';

export type SelectSearchableTriggerRenderArgs = {
  value: string; // Use if not multiple
  values: string[]; // Use if multiple
  isOpen: boolean;
  multiple: boolean;
};

export type SelectSearchableTriggerProps = Omit<
  React.ComponentPropsWithoutRef<'button'>,
  | 'id' 
  | 'children'
  | 'type'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-activedescendant'
  | 'aria-label' // controlled by Root
  | 'aria-labeledby' // controlled by Root
  | 'aria-description' // controlled by Root
  | 'aria-describedby' // controlled by Root
  | 'disabled'
  | 'role'
> & {
  children: React.ReactNode | ((args: SelectSearchableTriggerRenderArgs) => React.ReactNode);
};

function toValues(v: SelectSearchableValue): string[] {
  return Array.isArray(v) ? v : v ? [v] : [];
}

export const SelectSearchableTrigger = forwardRef<HTMLButtonElement, SelectSearchableTriggerProps>(
  function SelectSearchableTrigger({ children, ...rest }, ref) {
    const store = useSelectSearchableStoreContext();

    const controlId = useSelectSearchableStore(store, (s) => s.controlId);
    const disabled = useSelectSearchableStore(store, (s) => s.disabled);
    const open = useSelectSearchableStore(store, (s) => s.open);
    const valueUnion = useSelectSearchableStore(store, (s) => s.value);
    const multiple = useSelectSearchableStore(store, (s) => s.multiple);
    const hasSearch = useSelectSearchableStore(store, (s) => s.hasSearch);
    const ariaDescription = useSelectSearchableStore(store, s => s.ariaDescription);
    const ariaDescribedBy = useSelectSearchableStore(store, s => s.ariaDescribedBy);

    const comboboxOwnerProps = useComboboxOwnerProps();
    const triggerOwnsCombobox = !hasSearch;

    const mergedRef = useCallback(
      (el: HTMLButtonElement | null) => {
        store.setTriggerEl(el);
        assignRef(ref, el);
      },
      [store, ref],
    );

    const ourButtonProps: React.ComponentPropsWithoutRef<'button'> = {
      id: controlId,
      type: 'button',
      className: [styles.trigger, disabled ? styles.triggerDisabled : ''].filter(Boolean).join(' '),
      disabled,
      onClick: () => {
        if (disabled) return;
        store.setOpen(!open);
      },
      'aria-description': ariaDescription,
      'aria-describedby': ariaDescribedBy,
    };

    const ownerProps = triggerOwnsCombobox ? comboboxOwnerProps : {};
    const merged = mergeProps(rest, { ...ourButtonProps, ...ownerProps });

    const values = useMemo(() => toValues(valueUnion), [valueUnion]);

    const renderArgs = useMemo(
      () => ({
        value: values[0] ?? '',
        values,
        isOpen: open,
        multiple,
      }),
      [values, open, multiple],
    );

    const content = typeof children === 'function' ? children(renderArgs) : children;

    return (
      <button
        {...merged}
        ref={mergedRef}
        // Consumer styling hooks
        data-part='trigger'
        data-state={open ? 'open' : 'closed'}
      >
        {content}
      </button>
    );
  },
);