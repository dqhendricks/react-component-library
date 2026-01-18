import React, { useEffect, useId, useMemo } from "react";
import styles from "./SelectSearchable.module.css";
import { useSelectSearchableContext } from "./SelectSearchableContext";
import type { SelectSearchableOptionRecord } from "./types";

export type SelectSearchableOptionProps = React.PropsWithChildren<{
  value: string;
  disabled?: boolean;
}>;

export function SelectSearchableOption({ value, disabled = false, children }: SelectSearchableOptionProps) {
  const reactId = useId();
  const optionId = `cs-opt-${reactId}`;

  const {
    multiple,
    value: selectedValue,
    commitValue,
    activeDescendantId,
    setActiveDescendantId,
    registerOption,
    unregisterOption,
    searchQuery,
  } = useSelectSearchableContext();

  const label = useMemo(() => {
    // Allow string children to become the label; otherwise fall back to value.
    return typeof children === "string" ? children : value;
  }, [children, value]);

  // Register/unregister with the root registry for the hidden select + label lookup.
  useEffect(() => {
    const record: SelectSearchableOptionRecord = {
      id: optionId,
      value,
      label,
      disabled,
    };
    registerOption(record);
    return () => unregisterOption(optionId);
  }, [optionId, value, label, disabled, registerOption, unregisterOption]);

  const isSelected = useMemo(() => {
    if (Array.isArray(selectedValue)) {
      return selectedValue.map(String).includes(value);
    }
    return selectedValue != null && String(selectedValue) === value;
  }, [multiple, selectedValue, value]);

  const isMatch = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return String(label).toLowerCase().includes(searchQuery.trim().toLowerCase());
  }, [label, searchQuery]);

  const isActive = activeDescendantId === optionId;

  const commit = () => {
    if (disabled) return;

    if (!multiple) {
      commitValue(value);
      return;
    }

    const current = Array.isArray(selectedValue) ? selectedValue.map(String) : [];
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);

    commitValue(Array.from(set));
  };

  return (
    <li
      id={optionId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      hidden={!isMatch}
      aria-hidden={!isMatch || undefined}
      className={[
        styles.option,
        isSelected ? styles.optionSelected : "",
        isActive ? styles.optionActive : "",
        disabled ? styles.optionDisabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      // Keep activedescendant in sync with pointer navigation
      onMouseEnter={() => {
        if (!disabled) setActiveDescendantId(optionId);
      }}
      // Prevent focus from moving off the trigger/search while clicking options.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => commit()}
    >
      {children}
    </li>
  );
}
