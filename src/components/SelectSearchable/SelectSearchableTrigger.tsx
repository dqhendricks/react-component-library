import React, { forwardRef, useCallback } from "react";
import styles from "./SelectSearchable.module.css";
import { useSelectSearchableContext } from "./SelectSearchableContext";
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
    const {
      controlId,
      disabled,
      multiple,
      open,
      setOpen,
      activeDescendantId,
      onTriggerBlur,
      value,
      getOptionByValue,
      setTriggerEl,
      nativeSelectRef,
      hasSearch,
    } = useSelectSearchableContext();

    const comboboxOwnerProps = useComboboxOwnerProps();
    const triggerOwnsCombobox = !hasSearch;

    const mergedRef = useCallback(
      (el: HTMLButtonElement | null) => {
        setTriggerEl(el);
        assignRef(ref, el);
      },
      [setTriggerEl, ref],
    );

    let display: React.ReactNode = children;
    if (display == null) {
      if (Array.isArray(value)) {
        display = value.length ? `${value.length} selected` : placeholder;
      } else if (value != null && value !== "") {
        const v = String(value);
        const fromRegistry = getOptionByValue(v)?.label;
        if (fromRegistry) {
          display = fromRegistry;
        } else {
          const el = nativeSelectRef.current;
          const idx = el?.selectedIndex ?? -1;
          display = (idx >= 0 ? el?.options[idx]?.text : undefined) ?? v;
        }
      } else {
        display = placeholder;
      }
    }

    const ourButtonProps: React.ComponentPropsWithoutRef<"button"> = {
      id: controlId,
      type: "button",
      className: [styles.trigger, disabled ? styles.triggerDisabled : "", className]
        .filter(Boolean)
        .join(" "),
      disabled,
      "aria-disabled": disabled || undefined,
      "aria-multiselectable": multiple || undefined,
      "aria-activedescendant": triggerOwnsCombobox ? (activeDescendantId ?? undefined) : undefined,
      onClick: (e) => {
        if (disabled) return;
        setOpen(!open);
      },
      onBlur: (e) => {
        onTriggerBlur?.(e);
      },
    };

    // Conditionally apply combobox ARIA + nav keys only when trigger owns focus semantics
    const ownerProps = triggerOwnsCombobox ? comboboxOwnerProps : {};

    const merged = mergeProps(
      // user props (include their handlers)
      { ...rest, onClick, onBlur, ref: mergedRef } as any,
      // our props (and owner props if applicable)
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
