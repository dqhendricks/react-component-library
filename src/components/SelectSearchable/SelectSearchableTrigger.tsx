import React, { forwardRef, useCallback } from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";
import { useComboboxOwnerProps } from "./useComboboxOwnerProps";
import { mergeProps } from "./mergeProps";

export type SelectSearchableTriggerProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "type" | "aria-haspopup" | "aria-controls" | "aria-expanded" | "aria-activedescendant" | "disabled" | "role"
> & {
  placeholder?: string;
};

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

export const SelectSearchableTrigger = forwardRef<HTMLButtonElement, SelectSearchableTriggerProps>(
  function SelectSearchableTrigger(
    { className, onClick, onBlur, placeholder = "Select…", children, ...rest },
    ref,
  ) {
    const store = useSelectSearchableStoreContext();

    const controlId = useSelectSearchableStore(store, (s) => s.controlId);
    const disabled = useSelectSearchableStore(store, (s) => s.disabled);
    const multiple = useSelectSearchableStore(store, (s) => s.multiple);
    const open = useSelectSearchableStore(store, (s) => s.open);
    const activeDescendantId = useSelectSearchableStore(store, (s) => s.activeDescendantId);
    const value = useSelectSearchableStore(store, (s) => s.value);
    const hasSearch = useSelectSearchableStore(store, (s) => s.hasSearch);
    const nativeSelectEl = useSelectSearchableStore(store, (s) => s.nativeSelectEl);
    const onTriggerBlurInjected = useSelectSearchableStore(store, (s) => s.onTriggerBlur);

    const comboboxOwnerProps = useComboboxOwnerProps();
    const triggerOwnsCombobox = !hasSearch;

    const mergedRef = useCallback(
      (el: HTMLButtonElement | null) => {
        store.setTriggerEl(el);
        assignRef(ref, el);
      },
      [store, ref],
    );

    let display: React.ReactNode = children;
    if (display == null) {
      if (Array.isArray(value)) {
        display = value.length ? `${value.length} selected` : placeholder;
      } else if (value != null && value !== "") {
        const v = String(value);
        const fromRegistry = store.getOptionByValue(v)?.label;

        if (fromRegistry) {
          display = fromRegistry;
        } else {
          const idx = nativeSelectEl?.selectedIndex ?? -1;
          display = (idx >= 0 ? nativeSelectEl?.options[idx]?.text : undefined) ?? v;
        }
      } else {
        display = placeholder;
      }
    }

    const ourButtonProps: React.ComponentPropsWithoutRef<"button"> = {
      id: controlId,
      type: "button",
      className: [styles.trigger, disabled ? styles.triggerDisabled : "", className].filter(Boolean).join(" "),
      disabled,
      "aria-disabled": disabled || undefined,
      "aria-multiselectable": multiple || undefined,
      "aria-activedescendant": triggerOwnsCombobox ? (activeDescendantId ?? undefined) : undefined,
      onClick: () => {
        if (disabled) return;
        store.setOpen(!open);
      },
      onBlur: (e) => {
        onTriggerBlurInjected?.(e);
      },
    };

    const ownerProps = triggerOwnsCombobox ? comboboxOwnerProps : {};

    const merged = mergeProps(
      { ...rest, onClick, onBlur, ref: mergedRef } as any,
      { ...ourButtonProps, ...ownerProps, ref: mergedRef } as any,
    );

    return (
      <button {...merged}>
        <span className={styles.triggerValue}>{display}</span>
        <span className={styles.triggerChevron} aria-hidden="true">
          ▾
        </span>
      </button>
    );
  },
);