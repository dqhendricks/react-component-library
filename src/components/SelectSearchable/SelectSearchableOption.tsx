import React, { useCallback, useEffect, useId, useMemo } from "react";
import styles from "./SelectSearchable.module.css";
import {
  useSelectSearchableStoreContext,
  useSelectSearchableStore,
} from "./SelectSearchableStoreContext";
import { mergeProps } from "./mergeProps";

type LiProps = React.ComponentPropsWithoutRef<"li">;

export type SelectSearchableOptionProps = React.PropsWithChildren<
  Omit<
    LiProps,
    | "role"
    | "aria-selected"
    | "aria-disabled"
    | "aria-hidden"
    | "hidden"
    | "ref"
  > & {
    value: string;
    disabled?: boolean;
  }
>;

function asArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}

export function SelectSearchableOption({
  value,
  disabled = false,
  children,
  id: userId,
  ...userProps
}: SelectSearchableOptionProps) {
  const reactId = useId();
  const optionId = userId ?? `cs-opt-${reactId}`;

  const store = useSelectSearchableStoreContext();

  const selectedValue = useSelectSearchableStore(store, (s) => s.value);
  const isActive = useSelectSearchableStore(store, (s) => s.activeDescendantId === optionId);
  const isVisible = useSelectSearchableStore(store, (s) => s.visibleIds.has(optionId));

  const label = useMemo(() => (typeof children === "string" ? children : value), [children, value]);

  useEffect(() => {
    // IMPORTANT: this assumes store keys == DOM ids (optionId).
    // This is true as long as optionId is stable+unique.
    return store.registerOption({ id: optionId, value, label, disabled });
  }, [store, optionId, value, label, disabled]);

  const setNodeRef = useCallback(
    (el: HTMLLIElement | null) => {
      store.updateOptionNode(optionId, el);
    },
    [store, optionId],
  );

  const isSelected = useMemo(() => asArray(selectedValue).includes(value), [selectedValue, value]);

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

  const ourProps: LiProps = {
    id: optionId,
    role: "option",
    "aria-selected": isSelected,
    "aria-disabled": disabled || undefined,
    hidden,
    "aria-hidden": hidden || undefined,
    className: [
      styles.option,
      isSelected ? styles.optionSelected : "",
      isActive ? styles.optionActive : "",
      disabled ? styles.optionDisabled : "",
    ]
      .filter(Boolean)
      .join(" "),
    onMouseEnter: () => {
      if (!disabled) store.setActiveDescendantId(optionId);
    },
    onMouseDown: (e) => {
      // Default: keep focus on trigger/search
      e.preventDefault();
    },
    onClick: () => {
      commit();
    },
  };

  const merged = mergeProps(userProps as any, ourProps as any);

  return <li
    {...merged}
    data-option-id={optionId}
    ref={setNodeRef}
  >
    {children}
  </li>;
}