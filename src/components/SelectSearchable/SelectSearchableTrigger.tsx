import React, { forwardRef, useCallback, useMemo } from 'react';
import styles from './SelectSearchable.module.css';
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
  type SelectSearchableValue,
} from './SelectSearchableStoreContext';
import { useSelectNavigationKeyDown } from './useSelectNavigationKeyDown';
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
  | 'aria-label'
  | 'aria-labeledby'
  | 'aria-description'
  | 'aria-describedby'
  | 'aria-invalid'
  | 'aria-errormessage'
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

    const labelId = useSelectSearchableStore(store, (s) => s.labelId);
    const triggerId = useSelectSearchableStore(store, (s) => s.triggerId);
    const dropdownId = useSelectSearchableStore(store, (s) => s.dropdownId);
    const listboxId = useSelectSearchableStore(store, (s) => s.listboxId);
    const disabled = useSelectSearchableStore(store, (s) => s.disabled);
    const open = useSelectSearchableStore(store, (s) => s.open);
    const valueUnion = useSelectSearchableStore(store, (s) => s.value);
    const multiple = useSelectSearchableStore(store, (s) => s.multiple);
    const hasLabel = useSelectSearchableStore(store, (s) => s.hasLabel);
    const hasSearch = useSelectSearchableStore(store, (s) => s.hasSearch);
    const ariaLabel = useSelectSearchableStore(store, s => s.ariaLabel);
    const ariaLabelledBy = useSelectSearchableStore(store, s => s.ariaLabelledBy);
    const ariaDescription = useSelectSearchableStore(store, s => s.ariaDescription);
    const ariaDescribedBy = useSelectSearchableStore(store, s => s.ariaDescribedBy);
    const ariaInvalid = useSelectSearchableStore(store, s => s.ariaInvalid);
    const ariaErrorMessage = useSelectSearchableStore(store, s => s.ariaErrorMessage);
    const activeDescendantId = useSelectSearchableStore(store, s => s.activeDescendantId) ?? undefined;
    const onKeyDown = useSelectNavigationKeyDown();

    const mergedRef = useCallback(
      (el: HTMLButtonElement | null) => {
        store.setTriggerEl(el);
        assignRef(ref, el);
      },
      [store, ref],
    );

    // Process labelled by
    const ariaLabelledByMerged = Array.from(
      new Set([
        hasLabel && labelId,
        ariaLabelledBy,
      ].filter(Boolean))
    ).join(' ') || undefined;

    const ourButtonProps: React.ComponentPropsWithoutRef<'button'> = {
      id: triggerId,
      type: 'button',
      className: [styles.trigger, disabled ? styles.triggerDisabled : ''].filter(Boolean).join(' '),
      disabled,
      onClick: () => {
        if (disabled) return;
        store.setOpen(!open);
      },
      role: hasSearch ? undefined : 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': open,
      'aria-controls': hasSearch ? dropdownId : listboxId,
      'aria-activedescendant': hasSearch ? undefined : activeDescendantId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledByMerged,
      'aria-description': ariaDescription,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-errormessage': ariaErrorMessage,
      onKeyDown,
    };

    const merged = mergeProps(rest, ourButtonProps);

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