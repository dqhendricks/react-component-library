import React, { useCallback, useEffect, useId, useMemo } from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";

export type SelectSearchableOptionProps = React.PropsWithChildren<{
  value: string;
  disabled?: boolean;
}>;

function asArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

export function SelectSearchableOption({
  value,
  disabled = false,
  children,
}: SelectSearchableOptionProps) {
  const reactId = useId();
  const optionId = `cs-opt-${reactId}`;

  const store = useSelectSearchableStoreContext();

  const selectedValue = useSelectSearchableStore(store, (s) => s.value);
  const isActive = useSelectSearchableStore(store, (s) => s.activeDescendantId === optionId);

  // Visibility is derived once per search term in the store:
  const isVisible = useSelectSearchableStore(store, (s) => s.visibleIds.has(optionId));

  const label = useMemo(() => {
    return typeof children === "string" ? children : value;
  }, [children, value]);

  // Register/unregister (data only; node is wired via ref callback)
  useEffect(() => {
    return store.registerOption({
      id: optionId,
      value,
      label,
      disabled,
    });
  }, [store, optionId, value, label, disabled]);

  // Let the store know our DOM node for scrollIntoView, etc.
  const setNodeRef = useCallback(
    (el: HTMLLIElement | null) => {
      store.updateOptionNode(optionId, el);
    },
    [store, optionId],
  );

  const isSelected = useMemo(() => {
    const current = asArray(selectedValue);
    return current.includes(value);
  }, [selectedValue, value]);

  const commit = useCallback(() => {
    if (disabled) return;

    const s = store.getSnapshot();

    if (!s.multiple) {
      store.commitValue(value as any);
      return;
    }

    const current = asArray(s.value);
    const set = new Set(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);

    store.commitValue(Array.from(set) as any);
  }, [store, disabled, value]);

  const hidden = !isVisible;

  return (
    <li
      ref={setNodeRef}
      id={optionId}
      data-option-id={optionId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      hidden={hidden}
      aria-hidden={hidden || undefined}
      className={[
        styles.option,
        isSelected ? styles.optionSelected : "",
        isActive ? styles.optionActive : "",
        disabled ? styles.optionDisabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => {
        if (!disabled) store.setActiveDescendantId(optionId);
      }}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => commit()}
    >
      {children}
    </li>
  );
}